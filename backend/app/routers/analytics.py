"""
Analytics and ML endpoints.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import require_admin
from app.database import get_db
from app.ml.model import retrain_from_db
from app.ml.predictor import predict_final_score, predict_student_next_semester_marks

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics & ML"])


@router.get("/dashboard/overview", summary="Get overview metrics for the dashboard")
def get_dashboard_overview(db: Session = Depends(get_db)):
    return crud.get_dashboard_overview(db)


@router.get("/analytics/subjects", summary="Get subject-wise average performance")
def get_subject_averages(db: Session = Depends(get_db)):
    return crud.get_subject_averages(db)


@router.get(
    "/analytics/batch",
    response_model=list[schemas.BatchStats],
    summary="Compare performance across batches",
)
def batch_comparison(db: Session = Depends(get_db)):
    return crud.get_batch_stats(db)


@router.get("/analytics/semester-comparison", summary="Compare average performance by semester")
def semester_comparison(db: Session = Depends(get_db)):
    return crud.get_semester_comparison(db)


@router.get("/analytics/compare/students", summary="Compare two students side-by-side")
def compare_students(
    student1_enroll: str,
    student2_enroll: str,
    db: Session = Depends(get_db),
):
    student1 = crud.get_student_by_enrollment(db, student1_enroll)
    student2 = crud.get_student_by_enrollment(db, student2_enroll)
    if not student1 or not student2:
        raise HTTPException(status_code=404, detail="One or both students were not found.")

    analytics1 = crud.calculate_student_analytics_dynamic(db, student1.id)
    analytics2 = crud.calculate_student_analytics_dynamic(db, student2.id)
    if not analytics1 or not analytics2:
        raise HTTPException(status_code=404, detail="Marks data missing for one or both students.")

    subjects1 = {item["subject_name"]: item for item in analytics1["subject_breakdown"]}
    subjects2 = {item["subject_name"]: item for item in analytics2["subject_breakdown"]}
    common_subjects = sorted(set(subjects1).intersection(subjects2))
    subject_comparison = [
        {
            "subject_name": subject,
            "student1_pct": subjects1[subject]["percentage"],
            "student2_pct": subjects2[subject]["percentage"],
            "diff": round(subjects1[subject]["percentage"] - subjects2[subject]["percentage"], 2),
        }
        for subject in common_subjects
    ]

    rank1 = analytics1["overall_rank"] or 0
    rank2 = analytics2["overall_rank"] or 0
    return {
        "student1": {
            "name": analytics1["name"],
            "enrollment_no": analytics1["enrollment_no"],
            "batch": analytics1["batch"],
            "branch": analytics1["branch"],
            "overall_average": analytics1["overall_average"],
            "percentage": analytics1["overall_percentage"],
            "rank": rank1,
            "badges": analytics1["badges"],
            "strong_subjects": analytics1["strong_subjects"],
            "weak_subjects": analytics1["weak_subjects"],
        },
        "student2": {
            "name": analytics2["name"],
            "enrollment_no": analytics2["enrollment_no"],
            "batch": analytics2["batch"],
            "branch": analytics2["branch"],
            "overall_average": analytics2["overall_average"],
            "percentage": analytics2["overall_percentage"],
            "rank": rank2,
            "badges": analytics2["badges"],
            "strong_subjects": analytics2["strong_subjects"],
            "weak_subjects": analytics2["weak_subjects"],
        },
        "comparison": {
            "avg_difference": round(analytics1["overall_average"] - analytics2["overall_average"], 2),
            "percentage_difference": round(
                analytics1["overall_percentage"] - analytics2["overall_percentage"],
                2,
            ),
            "rank_difference": rank2 - rank1,
            "consistency_difference": round(
                analytics1["consistency_score"] - analytics2["consistency_score"],
                2,
            ),
            "subjects": subject_comparison,
        },
    }


@router.get("/analytics/admin/cohort", summary="Get cohort-wide risk metrics and stats")
def get_cohort_admin_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    scores = crud.get_student_scores(db)
    at_risk = [
        item for item in scores
        if item["percentage"] < 50 or item["performance_label"] == "Needs Improvement"
    ]
    top_performers = [item for item in scores if item["percentage"] >= 85]
    return {
        **crud.get_dashboard_overview(db),
        "at_risk_count": len(at_risk),
        "at_risk_students": at_risk[:15],
        "top_performers": top_performers[:10],
        "subject_toppers": crud.get_subject_toppers(db),
    }


@router.post(
    "/analytics/admin/refresh-scores",
    summary="Force an immediate recompute of cached student scores/ranks",
)
def refresh_scores_cache(
    current_user: models.User = Depends(require_admin),
):
    """
    Student scores/ranks are cached for a short time (see crud.py) so that
    profile, dashboard, and leaderboard pages don't re-scan the whole
    database on every request. New enrollments/marks are inserted directly
    into the database, so this cache normally just expires on its own
    after crud.SCORES_CACHE_TTL_SECONDS.

    Call this right after a known data load if you don't want to wait for
    that to happen automatically.
    """
    crud.invalidate_scores_cache()
    return {
        "status": "ok",
        "detail": "Scores cache cleared; next request will recompute from the database.",
    }


@router.get("/leaderboard", response_model=list[schemas.LeaderboardEntry], summary="Top students")
def leaderboard(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return crud.get_leaderboard(db, limit=limit)


@router.get(
    "/leaderboard/subject-toppers",
    response_model=list[schemas.SubjectTopper],
    summary="Top scorer for each subject",
)
def subject_toppers(db: Session = Depends(get_db)):
    return crud.get_subject_toppers(db)


@router.get("/analytics", summary="Get analytics summary for all students")
def all_analytics(
    skip: int = Query(0, ge=0),
    limit: int = Query(200, ge=1, le=1000),
    performance_label: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    students = crud.get_all_students(db, skip=skip, limit=limit)
    results = []
    for student in students:
        analytics = crud.calculate_student_analytics_dynamic(db, student.id)
        if not analytics:
            continue
        if performance_label and analytics["performance_label"].lower() != performance_label.lower():
            continue
        results.append(
            {
                "enrollment_no": analytics["enrollment_no"],
                "name": analytics["name"],
                "batch": analytics["batch"],
                "branch": analytics["branch"],
                "avg_marks": analytics["avg_marks"],
                "percentage": analytics["overall_percentage"],
                "performance_label": analytics["performance_label"],
                "strong_subjects": analytics["strong_subjects"],
                "weak_subjects": analytics["weak_subjects"],
                "total_subjects": len(analytics["subject_breakdown"]),
            }
        )
    return results


@router.get("/analytics/{enrollment_no}/predictions", summary="Predict the next missing test for a student")
def get_student_predictions(enrollment_no: str, db: Session = Depends(get_db)):
    student = crud.get_student_by_enrollment(db, enrollment_no)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{enrollment_no}' not found.")

    predictions = predict_student_next_semester_marks(db, student.id)
    if not predictions:
        raise HTTPException(status_code=404, detail="Not enough marks data available for predictions.")
    return predictions


@router.get("/analytics/{enrollment_no}", summary="Get analytics summary for one student")
def get_analytics(enrollment_no: str, db: Session = Depends(get_db)):
    student = crud.get_student_by_enrollment(db, enrollment_no)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{enrollment_no}' not found.")

    analytics = crud.calculate_student_analytics_dynamic(db, student.id)
    if not analytics:
        raise HTTPException(status_code=404, detail="No marks found for this student.")
    return analytics


@router.post("/predict", response_model=schemas.PredictionOutput, summary="Predict T4 from T1/T2/T3")
def predict(payload: schemas.PredictionInput):
    try:
        return predict_final_score(
            t1=payload.t1_marks,
            t2=payload.t2_marks,
            t3=payload.t3_marks,
            subject_name=payload.subject_name,
        )
    except Exception as exc:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction error: {exc}") from exc


@router.post("/predict/retrain", summary="Retrain the ML model using normalized marks")
def retrain(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    try:
        return retrain_from_db(db)
    except Exception as exc:
        logger.exception("Retrain failed")
        raise HTTPException(status_code=500, detail=f"Retrain error: {exc}") from exc
