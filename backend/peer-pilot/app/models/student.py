from sqlalchemy import Boolean, Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)
    
    is_rep = Column(Boolean, default=False, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True, index=True)

    team = relationship("Team", back_populates="students")
    grades = relationship("Grade", back_populates="student", cascade="all,delete-orphan")
