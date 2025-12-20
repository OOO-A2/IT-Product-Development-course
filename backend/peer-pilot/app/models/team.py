from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base



class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True, index=True)
    color = Column(String(20), nullable=False)

    is_locked = Column(Boolean, default=False, nullable=False)

    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)

    students = relationship("Student", back_populates="team", cascade="all,delete-orphan")
    reviewing_peer_reviews = relationship(
        "PeerReview",
        back_populates="reviewing_team",
        foreign_keys="PeerReview.reviewing_team_id",
    )
    reviewed_peer_reviews = relationship(
        "PeerReview",
        back_populates="reviewed_team",
        foreign_keys="PeerReview.reviewed_team_id",
    )
    team_grades = relationship("TeamGrade", back_populates="team")

    project = relationship("Project", back_populates="teams")
