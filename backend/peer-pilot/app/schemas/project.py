from pydantic import BaseModel, ConfigDict, Field
from typing import List
from app.schemas.team import TeamRead
from app.schemas.student import StudentRead


class ProjectCreate(BaseModel):
    name: str
    maxTeams: int = Field(..., ge=1)
    maxStudentsPerTeam: int = Field(..., ge=1)


class ProjectRead(BaseModel):
    id: int
    name: str
    maxTeams: int = Field(..., alias="max_teams")
    maxStudentsPerTeam: int = Field(..., alias="max_students_per_team")
    teams: List[TeamRead] = []

    model_config = ConfigDict(from_attributes=True)


class ProjectTeamStudent(BaseModel):
    id: int
    isRep: bool = False


class ProjectTeamDefinition(BaseModel):
    id: int
    name: str
    color: str | None = None
    students: list[ProjectTeamStudent]


class ProjectTeamsAssignment(BaseModel):
    projectId: int
    teams: list[ProjectTeamDefinition]
