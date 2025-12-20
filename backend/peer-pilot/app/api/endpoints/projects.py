# app/api/endpoints/projects.py

import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_instructor, require_student, get_current_user
from app.models.project import Project
from app.models.team import Team
from app.models.student import Student
from app.models.user import User
from app.schemas.project import (
    ProjectCreate,
    ProjectRead,
    ProjectTeamsAssignment,
)

router = APIRouter()

TEAM_COLORS = [
    "bg-indigo-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-sky-500",
    "bg-fuchsia-500",
]

def get_random_team_color() -> str:
    return random.choice(TEAM_COLORS)


@router.post("/", response_model=ProjectRead)
def create_project(
    data: ProjectCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_instructor),
):
    # Создаём проект
    prj = Project(
        name=data.name,
        max_teams=data.maxTeams,
        max_students_per_team=data.maxStudentsPerTeam,
    )
    db.add(prj)
    db.flush()  # получим prj.id без отдельного коммита

    # Сразу создаём нужное число команд, как это делал фронт
    for i in range(1, data.maxTeams + 1):
        team = Team(
            name=f"{data.name} - Team {i}",
            color=get_random_team_color(),
            is_locked=False,
            project_id=prj.id,
        )
        db.add(team)

    db.commit()
    db.refresh(prj)
    return prj


@router.get("/", response_model=List[ProjectRead])
def list_projects(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    # Важно: возвращаем проекты с командами и студентами
    projects = db.query(Project).all()
    return projects


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    prj = db.query(Project).get(project_id)
    if not prj:
        raise HTTPException(404, "Project not found")
    return prj


@router.post("/{project_id}/assign-teams", response_model=ProjectRead)
def assign_teams_to_project(
    project_id: int,
    payload: ProjectTeamsAssignment,
    db: Session = Depends(get_db),
    _: User = Depends(require_instructor),
):
    if payload.projectId != project_id:
        raise HTTPException(400, "projectId mismatch")

    prj = db.query(Project).get(project_id)
    if not prj:
        raise HTTPException(404, "Project not found")

    for t_def in payload.teams:
        team = db.query(Team).get(t_def.id)
        if not team:
            continue
        team.project_id = project_id
        team.name = t_def.name
        team.color = t_def.color

        for s_def in t_def.students:
            student = db.query(Student).get(s_def.id)
            if not student:
                continue
            student.team_id = team.id
            student.is_rep = s_def.isRep

    db.commit()
    db.refresh(prj)
    return prj


@router.post("/{project_id}/join-team", response_model=None)
def join_team(
    project_id: int,
    team_id: int = Query(..., description="ID команды, к которой присоединяемся"),
    as_rep: bool = Query(False, description="Присоединиться как представитель"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    prj = db.query(Project).get(project_id)
    if not prj:
        raise HTTPException(404, "Project not found")

    team = db.query(Team).get(team_id)
    if not team or team.project_id != project_id:
        raise HTTPException(400, "Team does not belong to project")

    # находим студента по user.student_id
    student = db.query(Student).get(current_user.student_id)
    if not student:
        raise HTTPException(400, "User has no linked student")

    # проверяем, не состоит ли студент уже в залоченной команде проекта
    locked_team = (
        db.query(Team)
        .join(Student, Student.team_id == Team.id)
        .filter(
            Team.project_id == project_id,
            Team.is_locked == True,  # noqa: E712
            Student.id == student.id,
        )
        .first()
    )
    if locked_team:
        raise HTTPException(400, "You are already in a locked team for this project")

    # проверка capacity
    if len(team.students) >= prj.max_students_per_team:
        raise HTTPException(400, "Team is full")

    # проверка: команда не должна быть залочена
    if team.is_locked:
        raise HTTPException(400, "Team is locked")

    # проверка: один реп на команду
    if as_rep:
        has_rep = any(s.is_rep for s in team.students)
        if has_rep:
            raise HTTPException(400, "Representative already exists for this team")

    # снимаем студента со всех команд этого проекта
    for t in prj.teams:
        for s in t.students:
            if s.id == student.id:
                s.team_id = None
                s.is_rep = False

    # прикрепляем к выбранной команде
    student.team_id = team.id
    student.is_rep = as_rep

    db.commit()
    return
