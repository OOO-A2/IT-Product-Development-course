from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base


class UserRole(str, enum.Enum):
    INSTRUCTOR = "instructor"
    STUDENT = "student"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)

    student = relationship("Student")
    team = relationship("Team")
