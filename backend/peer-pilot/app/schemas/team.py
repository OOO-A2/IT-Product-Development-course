from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.student import StudentRead


class TeamCreate(BaseModel):
    name: str
    color: Optional[str] = None
    isLocked: bool = False
    projectId: Optional[int] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    isLocked: Optional[bool] = None


class TeamRead(BaseModel):
    id: int
    name: str
    color: Optional[str] = None
    is_locked: bool = Field(..., serialization_alias="isLocked")
    project_id: Optional[int] = Field(None, serialization_alias="projectId")
    students: List[StudentRead] = []

    model_config = ConfigDict(from_attributes=True)