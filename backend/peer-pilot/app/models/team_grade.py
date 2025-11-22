from sqlalchemy import Column, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base
from app.models.grade import AssignmentLetterEnum


class TeamGrade(Base):
    __tablename__ = "team_grades"

    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False, index=True)
    sprint = Column(Integer, nullable=False, index=True)
    assignment = Column(
        Enum(AssignmentLetterEnum, name="team_assignment_letter"),
        nullable=False,
        index=True,
    )
    score = Column(Integer, nullable=False)
    comments = Column(String(1000), nullable=True)

    team = relationship("Team", back_populates="team_grades")
