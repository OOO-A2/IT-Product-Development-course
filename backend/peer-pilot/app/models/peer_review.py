import enum

from sqlalchemy import JSON, Column, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base

class PeerReviewStatus(str, enum.Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    GRADED = "graded"


class PeerReview(Base):
    __tablename__ = "peer_reviews"

    id = Column(Integer, primary_key=True, index=True)
    sprint = Column(Integer, nullable=False)

    reviewing_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    reviewed_team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)

    reviewed_team_report_link = Column(String, nullable=True)
    summary_pdf_link = Column(String, nullable=True)
    comments_pdf_link = Column(String, nullable=True)

    status = Column(Enum(PeerReviewStatus), default=PeerReviewStatus.PENDING, nullable=False)
    submitted_at = Column(DateTime, nullable=True)
    due_date = Column(DateTime, nullable=True)

    assigned_work = Column(String, nullable=True)

    # JSON: {"assignment": "A", "iteration": 1, "score": 90, ...}
    suggested_grades = Column(JSON, nullable=True)

    review_grade = Column(Integer, nullable=True)

    reviewing_team = relationship(
        "Team",
        foreign_keys=[reviewing_team_id],
        back_populates="reviewing_peer_reviews",
    )
    reviewed_team = relationship(
        "Team",
        foreign_keys=[reviewed_team_id],
        back_populates="reviewed_peer_reviews",
    )