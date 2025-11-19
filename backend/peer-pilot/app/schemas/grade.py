from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.grade import AssignmentLetterEnum


class GradeBase(BaseModel):
    student_id: int = Field(validation_alias="studentId")
    sprint: int
    assignment: AssignmentLetterEnum
    score: int

    class Config:
        allow_population_by_field_name = True


class GradeCreate(GradeBase):
    pass


class GradeUpdate(BaseModel):
    sprint: Optional[int] = None
    assignment: Optional[AssignmentLetterEnum] = None
    score: Optional[int] = None

    class Config:
        allow_population_by_field_name = True


class GradeRead(BaseModel):
    id: int
    student_id: int = Field(serialization_alias="studentId")
    sprint: int
    assignment: AssignmentLetterEnum
    score: int

    model_config = ConfigDict(
        from_attributes=True,
    )
