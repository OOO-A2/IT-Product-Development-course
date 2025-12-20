from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    max_teams = Column(Integer, nullable=False)
    max_students_per_team = Column(Integer, nullable=False)

    teams = relationship("Team", back_populates="project", cascade="all, delete-orphan")
