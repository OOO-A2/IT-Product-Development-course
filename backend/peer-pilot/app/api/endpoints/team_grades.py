from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.team_grade import TeamGrade
from app.schemas.team_grade import TeamGradeRead, TeamGradeCreate, TeamGradeUpdate

router = APIRouter()


@router.get("/", response_model=List[TeamGradeRead])
def list_team_grades(
    team_id: Optional[int] = None,
    sprint: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(TeamGrade)
    if team_id is not None:
        query = query.filter(TeamGrade.team_id == team_id)
    if sprint is not None:
        query = query.filter(TeamGrade.sprint == sprint)
    return query.all()


@router.post("/", response_model=TeamGradeRead)
def create_team_grade(team_grade_in: TeamGradeCreate, db: Session = Depends(get_db)):
    team_grade = TeamGrade(
        team_id=team_grade_in.team_id,
        sprint=team_grade_in.sprint,
        assignment=team_grade_in.assignment,
        score=team_grade_in.score,
        comments=team_grade_in.comments,
    )
    db.add(team_grade)
    db.commit()
    db.refresh(team_grade)
    return team_grade


@router.put("/{team_grade_id}", response_model=TeamGradeRead)
def update_team_grade(team_grade_id: int, team_grade_in: TeamGradeUpdate, db: Session = Depends(get_db)):
    team_grade = db.query(TeamGrade).filter(TeamGrade.id == team_grade_id).first()
    if not team_grade:
        return None

    if team_grade_in.sprint is not None:
        team_grade.sprint = team_grade_in.sprint
    if team_grade_in.assignment is not None:
        team_grade.assignment = team_grade_in.assignment
    if team_grade_in.score is not None:
        team_grade.score = team_grade_in.score
    if team_grade_in.comments is not None:
        team_grade.comments = team_grade_in.comments

    db.commit()
    db.refresh(team_grade)
    return team_grade


@router.delete("/{team_grade_id}")
def delete_team_grade(team_grade_id: int, db: Session = Depends(get_db)):
    team_grade = db.query(TeamGrade).filter(TeamGrade.id == team_grade_id).first()
    if not team_grade:
        return {"deleted": False}
    db.delete(team_grade)
    db.commit()
    return {"deleted": True}
