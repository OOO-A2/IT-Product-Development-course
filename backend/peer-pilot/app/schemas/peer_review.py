from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.peer_review import ReviewStatusEnum


class PeerReviewBase(BaseModel):
    sprint: int
    reviewing_team_id: int = Field(validation_alias="reviewingTeamId")
    reviewed_team_id: int = Field(validation_alias="reviewedTeamId")
    review_link: Optional[str] = Field(None, validation_alias="reviewLink")
    status: ReviewStatusEnum = ReviewStatusEnum.pending
    submitted_at: Optional[datetime] = Field(None, validation_alias="submittedAt")
    due_date: Optional[datetime] = Field(None, validation_alias="dueDate")

    class Config:
        allow_population_by_field_name = True


class PeerReviewCreate(PeerReviewBase):
    pass


class PeerReviewUpdate(BaseModel):
    review_link: Optional[str] = Field(None, validation_alias="reviewLink")
    status: Optional[ReviewStatusEnum] = None
    submitted_at: Optional[datetime] = Field(None, validation_alias="submittedAt")
    due_date: Optional[datetime] = Field(None, validation_alias="dueDate")

    class Config:
        allow_population_by_field_name = True


class PeerReviewRead(BaseModel):
    id: int
    sprint: int
    reviewing_team_id: int = Field(serialization_alias="reviewingTeamId")
    reviewed_team_id: int = Field(serialization_alias="reviewedTeamId")
    review_link: Optional[str] = Field(serialization_alias="reviewLink")
    status: ReviewStatusEnum
    submitted_at: Optional[datetime] = Field(serialization_alias="submittedAt")
    due_date: Optional[datetime] = Field(serialization_alias="dueDate")

    model_config = ConfigDict(
        from_attributes=True,
    )
