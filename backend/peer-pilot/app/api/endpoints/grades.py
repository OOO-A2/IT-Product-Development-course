from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.grade import Grade
from app.schemas.grade import GradeRead, GradeCreate, GradeUpdate

router = APIRouter()


@router.get("/", response_model=List[GradeRead])
def list_grades(
    student_id: Optional[int] = None,
    sprint: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Grade)
    if student_id is not None:
        query = query.filter(Grade.student_id == student_id)
    if sprint is not None:
        query = query.filter(Grade.sprint == sprint)
    return query.all()


@router.post("/", response_model=GradeRead)
def create_grade(grade_in: GradeCreate, db: Session = Depends(get_db)):
    grade = Grade(
        student_id=grade_in.student_id,
        sprint=grade_in.sprint,
        assignment=grade_in.assignment,
        score=grade_in.score,
    )
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


@router.put("/{grade_id}", response_model=GradeRead)
def update_grade(grade_id: int, grade_in: GradeUpdate, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        return None

    if grade_in.sprint is not None:
        grade.sprint = grade_in.sprint
    if grade_in.assignment is not None:
        grade.assignment = grade_in.assignment
    if grade_in.score is not None:
        grade.score = grade_in.score

    db.commit()
    db.refresh(grade)
    return grade


@router.delete("/{grade_id}")
def delete_grade(grade_id: int, db: Session = Depends(get_db)):
    grade = db.query(Grade).filter(Grade.id == grade_id).first()
    if not grade:
        return {"deleted": False}
    db.delete(grade)
    db.commit()
    return {"deleted": True}
