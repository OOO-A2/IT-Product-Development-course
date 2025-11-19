from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.grade import AssignmentLetterEnum


class TeamGradeBase(BaseModel):
    team_id: int = Field(validation_alias="teamId")
    sprint: int
    assignment: AssignmentLetterEnum
    score: int
    comments: Optional[str] = None

    class Config:
        allow_population_by_field_name = True


class TeamGradeCreate(TeamGradeBase):
    pass


class TeamGradeUpdate(BaseModel):
    sprint: Optional[int] = None
    assignment: Optional[AssignmentLetterEnum] = None
    score: Optional[int] = None
    comments: Optional[str] = None

    class Config:
        allow_population_by_field_name = True


class TeamGradeRead(BaseModel):
    id: int
    team_id: int = Field(serialization_alias="teamId")
    sprint: int
    assignment: AssignmentLetterEnum
    score: int
    comments: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True,
    )
