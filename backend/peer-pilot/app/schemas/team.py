from typing import Optional

from pydantic import BaseModel, ConfigDict


class TeamBase(BaseModel):
    name: str
    color: str


class TeamCreate(TeamBase):
    pass


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TeamRead(BaseModel):
    id: int
    name: str
    color: str

    model_config = ConfigDict(
        from_attributes=True,
    )
