"""
Database access and dynamic analytics for the normalized schema.
"""
from __future__ import annotations

import time
from collections import Counter, defaultdict
from statistics import mean, median, pstdev
from typing import Any, Optional

from sqlalchemy import func, or_
from sqlalchemy.orm import Session, joinedload

from app import models, schemas


TEST_ORDER = {"T1": 1, "T2": 2, "T3": 3, "T4": 4}

# ── Lightweight TTL cache for expensive cohort-wide computations ──────────
# get_student_scores() recomputes EVERY student's average from scratch by
# scanning the whole marks table. That's required for ranking, but doing it
# on every single profile view made the app feel slow. We cache the result
# for a short window so repeated requests (e.g. several people viewing
# profiles within the same minute) reuse the same computed cohort scores
# instead of recalculating from scratch each time.
_SCORES_CACHE: dict[Optional[int], tuple[float, list[dict[str, Any]]]] = {}
<<<<<<< HEAD
_SCORES_CACHE_TTL_SECONDS = 60
=======
_SCORES_CACHE_TTL_SECONDS = 300
>>>>>>> 03c6972c9eec3e7829993afbbea3fd5bd0ce3e39


def invalidate_scores_cache() -> None:
    """Call this after marks are added/edited/imported so ranks update immediately."""
    _SCORES_CACHE.clear()


def to_float(value: Any) -> float:
    return float(value or 0)


def to_30_scale(percentage: float) -> float:
    return round((percentage / 100.0) * 30.0, 2)


def percentage(obtained: float, max_marks: float) -> float:
    if max_marks <= 0:
        return 0.0
    return round((obtained / max_marks) * 100.0, 2)


def performance_label(score_percentage: float) -> str:
    if score_percentage >= 90:
        return "Elite"
    if score_percentage >= 80:
        return "Excellent"
    if score_percentage >= 70:
        return "Very Good"
    if score_percentage >= 60:
        return "Good"
    if score_percentage >= 45:
        return "Average"
    return "Needs Improvement"


def subject_status(score_percentage: float) -> str:
    if score_percentage >= 80:
        return "Strong"
    if score_percentage >= 60:
        return "Average"
    return "Weak"


def test_sort_key(test_name: str) -> tuple[int, str]:
    return (TEST_ORDER.get(test_name.upper(), 99), test_name)


def student_to_summary(student: models.Student) -> dict[str, Any]:
    latest = student.latest_student_semester
    semester = latest.semester if latest else None
    return {
        "id": student.id,
        "enrollment_number": student.enrollment_number,
        "enrollment_no": student.enrollment_number,
        "full_name": student.full_name,
        "name": student.full_name,
        "branch": student.branch,
        "batch": latest.batch if latest else None,
        "roll_number": latest.roll_number if latest else None,
        "current_semester": semester.semester_number if semester else None,
        "academic_year": semester.academic_year if semester else None,
        "created_at": student.created_at,
        "updated_at": student.updated_at,
    }


def mark_to_dict(mark: models.Mark) -> dict[str, Any]:
    obtained = to_float(mark.obtained_marks)
    max_marks = int(mark.test.max_marks)
    sem = mark.student_semester.semester
    return {
        "id": mark.id,
        "student_semester_id": mark.student_semester_id,
        "subject_id": mark.subject_id,
        "subject_code": mark.subject.subject_code,
        "subject_name": mark.subject.subject_name,
        "test_id": mark.test_id,
        "test_type": mark.test.test_name,
        "test_name": mark.test.test_name,
        "marks": obtained,
        "obtained_marks": obtained,
        "max_marks": max_marks,
        "percentage": percentage(obtained, max_marks),
        "semester": sem.semester_number,
        "semester_id": sem.id,
        "academic_year": sem.academic_year,
        "batch": mark.student_semester.batch,
        "roll_number": mark.student_semester.roll_number,
        "is_predicted": bool(mark.is_predicted),
        "created_at": mark.created_at,
        "updated_at": mark.updated_at,
    }


def get_student_by_enrollment(db: Session, enrollment_no: str) -> Optional[models.Student]:
    return (
        db.query(models.Student)
        .options(joinedload(models.Student.semesters).joinedload(models.StudentSemester.semester))
        .filter(models.Student.enrollment_number == enrollment_no.strip())
        .first()
    )


def get_student_by_id(db: Session, student_id: int) -> Optional[models.Student]:
    return (
        db.query(models.Student)
        .options(joinedload(models.Student.semesters).joinedload(models.StudentSemester.semester))
        .filter(models.Student.id == student_id)
        .first()
    )


def get_all_students(db: Session, skip: int = 0, limit: int = 200) -> list[models.Student]:
    return (
        db.query(models.Student)
        .options(joinedload(models.Student.semesters).joinedload(models.StudentSemester.semester))
        .order_by(models.Student.enrollment_number)
        .offset(skip)
        .limit(limit)
        .all()
    )


def search_students(db: Session, query: str, limit: int = 10) -> list[models.Student]:
    q = query.strip()
    return (
        db.query(models.Student)
        .options(joinedload(models.Student.semesters).joinedload(models.StudentSemester.semester))
        .filter(
            or_(
                models.Student.enrollment_number.ilike(f"%{q}%"),
                models.Student.full_name.ilike(f"%{q}%"),
            )
        )
        .order_by(models.Student.enrollment_number)
        .limit(limit)
        .all()
    )


def create_student(db: Session, student: schemas.StudentCreate) -> models.Student:
    db_student = models.Student(
        enrollment_number=student.enrollment_number.strip(),
        full_name=student.full_name.strip(),
        branch=student.branch.strip(),
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def get_marks_for_student(
    db: Session,
    student_id: int,
    semester_number: Optional[int] = None,
) -> list[models.Mark]:
    query = (
        db.query(models.Mark)
        .join(models.Mark.student_semester)
        .join(models.StudentSemester.semester)
        .join(models.Mark.subject)
        .join(models.Mark.test)
        .options(
            joinedload(models.Mark.student_semester).joinedload(models.StudentSemester.student),
            joinedload(models.Mark.student_semester).joinedload(models.StudentSemester.semester),
            joinedload(models.Mark.subject).joinedload(models.Subject.semester),
            joinedload(models.Mark.test).joinedload(models.Test.semester),
        )
        .filter(models.StudentSemester.student_id == student_id)
    )
    if semester_number is not None:
        query = query.filter(models.Semester.semester_number == semester_number)

    marks = query.all()
    return sorted(
        marks,
        key=lambda mark: (
            mark.student_semester.semester.semester_number,
            mark.subject.subject_code,
            test_sort_key(mark.test.test_name),
        ),
    )


def get_subject_breakdown(marks: list[models.Mark]) -> list[dict[str, Any]]:
    grouped: dict[tuple[int, int], list[models.Mark]] = defaultdict(list)
    for mark in marks:
        grouped[(mark.student_semester_id, mark.subject_id)].append(mark)

    breakdown: list[dict[str, Any]] = []
    for (_, _), group in grouped.items():
        group.sort(key=lambda mark: test_sort_key(mark.test.test_name))
        first = group[0]
        sem = first.student_semester.semester
        obtained_sum = sum(to_float(mark.obtained_marks) for mark in group)
        max_sum = sum(int(mark.test.max_marks) for mark in group)
        pct = percentage(obtained_sum, max_sum)
        breakdown.append(
            {
                "semester": sem.semester_number,
                "semester_id": sem.id,
                "academic_year": sem.academic_year,
                "subject_id": first.subject_id,
                "subject_code": first.subject.subject_code,
                "subject_name": first.subject.subject_name,
                "credits": first.subject.credits,
                "obtained": round(obtained_sum, 2),
                "max_marks": max_sum,
                "percentage": pct,
                "avg_marks": to_30_scale(pct),
                "status": subject_status(pct),
                "marks": [mark_to_dict(mark) for mark in group],
            }
        )

    return sorted(
        breakdown,
        key=lambda item: (item["semester"], item["subject_code"], item["subject_name"]),
    )


def get_student_scores(
    db: Session,
    semester_number: Optional[int] = None,
) -> list[dict[str, Any]]:
    cache_key = semester_number
    cached = _SCORES_CACHE.get(cache_key)
    if cached and (time.monotonic() - cached[0]) < _SCORES_CACHE_TTL_SECONDS:
        return cached[1]

    scores = _get_student_scores_uncached(db, semester_number)
    _SCORES_CACHE[cache_key] = (time.monotonic(), scores)
    return scores


def _get_student_scores_uncached(
    db: Session,
    semester_number: Optional[int] = None,
) -> list[dict[str, Any]]:
    query = (
        db.query(
            models.Student.id.label("student_id"),
            models.Student.enrollment_number,
            models.Student.full_name,
            models.Student.branch,
            models.StudentSemester.batch,
            models.Semester.semester_number,
            models.Semester.academic_year,
            models.Subject.id.label("subject_id"),
            func.sum(models.Mark.obtained_marks).label("obtained"),
            func.sum(models.Test.max_marks).label("max_marks"),
        )
        .join(models.StudentSemester, models.StudentSemester.student_id == models.Student.id)
        .join(models.Semester, models.Semester.id == models.StudentSemester.semester_id)
        .join(models.Mark, models.Mark.student_semester_id == models.StudentSemester.id)
        .join(models.Subject, models.Subject.id == models.Mark.subject_id)
        .join(models.Test, models.Test.id == models.Mark.test_id)
        .group_by(
            models.Student.id,
            models.Student.enrollment_number,
            models.Student.full_name,
            models.Student.branch,
            models.StudentSemester.batch,
            models.Semester.semester_number,
            models.Semester.academic_year,
            models.Subject.id,
        )
    )
    if semester_number is not None:
        query = query.filter(models.Semester.semester_number == semester_number)

    grouped: dict[int, dict[str, Any]] = {}
    for row in query.all():
        student = grouped.setdefault(
            row.student_id,
            {
                "student_id": row.student_id,
                "enrollment_no": row.enrollment_number,
                "name": row.full_name,
                "branch": row.branch,
                "batch": row.batch,
                "latest_semester": row.semester_number,
                "academic_year": row.academic_year,
                "percentages": [],
            },
        )
        if row.semester_number >= student["latest_semester"]:
            student["batch"] = row.batch
            student["latest_semester"] = row.semester_number
            student["academic_year"] = row.academic_year
        student["percentages"].append(percentage(to_float(row.obtained), to_float(row.max_marks)))

    scores: list[dict[str, Any]] = []
    for student in grouped.values():
        if not student["percentages"]:
            continue
        avg_pct = round(mean(student["percentages"]), 2)
        scores.append(
            {
                **{key: value for key, value in student.items() if key != "percentages"},
                "percentage": avg_pct,
                "avg_marks": to_30_scale(avg_pct),
                "performance_label": performance_label(avg_pct),
            }
        )

    return sorted(scores, key=lambda item: item["percentage"], reverse=True)


def calculate_student_analytics_dynamic(db: Session, student_id: int) -> Optional[dict[str, Any]]:
    student = get_student_by_id(db, student_id)
    if not student:
        return None

    marks = get_marks_for_student(db, student.id)
    if not marks:
        return None

    subject_breakdown = get_subject_breakdown(marks)
    if not subject_breakdown:
        return None

    percentages = [item["percentage"] for item in subject_breakdown]
    overall_pct = round(mean(percentages), 2)
    overall_avg_30 = to_30_scale(overall_pct)
    median_pct = round(median(percentages), 2)
    rounded_percentages = [round(value, 0) for value in percentages]
    mode_pct = Counter(rounded_percentages).most_common(1)[0][0]
    std_dev = round(pstdev(percentages), 2) if len(percentages) > 1 else 0.0

    semester_percentages: dict[int, list[float]] = defaultdict(list)
    for item in subject_breakdown:
        semester_percentages[item["semester"]].append(item["percentage"])

    semester_percentage_avgs = {
        semester: round(mean(values), 2)
        for semester, values in semester_percentages.items()
    }
    semester_averages = {
        str(semester): to_30_scale(avg_pct)
        for semester, avg_pct in sorted(semester_percentage_avgs.items())
    }

    sorted_semesters = sorted(semester_percentage_avgs)
    growth_pct = 0.0
    if len(sorted_semesters) >= 2:
        previous_avg = semester_percentage_avgs[sorted_semesters[-2]]
        current_avg = semester_percentage_avgs[sorted_semesters[-1]]
        growth_pct = round(((current_avg - previous_avg) / previous_avg) * 100, 2) if previous_avg else 0.0

    consistency_score = round(max(0.0, min(100.0, 100.0 - (std_dev * 1.5))), 2)
    status = performance_label(overall_pct)

    strong_subjects = [item["subject_name"] for item in subject_breakdown if item["status"] == "Strong"]
    weak_subjects = [item["subject_name"] for item in subject_breakdown if item["status"] == "Weak"]
    average_subjects = [item["subject_name"] for item in subject_breakdown if item["status"] == "Average"]

    weakest = min(subject_breakdown, key=lambda item: item["percentage"])
    strongest = max(subject_breakdown, key=lambda item: item["percentage"])

    all_scores = get_student_scores(db)
    overall_rank = next(
        (index + 1 for index, item in enumerate(all_scores) if item["student_id"] == student.id),
        None,
    )
    total_cohort = len(all_scores)
    latest = student.latest_student_semester
    batch = latest.batch if latest else None
    batch_scores = [item for item in all_scores if item["batch"] == batch] if batch else []
    batch_rank = next(
        (index + 1 for index, item in enumerate(batch_scores) if item["student_id"] == student.id),
        None,
    )
    class_percentile = (
        round(((total_cohort - overall_rank) / total_cohort) * 100, 2)
        if overall_rank and total_cohort
        else None
    )

    badges = build_badges(
        score_percentage=overall_pct,
        rank=overall_rank or total_cohort,
        total=total_cohort,
        consistency_score=consistency_score,
        growth_percentage=growth_pct,
        subject_breakdown=subject_breakdown,
    )

    recommendations = build_recommendations(weak_subjects, consistency_score, growth_pct)
    semester = latest.semester if latest else None

    return {
        "student_id": student.id,
        "enrollment_no": student.enrollment_number,
        "enrollment_number": student.enrollment_number,
        "name": student.full_name,
        "full_name": student.full_name,
        "batch": batch,
        "roll_number": latest.roll_number if latest else None,
        "branch": student.branch,
        "current_semester": semester.semester_number if semester else None,
        "academic_year": semester.academic_year if semester else None,
        "overall_average": overall_avg_30,
        "avg_marks": overall_avg_30,
        "overall_percentage": overall_pct,
        "median": median_pct,
        "mode": round(mode_pct, 2),
        "std_dev": std_dev,
        "academic_performance_score": overall_pct,
        "performance_status": status,
        "performance_label": status,
        "overall_rank": overall_rank,
        "batch_rank": batch_rank,
        "class_percentile": class_percentile,
        "consistency_score": consistency_score,
        "growth_percentage": growth_pct,
        "strong_subjects": strong_subjects,
        "weak_subjects": weak_subjects,
        "average_subjects": average_subjects,
        "strongest_subject": strongest["subject_name"],
        "weakest_subject": weakest["subject_name"],
        "subject_breakdown": subject_breakdown,
        "semester_averages": semester_averages,
        "semester_percentages": {
            str(semester): avg_pct
            for semester, avg_pct in sorted(semester_percentage_avgs.items())
        },
        "badges": badges,
        "recommendations": recommendations,
    }


def build_badges(
    score_percentage: float,
    rank: int,
    total: int,
    consistency_score: float,
    growth_percentage: float,
    subject_breakdown: list[dict[str, Any]],
) -> list[str]:
    badges: list[str] = []
    if score_percentage >= 90:
        badges.append("Elite Performer")
    elif total and rank <= max(1, int(total * 0.05)):
        badges.append("Top Performer")
    elif score_percentage >= 80:
        badges.append("Excellent")

    if consistency_score >= 85:
        badges.append("Consistent Performer")
    if growth_percentage >= 5:
        badges.append("Fast Improver")
    if any(item["percentage"] >= 95 for item in subject_breakdown):
        badges.append("Subject Expert")
    if 70 <= score_percentage < 80:
        badges.append("Above Average")
    elif 50 <= score_percentage < 70:
        badges.append("Average Performer")
    elif 35 <= score_percentage < 50:
        badges.append("Needs Attention")
    elif score_percentage < 35:
        badges.append("Critical Improvement Required")

    return badges or ["Active Learner"]


def build_recommendations(
    weak_subjects: list[str],
    consistency_score: float,
    growth_percentage: float,
) -> list[str]:
    recommendations = [
        f"Focus revision on {subject}; rebuild fundamentals and solve previous test questions."
        for subject in weak_subjects[:3]
    ]
    if consistency_score < 70:
        recommendations.append("Keep a fixed weekly revision routine to reduce score variation.")
    if growth_percentage < 0:
        recommendations.append("Recent semester performance is declining; review the subjects with the largest drop first.")
    if not recommendations:
        recommendations.append("Maintain the current rhythm and use practice tests to protect your strongest subjects.")
    return recommendations


def get_dashboard_overview(db: Session) -> dict[str, Any]:
    total_students = db.query(func.count(models.Student.id)).scalar() or 0
    total_subjects = db.query(func.count(models.Subject.id)).scalar() or 0
    total_semesters = db.query(func.count(models.Semester.id)).scalar() or 0

    scores = get_student_scores(db)
    avg_marks = round(mean([item["avg_marks"] for item in scores]), 2) if scores else 0.0
    avg_percentage = round(mean([item["percentage"] for item in scores]), 2) if scores else 0.0
    topper = scores[0] if scores else None
    if topper:
        topper = {
            "id": topper["student_id"],
            "enrollment_no": topper["enrollment_no"],
            "name": topper["name"],
            "batch": topper["batch"],
            "branch": topper["branch"],
            "avg_marks": topper["avg_marks"],
            "percentage": topper["percentage"],
            "performance_label": topper["performance_label"],
        }

    return {
        "total_students": total_students,
        "total_subjects": total_subjects,
        "total_semesters": total_semesters,
        "avg_marks": avg_marks,
        "average_percentage": avg_percentage,
        "topper": topper,
    }


def get_subject_averages(db: Session) -> list[dict[str, Any]]:
    rows = (
        db.query(
            models.Subject.id.label("subject_id"),
            models.Subject.subject_code,
            models.Subject.subject_name,
            models.Semester.semester_number,
            func.sum(models.Mark.obtained_marks).label("obtained"),
            func.sum(models.Test.max_marks).label("max_marks"),
            func.count(models.Mark.id).label("total_records"),
        )
        .join(models.Semester, models.Semester.id == models.Subject.semester_id)
        .join(models.Mark, models.Mark.subject_id == models.Subject.id)
        .join(models.Test, models.Test.id == models.Mark.test_id)
        .group_by(
            models.Subject.id,
            models.Subject.subject_code,
            models.Subject.subject_name,
            models.Semester.semester_number,
        )
        .order_by(models.Semester.semester_number, models.Subject.subject_code)
        .all()
    )
    return [
        {
            "subject_id": row.subject_id,
            "subject_code": row.subject_code,
            "subject_name": row.subject_name,
            "semester": row.semester_number,
            "avg_marks": to_30_scale(percentage(to_float(row.obtained), to_float(row.max_marks))),
            "percentage": percentage(to_float(row.obtained), to_float(row.max_marks)),
            "total_records": row.total_records,
        }
        for row in rows
    ]


def get_leaderboard(db: Session, limit: int = 10) -> list[dict[str, Any]]:
    scores = get_student_scores(db)
    result = []
    for rank, item in enumerate(scores[:limit], start=1):
        result.append(
            {
                "rank": rank,
                "enrollment_no": item["enrollment_no"],
                "name": item["name"],
                "batch": item["batch"],
                "branch": item["branch"],
                "avg_marks": item["avg_marks"],
                "percentage": item["percentage"],
                "performance_label": item["performance_label"],
            }
        )
    return result


def get_subject_toppers(db: Session) -> list[dict[str, Any]]:
    rows = (
        db.query(
            models.Subject.id.label("subject_id"),
            models.Subject.subject_code,
            models.Subject.subject_name,
            models.Semester.semester_number,
            models.Student.enrollment_number,
            models.Student.full_name,
            func.sum(models.Mark.obtained_marks).label("obtained"),
            func.sum(models.Test.max_marks).label("max_marks"),
        )
        .join(models.Semester, models.Semester.id == models.Subject.semester_id)
        .join(models.Mark, models.Mark.subject_id == models.Subject.id)
        .join(models.StudentSemester, models.StudentSemester.id == models.Mark.student_semester_id)
        .join(models.Student, models.Student.id == models.StudentSemester.student_id)
        .join(models.Test, models.Test.id == models.Mark.test_id)
        .group_by(
            models.Subject.id,
            models.Subject.subject_code,
            models.Subject.subject_name,
            models.Semester.semester_number,
            models.Student.enrollment_number,
            models.Student.full_name,
        )
        .all()
    )

    toppers_by_subject: dict[int, dict[str, Any]] = {}
    for row in rows:
        pct = percentage(to_float(row.obtained), to_float(row.max_marks))
        current = toppers_by_subject.get(row.subject_id)
        if current is None or pct > current["percentage"]:
            toppers_by_subject[row.subject_id] = {
                "subject_name": row.subject_name,
                "subject_code": row.subject_code,
                "semester": row.semester_number,
                "enrollment_no": row.enrollment_number,
                "name": row.full_name,
                "marks": to_30_scale(pct),
                "percentage": pct,
                "test_type": "Overall",
            }

    return sorted(
        toppers_by_subject.values(),
        key=lambda item: (item["semester"], item["subject_code"]),
    )


def get_batch_stats(db: Session) -> list[dict[str, Any]]:
    scores = get_student_scores(db)
    grouped: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for item in scores:
        if item["batch"]:
            grouped[item["batch"]].append(item)

    results: list[dict[str, Any]] = []
    for batch, items in sorted(grouped.items()):
        avg_marks = round(mean([item["avg_marks"] for item in items]), 2)
        avg_percentage = round(mean([item["percentage"] for item in items]), 2)
        excellent = sum(1 for item in items if item["percentage"] >= 80)
        good = sum(1 for item in items if 60 <= item["percentage"] < 80)
        needs = len(items) - excellent - good
        top_student = max(items, key=lambda item: item["percentage"])
        results.append(
            {
                "batch": batch,
                "total_students": len(items),
                "avg_marks": avg_marks,
                "average_percentage": avg_percentage,
                "excellent_count": excellent,
                "good_count": good,
                "needs_improvement_count": needs,
                "top_student": top_student["name"],
            }
        )
    return results


def get_semester_comparison(db: Session) -> list[dict[str, Any]]:
    rows = (
        db.query(
            models.Semester.semester_number,
            models.Semester.academic_year,
            func.sum(models.Mark.obtained_marks).label("obtained"),
            func.sum(models.Test.max_marks).label("max_marks"),
            func.count(models.Mark.id).label("total_records"),
        )
        .join(models.StudentSemester, models.StudentSemester.semester_id == models.Semester.id)
        .join(models.Mark, models.Mark.student_semester_id == models.StudentSemester.id)
        .join(models.Test, models.Test.id == models.Mark.test_id)
        .group_by(models.Semester.semester_number, models.Semester.academic_year)
        .order_by(models.Semester.semester_number)
        .all()
    )
    return [
        {
            "semester": row.semester_number,
            "academic_year": row.academic_year,
            "avg_marks": to_30_scale(percentage(to_float(row.obtained), to_float(row.max_marks))),
            "percentage": percentage(to_float(row.obtained), to_float(row.max_marks)),
            "total_records": row.total_records,
        }
        for row in rows
    ]