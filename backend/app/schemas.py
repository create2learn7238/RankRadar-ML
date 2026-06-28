"""
Pydantic schemas for API requests and responses.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import AliasChoices, BaseModel, ConfigDict, Field


class StudentCreate(BaseModel):
    enrollment_number: str = Field(
        validation_alias=AliasChoices("enrollment_number", "enrollment_no"),
        max_length=20,
    )
    full_name: str = Field(
        validation_alias=AliasChoices("full_name", "name"),
        max_length=255,
    )
    branch: str = Field(max_length=50)


class StudentUpdate(BaseModel):
    full_name: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("full_name", "name"),
        max_length=255,
    )
    branch: Optional[str] = Field(default=None, max_length=50)


class StudentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    enrollment_number: str
    enrollment_no: str
    full_name: str
    name: str
    branch: str
    batch: Optional[str] = None
    roll_number: Optional[int] = None
    current_semester: Optional[int] = None
    academic_year: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class BatchStats(BaseModel):
    batch: str
    total_students: int
    avg_marks: float
    average_percentage: float
    excellent_count: int
    good_count: int
    needs_improvement_count: int
    top_student: Optional[str] = None


class LeaderboardEntry(BaseModel):
    rank: int
    enrollment_no: str
    name: str
    batch: Optional[str] = None
    branch: Optional[str] = None
    avg_marks: float
    percentage: float
    performance_label: str


class SubjectTopper(BaseModel):
    subject_name: str
    subject_code: Optional[str] = None
    semester: Optional[int] = None
    enrollment_no: str
    name: str
    marks: float
    percentage: float
    test_type: str


class PredictionInput(BaseModel):
    t1_marks: float = Field(..., ge=0, le=50)
    t2_marks: float = Field(..., ge=0, le=50)
    t3_marks: float = Field(..., ge=0, le=50)
    subject_name: Optional[str] = None


class PredictionOutput(BaseModel):
    predicted_final_score: float
    confidence_note: str
    input_avg: float
    subject_name: Optional[str] = None
    max_marks: int = 50


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    enrollment_no: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    password: str
    role: str = "student"
    enrollment_no: Optional[str] = None
