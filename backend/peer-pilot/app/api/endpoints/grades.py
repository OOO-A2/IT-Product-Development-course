from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user, require_instructor
from app.models.grade import Grade
from app.models.user import User
from app.schemas.grade import GradeRead, GradeUpsert

router = APIRouter()


@router.get("/", response_model=List[GradeRead])
def list_grades(
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Grade)
    if student_id is not None:
        query = query.filter(Grade.student_id == student_id)

    grades = query.all()

    return [
        GradeRead(
            id=g.id,
            studentId=g.student_id,
            sprint=g.sprint,
            assignment=g.assignment,
            score=g.score,
        )
        for g in grades
    ]


@router.put("/", response_model=List[GradeRead])
def upsert_grades(
    grades: List[GradeUpsert],
    db: Session = Depends(get_db),
    _: User = Depends(require_instructor),
):
    result: list[Grade] = []

    for item in grades:
        grade_id = item.id

        if grade_id:
            grade = db.query(Grade).get(grade_id)
            if not grade:
                raise HTTPException(404, f"Grade {grade_id} not found")
        else:
            grade = Grade()
            db.add(grade)

        grade.student_id = item.studentId
        grade.sprint = item.sprint
        grade.assignment = item.assignment.value
        grade.score = item.score

        result.append(grade)

    db.commit()
    for g in result:
        db.refresh(g)

    return [
        GradeRead(
            id=g.id,
            studentId=g.student_id,
            sprint=g.sprint,
            assignment=g.assignment,
            score=g.score,
        )
        for g in result
    ]

@router.post("/", response_model=None, status_code=204)
def save_grades_legacy(
    grades: List[GradeUpsert],
    db: Session = Depends(get_db),
    user: User = Depends(require_instructor),
):
    _ = upsert_grades(grades, db=db, _=user)
    return
