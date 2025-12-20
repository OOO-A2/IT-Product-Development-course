from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.grade import AssignmentLetterEnum


class GradeBase(BaseModel):
    studentId: int
    sprint: int
    assignment: AssignmentLetterEnum
    score: int


class GradeCreate(GradeBase):
    pass


class GradeUpsert(GradeBase):
    id: Optional[int] = None


class GradeRead(GradeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
