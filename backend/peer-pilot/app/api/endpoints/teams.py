import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_instructor, require_student, get_current_user
from app.models.peer_review import PeerReview, PeerReviewStatus
from app.models.team import Team
from app.models.student import Student
from app.models.user import User
from app.schemas.team import TeamCreate, TeamRead, TeamUpdate

router = APIRouter()


@router.get("/", response_model=List[TeamRead])
def list_teams(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Team).all()


@router.get("/{team_id}", response_model=TeamRead)
def get_team(
    team_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    team = db.query(Team).get(team_id)
    if not team:
        raise HTTPException(404, "Team not found")
    return team


@router.post("/", response_model=TeamRead)
def create_team(
    data: TeamCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_instructor),
):
    team = Team(
        name=data.name,
        color=data.color,
        is_locked=data.isLocked,
        project_id=data.projectId,
    )
    db.add(team)
    db.commit()
    db.refresh(team)
    return team


TOTAL_SPRINTS = 8


def maybe_generate_peer_reviews_for_project(db: Session, project_id: int) -> None:
    teams: List[Team] = (
        db.query(Team)
        .order_by(Team.id)
        .all()
    )

    # Если команд меньше двух — ничего не делаем
    if len(teams) < 2:
        return

    # Если есть хотя бы одна незалоченная команда — ещё рано
    if any(not t.is_locked for t in teams):
        return

    team_ids = [t.id for t in teams]

    # 1. Сносим все старые ревью по этому проекту
    db.query(PeerReview).filter(
        or_(
            PeerReview.reviewing_team_id.in_(team_ids),
            PeerReview.reviewed_team_id.in_(team_ids),
        )
    ).delete(synchronize_session=False)

    # 2. Генерируем новые ревью на все спринты
    n = len(teams)
    sprints = list(range(1, TOTAL_SPRINTS + 1))

    for sprint in sprints:
        # shift от 1 до n-1, чтобы не было self-review
        shift = (sprint % (n - 1)) + 1 if n > 1 else 0

        for idx, reviewing_team in enumerate(teams):
            reviewed_team = teams[(idx + shift) % n]

            review = PeerReview(
                sprint=sprint,
                reviewing_team_id=reviewing_team.id,
                reviewed_team_id=reviewed_team.id,
                status=PeerReviewStatus.PENDING,
                reviewed_team_report_link=None,
                summary_pdf_link=None,
                comments_pdf_link=None,
                submitted_at=None,
                due_date=None,
                assigned_work=None,
                suggested_grades=None,
                review_grade=None,
            )
            db.add(review)


@router.patch("/{team_id}", response_model=TeamRead)
def update_team(
    team_id: int,
    data: TeamUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    team = db.query(Team).get(team_id)
    if not team:
        raise HTTPException(404, "Team not found")

    # запомним, была ли команда залочена ДО изменений
    was_locked_before = team.is_locked

    # если студент — разрешаем менять только name, и только если он реп
    if current_user.role == "student":
        student = (
            db.query(Student)
            .filter(Student.id == current_user.student_id)
            .first()
        )
        if not student or student.team_id != team_id or not student.is_rep:
            raise HTTPException(403, "Only representative can rename team")

        update_fields = data.model_dump(exclude_unset=True)
        allowed = {"name"}
        for f in list(update_fields.keys()):
            if f not in allowed:
                update_fields.pop(f)
    else:
        update_fields = data.model_dump(exclude_unset=True)

    # применяем изменения к Team
    for field, value in update_fields.items():
        attr = {
            "isLocked": "is_locked",
        }.get(field, field)
        setattr(team, attr, value)

    # фиксируем изменения в сессии, чтобы следующий запрос видел актуальное is_locked
    db.flush()

    # если команда только что стала залоченной (до этого не была)
    if not was_locked_before and team.is_locked:
        # пробуем сгенерировать peer-reviews для проекта,
        # если это был "последний lock"
        maybe_generate_peer_reviews_for_project(db, project_id=team.project_id)

    # окончательно сохраняем все изменения (и Team, и PeerReview)
    db.commit()
    db.refresh(team)

    return team