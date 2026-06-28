"""
Student profile endpoints backed by the normalized schema.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/students", tags=["Students"])


@router.get("/", response_model=list[schemas.StudentOut], summary="List all students")
def list_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    students = crud.get_all_students(db, skip=skip, limit=limit)
    return [crud.student_to_summary(student) for student in students]


@router.get("/search", summary="Search students by name or enrollment number")
def search_student(
    q: str = Query(..., min_length=2),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    matches = [crud.student_to_summary(student) for student in crud.search_students(db, q, limit)]
    if not matches:
        raise HTTPException(status_code=404, detail="No matching student found")
    return {
        "count": len(matches),
        "best_match": matches[0],
        "results": matches,
    }


@router.get("/{enrollment_no}", summary="Get complete student profile with marks and analytics")
def get_student_profile(enrollment_no: str, db: Session = Depends(get_db)):
    student = crud.get_student_by_enrollment(db, enrollment_no)
    if not student and enrollment_no.isdigit():
        student = crud.get_student_by_id(db, int(enrollment_no))
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{enrollment_no}' not found.")

    summary = crud.student_to_summary(student)
    marks = [crud.mark_to_dict(mark) for mark in crud.get_marks_for_student(db, student.id)]
    analytics = crud.calculate_student_analytics_dynamic(db, student.id)

    return {
        **summary,
        "marks": marks,
        "analytics": analytics,
    }


@router.get("/{enrollment_no}/marks", summary="Get all marks for a student")
def get_student_marks(
    enrollment_no: str,
    subject: Optional[str] = Query(None, description="Filter by subject name or subject code"),
    test_type: Optional[str] = Query(None, description="Filter by test name, such as T1/T2/T3/T4"),
    semester: Optional[int] = Query(None, description="Filter by semester number"),
    db: Session = Depends(get_db),
):
    student = crud.get_student_by_enrollment(db, enrollment_no)
    if not student and enrollment_no.isdigit():
        student = crud.get_student_by_id(db, int(enrollment_no))
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{enrollment_no}' not found.")

    result = []
    for mark in crud.get_marks_for_student(db, student.id, semester_number=semester):
        row = crud.mark_to_dict(mark)
        if subject:
            needle = subject.lower()
            if needle not in row["subject_name"].lower() and needle != row["subject_code"].lower():
                continue
        if test_type and row["test_type"].upper() != test_type.upper():
            continue
        result.append(row)
    return result


@router.post(
    "/",
    response_model=schemas.StudentOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a student record",
)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    existing = crud.get_student_by_enrollment(db, student.enrollment_number)
    if existing:
        raise HTTPException(
            status_code=409,
            detail=f"Student '{student.enrollment_number}' already exists.",
        )
    created = crud.create_student(db, student)
    return crud.student_to_summary(created)


@router.put("/{enrollment_no}", response_model=schemas.StudentOut, summary="Update student core fields")
def update_student(
    enrollment_no: str,
    updates: schemas.StudentUpdate,
    db: Session = Depends(get_db),
):
    student = crud.get_student_by_enrollment(db, enrollment_no)
    if not student:
        raise HTTPException(status_code=404, detail=f"Student '{enrollment_no}' not found.")

    payload = updates.model_dump(exclude_none=True)
    if "full_name" in payload:
        student.full_name = payload["full_name"].strip()
    if "branch" in payload:
        student.branch = payload["branch"].strip()

    db.commit()
    db.refresh(student)
    return crud.student_to_summary(student)
