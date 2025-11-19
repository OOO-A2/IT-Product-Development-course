import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base

class ReviewStatusEnum(str, enum.Enum):
    submitted = "submitted"
    pending = "pending"
    graded = "graded"


class PeerReview(Base):
    __tablename__ = "peer_reviews"

    id = Column(Integer, primary_key=True, index=True)
    sprint = Column(Integer, nullable=False, index=True)

    reviewing_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    reviewed_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)

    review_link = Column(String(512), nullable=True)
    status = Column(
        Enum(ReviewStatusEnum, name="review_status"),
        nullable=False,
        default=ReviewStatusEnum.pending,
        server_default=ReviewStatusEnum.pending.value,
    )

    submitted_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)

    reviewing_team = relationship("Team", foreign_keys=[reviewing_team_id], back_populates="reviewing_peer_reviews")
    reviewed_team = relationship("Team", foreign_keys=[reviewed_team_id], back_populates="reviewed_peer_reviews")
