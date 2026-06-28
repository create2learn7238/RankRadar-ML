"""
ML inference helpers for normalized marks data.
"""
from __future__ import annotations

import json
import logging
from pathlib import Path
from statistics import mean
from typing import Optional

import numpy as np
from sqlalchemy.orm import Session

from app import crud, models
from app.ml.model import MODEL_PATH, build_features, get_model

logger = logging.getLogger(__name__)


def model_metadata() -> dict:
    meta_path = Path(MODEL_PATH).with_suffix(".json")
    if not meta_path.exists():
        return {"name": "Best Model", "metrics": {}}
    try:
        return json.loads(meta_path.read_text())
    except Exception:
        return {"name": "Best Model", "metrics": {}}


def predict_final_score(
    t1: float,
    t2: float,
    t3: float,
    subject_name: Optional[str] = None,
) -> dict:
    model = get_model()
    score = float(model.predict(build_features(t1, t2, t3))[0])
    score = round(max(0.0, min(50.0, score)), 2)

    input_avg = round((t1 + t2 + t3) / 3.0, 2)
    std = float(np.std([t1, t2, t3]))
    if std < 2.0:
        confidence = "High - consistent performance across tests."
    elif std < 4.5:
        confidence = "Medium - moderate variation across tests."
    else:
        confidence = "Low - high variation; prediction may be less accurate."

    return {
        "predicted_final_score": score*2,
        "confidence_note": confidence,
        "input_avg": input_avg,
        "subject_name": subject_name,
        "max_marks": 50,
    }


def predict_student_next_semester_marks(db: Session, student_id: int) -> Optional[dict]:
    student = crud.get_student_by_id(db, student_id)
    if not student:
        return None

    marks = crud.get_marks_for_student(db, student_id)
    if not marks:
        return None

    tests_by_semester: dict[int, dict[str, models.Test]] = {}
    for test in db.query(models.Test).all():
        tests_by_semester.setdefault(test.semester_id, {})[test.test_name.upper()] = test

    grouped: dict[tuple[int, int], list[models.Mark]] = {}
    for mark in marks:
        grouped.setdefault((mark.student_semester_id, mark.subject_id), []).append(mark)

    predictions: list[dict] = []
    for (_, _), group in grouped.items():
        first = group[0]
        semester = first.student_semester.semester
        tests = {mark.test.test_name.upper(): crud.to_float(mark.obtained_marks) for mark in group}
        target_test = tests_by_semester.get(semester.id, {}).get("T4")

        if not target_test or "T4" in tests:
            continue
        if not all(name in tests for name in ("T1", "T2", "T3")):
            continue

        predicted = predict_final_score(
            tests["T1"],
            tests["T2"],
            tests["T3"],
            first.subject.subject_name,
        )
        predicted_score = min(float(target_test.max_marks), predicted["predicted_final_score"])

        actual_obtained = sum(crud.to_float(mark.obtained_marks) for mark in group)
        actual_max = sum(int(mark.test.max_marks) for mark in group)
        projected_pct = crud.percentage(
            actual_obtained + predicted_score,
            actual_max + int(target_test.max_marks),
        )

        baseline_t4 = (mean([tests["T1"], tests["T2"], tests["T3"]]) / 25.0) * int(target_test.max_marks)
        if predicted_score > baseline_t4 + 2:
            trend = "Improving"
        elif predicted_score < baseline_t4 - 2:
            trend = "Declining"
        else:
            trend = "Stable"

        predictions.append(
            {
                "semester": semester.semester_number,
                "academic_year": semester.academic_year,
                "subject_id": first.subject_id,
                "subject_code": first.subject.subject_code,
                "subject_name": first.subject.subject_name,
                "test_id": target_test.id,
                "test_type": target_test.test_name,
                "predicted_final_score": round(predicted_score, 2),
                "predicted_marks": round(predicted_score, 2),
                "max_marks": int(target_test.max_marks),
                "predicted_percentage": projected_pct,
                "trend": trend,
                "confidence_note": predicted["confidence_note"],
            }
        )

    if not predictions:
        return None

    latest_semester = max(item["semester"] for item in predictions)
    predictions = [item for item in predictions if item["semester"] == latest_semester]
    projected_percentages = [item["predicted_percentage"] for item in predictions]
    predicted_percentage = round(mean(projected_percentages), 2)
    predicted_average = crud.to_30_scale(predicted_percentage)
    meta = model_metadata()
    metrics = meta.get("metrics", {})
    analytics = crud.calculate_student_analytics_dynamic(db, student_id)

    return {
        "student_id": student.id,
        "enrollment_no": student.enrollment_number,
        "name": student.full_name,
        "semester": latest_semester,
        "predicted_average": predicted_average,
        "predicted_percentage": predicted_percentage,
        "predicted_rank": analytics.get("overall_rank") if analytics else None,
        "predicted_badge": crud.performance_label(predicted_percentage),
        "prediction_confidence": "High" if len(predictions) >= 3 else "Medium",
        "model_name": meta.get("name", "Best Model"),
        "model_r2": metrics.get("r2"),
        "model_mae": metrics.get("mae"),
        "model_rmse": metrics.get("rmse"),
        "predictions": predictions,
        "subject_predictions": predictions,
    }
