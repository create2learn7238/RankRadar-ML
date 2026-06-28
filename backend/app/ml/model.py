"""
model.py – Train and persist the best ML regressor for marks prediction.
Trains and compares: Linear Regression, Random Forest, Gradient Boosting, and Extra Trees.
Saves the best model automatically based on R2 Score.
"""
from __future__ import annotations

import logging
import os
import math
from pathlib import Path
from typing import Optional, Tuple, Dict, Any

import joblib
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, ExtraTreesRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

logger = logging.getLogger(__name__)

# Paths
_HERE       = Path(__file__).parent
MODEL_PATH  = _HERE / "marks_predictor.pkl"


def build_features(t1: float, t2: float, t3: float) -> np.ndarray:
    """Return a 1×5 feature matrix: [t1, t2, t3, mean(t1,t2,t3), std(t1,t2,t3)]"""
    vals = [t1, t2, t3]
    mean = np.mean(vals)
    std  = np.std(vals)
    return np.array([[t1, t2, t3, mean, std]])


def _generate_synthetic_data(n: int = 2000) -> tuple:
    """Generate realistic mock mark distributions for training."""
    rng = np.random.default_rng(42)
    t1  = rng.uniform(5, 25, n) # scaled to 25
    t2  = rng.uniform(5, 25, n)
    t3  = rng.uniform(5, 25, n)

    # T4 final score: weightage (T4 is typically out of 50 in pattern, let's scale target to 50)
    # T4 final ≈ 2 * weighted average of T1/T2/T3 + noise
    weighted_avg = (0.25 * t1 + 0.30 * t2 + 0.45 * t3)
    final = 2.0 * weighted_avg + rng.normal(0, 1.5, n)
    final = np.clip(final, 0, 50)

    X = np.column_stack([t1, t2, t3, (t1 + t2 + t3) / 3, np.std(np.column_stack([t1, t2, t3]), axis=1)])
    y = final
    return X, y


def train_model(X=None, y=None) -> Pipeline:
    """Train multiple models, compare them, and save the best one."""
    if X is None or y is None:
        logger.info("Training on synthetic data...")
        X, y = _generate_synthetic_data()

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Define the 4 candidate models
    candidates = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(random_state=42),
        "Extra Trees": ExtraTreesRegressor(n_estimators=100, random_state=42)
    }

    best_name = None
    best_pipeline = None
    best_r2 = -float("inf")
    best_metrics = {}

    logger.info("=== Model Comparison ===")
    for name, regressor in candidates.items():
        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("reg", regressor),
        ])
        pipeline.fit(X_train, y_train)

        # Predict and evaluate
        y_pred = pipeline.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        mse = float(mean_squared_error(y_test, y_pred))
        rmse = float(math.sqrt(mse))
        r2 = float(r2_score(y_test, y_pred))

        logger.info("%s -> R2: %.4f | MAE: %.4f | RMSE: %.4f", name, r2, mae, rmse)

        if r2 > best_r2:
            best_r2 = r2
            best_name = name
            best_pipeline = pipeline
            best_metrics = {"r2": r2, "mae": mae, "rmse": rmse}

    logger.info("Selected Best Model: %s with R2 = %.4f", best_name, best_r2)

    # Save best pipeline
    joblib.dump(best_pipeline, MODEL_PATH)
    # Save a small metadata file describing the model stats
    meta_path = MODEL_PATH.with_suffix(".json")
    with open(meta_path, "w") as f:
        import json
        json.dump({"name": best_name, "metrics": best_metrics}, f)
        
    return best_pipeline


_model: Optional[Pipeline] = None


def get_model() -> Pipeline:
    """Return cached model, training from scratch if not yet persisted."""
    global _model
    if _model is not None:
        return _model
    if MODEL_PATH.exists():
        _model = joblib.load(MODEL_PATH)
        logger.info("Model loaded from %s", MODEL_PATH)
    else:
        _model = train_model()
    return _model


def retrain_from_db(db) -> dict:
    """Pull real marks from the DB, retrain candidate models, select best, and return details."""
    from app.models import Mark, Test

    rows = (
        db.query(Mark)
        .join(Test, Test.id == Mark.test_id)
        .filter(Mark.obtained_marks.isnot(None))
        .all()
    )
    if len(rows) < 20:
        return {"status": "skipped", "reason": "Insufficient data (< 20 marks rows)"}

    from collections import defaultdict
    student_subject: dict = defaultdict(dict)
    for r in rows:
        key = (r.student_semester_id, r.subject_id)
        student_subject[key][r.test.test_name.upper()] = float(r.obtained_marks)

    X_rows, y_rows = [], []
    for marks_by_type in student_subject.values():
        t1 = marks_by_type.get("T1")
        t2 = marks_by_type.get("T2")
        t3 = marks_by_type.get("T3")
        t4 = marks_by_type.get("T4")
        if t1 is not None and t2 is not None and t3 is not None and t4 is not None:
            X_rows.append([t1, t2, t3, np.mean([t1, t2, t3]), np.std([t1, t2, t3])])
            y_rows.append(t4)

    if len(X_rows) < 10:
        return {"status": "skipped", "reason": "Not enough complete T1/T2/T3/T4 records in database"}

    X = np.array(X_rows)
    y = np.array(y_rows)
    
    global _model
    _model = train_model(X, y)

    # Load metadata
    meta_path = MODEL_PATH.with_suffix(".json")
    model_name = "Best Model"
    metrics = {}
    if meta_path.exists():
        with open(meta_path, "r") as f:
            import json
            meta = json.load(f)
            model_name = meta.get("name", model_name)
            metrics = meta.get("metrics", {})

    return {
        "status": "retrained",
        "best_model": model_name,
        "samples": len(X),
        "r2": round(metrics.get("r2", 0.0), 4),
        "mae": round(metrics.get("mae", 0.0), 4),
        "rmse": round(metrics.get("rmse", 0.0), 4)
    }
