"""
database.py – SQLAlchemy engine, session factory, and Base declarative.
All models import Base from here; never create a second engine.
"""
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATABASE_URL: str = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. "
        "Copy .env.example → .env and fill in your Neon credentials."
    )

# Neon DB uses SSL by default – add sslmode if not already present
if "sslmode" not in DATABASE_URL:
    connector = "&" if "?" in DATABASE_URL else "?"
    DATABASE_URL = f"{DATABASE_URL}{connector}sslmode=require"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,        # detect stale connections
    pool_recycle=300,          # recycle every 5 min (Neon idles quickly)
    pool_size=5,
    max_overflow=5,
    pool_timeout=10,           # fail fast (10s) instead of hanging when the pool is full
    echo=False,                # set True to log all SQL in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency – yields a DB session, always closes after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
