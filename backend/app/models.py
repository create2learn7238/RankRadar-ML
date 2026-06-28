"""
SQLAlchemy ORM models for the normalized student performance database.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    enrollment_number = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False, index=True)
    branch = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    semesters = relationship(
        "StudentSemester",
        back_populates="student",
        cascade="all, delete-orphan",
        order_by="StudentSemester.id",
    )

    @property
    def enrollment_no(self) -> str:
        return self.enrollment_number

    @property
    def name(self) -> str:
        return self.full_name

    @property
    def latest_student_semester(self) -> "StudentSemester | None":
        if not self.semesters:
            return None
        return max(
            self.semesters,
            key=lambda item: (
                item.semester.semester_number if item.semester else -1,
                item.semester.academic_year if item.semester else "",
            ),
        )

    @property
    def batch(self) -> str | None:
        latest = self.latest_student_semester
        return latest.batch if latest else None

    @property
    def roll_number(self) -> int | None:
        latest = self.latest_student_semester
        return latest.roll_number if latest else None

    def __repr__(self) -> str:
        return f"<Student {self.enrollment_number} - {self.full_name}>"


class Semester(Base):
    __tablename__ = "semesters"

    id = Column(Integer, primary_key=True, index=True)
    semester_number = Column(Integer, nullable=False, index=True)
    academic_year = Column(String(10), nullable=False, index=True)

    subjects = relationship("Subject", back_populates="semester", order_by="Subject.subject_code")
    tests = relationship("Test", back_populates="semester", order_by="Test.id")
    student_semesters = relationship("StudentSemester", back_populates="semester")

    def __repr__(self) -> str:
        return f"<Semester {self.semester_number} {self.academic_year}>"


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False, index=True)
    subject_code = Column(String(20), nullable=False, index=True)
    subject_name = Column(String(255), nullable=False, index=True)
    credits = Column(Integer, nullable=False)

    semester = relationship("Semester", back_populates="subjects")
    marks = relationship("Mark", back_populates="subject")
    predictions = relationship("Prediction", back_populates="subject")

    def __repr__(self) -> str:
        return f"<Subject {self.subject_code} - {self.subject_name}>"


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False, index=True)
    test_name = Column(String(10), nullable=False, index=True)
    max_marks = Column(Integer, nullable=False)
    weightage = Column(Numeric(5, 2), nullable=False)

    semester = relationship("Semester", back_populates="tests")
    marks = relationship("Mark", back_populates="test")
    predictions = relationship("Prediction", back_populates="test")

    def __repr__(self) -> str:
        return f"<Test semester={self.semester_id} {self.test_name}>"


class StudentSemester(Base):
    __tablename__ = "student_semester"
    __table_args__ = (
        UniqueConstraint("student_id", "semester_id", name="uq_student_semester"),
    )

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    semester_id = Column(Integer, ForeignKey("semesters.id"), nullable=False, index=True)
    batch = Column(String(10), nullable=False, index=True)
    roll_number = Column(Integer, nullable=False)

    student = relationship("Student", back_populates="semesters")
    semester = relationship("Semester", back_populates="student_semesters")
    marks = relationship("Mark", back_populates="student_semester")
    predictions = relationship("Prediction", back_populates="student_semester")

    def __repr__(self) -> str:
        return f"<StudentSemester student={self.student_id} semester={self.semester_id}>"


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_semester_id = Column(
        Integer,
        ForeignKey("student_semester.id"),
        nullable=False,
        index=True,
    )
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False, index=True)
    obtained_marks = Column(Numeric(6, 2), nullable=False)
    is_predicted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    student_semester = relationship("StudentSemester", back_populates="marks")
    subject = relationship("Subject", back_populates="marks")
    test = relationship("Test", back_populates="marks")

    @property
    def student(self) -> Student:
        return self.student_semester.student

    @property
    def marks(self) -> float:
        return decimal_to_float(self.obtained_marks)

    @property
    def max_marks(self) -> int:
        return int(self.test.max_marks)

    @property
    def test_type(self) -> str:
        return self.test.test_name

    @property
    def semester(self) -> int:
        return self.student_semester.semester.semester_number

    def __repr__(self) -> str:
        return (
            "<Mark student_semester="
            f"{self.student_semester_id} subject={self.subject_id} test={self.test_id}>"
        )


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_semester_id = Column(
        Integer,
        ForeignKey("student_semester.id"),
        nullable=False,
        index=True,
    )
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False, index=True)
    predicted_marks = Column(Numeric(6, 2), nullable=False)
    model_name = Column(String(100), nullable=False)
    confidence = Column(Numeric(5, 4), nullable=True)
    r2_score = Column(Numeric(6, 4), nullable=True)
    mae = Column(Numeric(6, 2), nullable=True)
    rmse = Column(Numeric(6, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student_semester = relationship("StudentSemester", back_populates="predictions")
    subject = relationship("Subject", back_populates="predictions")
    test = relationship("Test", back_populates="predictions")

    def __repr__(self) -> str:
        return f"<Prediction student_semester={self.student_semester_id} subject={self.subject_id}>"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, index=True)
    hashed_password = Column(String(200), nullable=False)
    role = Column(String(20), nullable=False, default="student")
    enrollment_no = Column(String(30), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<User {self.username} role={self.role}>"


def decimal_to_float(value: Decimal | int | float | None) -> float:
    if value is None:
        return 0.0
    return float(value)
