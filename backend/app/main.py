"""
FastAPI application entry point.

Run:
    python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.database import engine
from app.routers import analytics, auth, student

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("RankRadar AI backend starting with existing normalized database.")
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection verified.")
    except Exception as exc:
        logger.error("Database connection failed: %s", exc)
        raise

    try:
        from app.ml.model import get_model

        get_model()
        logger.info("ML model ready.")
    except Exception as exc:
        logger.warning("ML model initialization skipped: %s", exc)

    yield

    logger.info("RankRadar AI backend shutting down.")
    engine.dispose()


app = FastAPI(
    title="RankRadar AI Backend",
    description="Normalized student performance APIs for LJ United Network.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(student.router)
app.include_router(analytics.router)


@app.get("/", tags=["Health"], summary="Root health check")
def root():
    return {
        "service": "RankRadar AI Backend",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"], summary="Detailed health check")
def health():
    try:
        with engine.connect() as conn:
            table_counts = {
                "students": conn.execute(text("SELECT COUNT(*) FROM students")).scalar() or 0,
                "semesters": conn.execute(text("SELECT COUNT(*) FROM semesters")).scalar() or 0,
                "subjects": conn.execute(text("SELECT COUNT(*) FROM subjects")).scalar() or 0,
                "tests": conn.execute(text("SELECT COUNT(*) FROM tests")).scalar() or 0,
                "marks": conn.execute(text("SELECT COUNT(*) FROM marks")).scalar() or 0,
            }
        db_status = "connected"
    except Exception as exc:
        db_status = f"error: {exc}"
        table_counts = {}

    from app.ml.model import MODEL_PATH

    model_status = "loaded" if MODEL_PATH.exists() else "not trained"
    return JSONResponse(
        content={
            "database": db_status,
            "ml_model": model_status,
            "tables": table_counts,
            "status": "healthy" if db_status == "connected" else "degraded",
        },
        status_code=200 if db_status == "connected" else 503,
    )
