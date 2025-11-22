from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StudentBase(BaseModel):
    name: str
    email: str
    team_id: int = Field(validation_alias="teamId")

    class Config:
        allow_population_by_field_name = True


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    team_id: Optional[int] = Field(None, validation_alias="teamId")

    class Config:
        allow_population_by_field_name = True


class StudentRead(BaseModel):
    id: int
    name: str
    email: str
    team_id: int = Field(serialization_alias="teamId")

    model_config = ConfigDict(
        from_attributes=True,
    )
