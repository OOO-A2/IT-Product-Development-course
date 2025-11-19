import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.models.base import Base


class AssignmentLetterEnum(str, enum.Enum):
    A = "A"
    R = "R"
    I = "I"
    C = "C"


class Grade(Base):
    __tablename__ = "grades"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, index=True)
    sprint = Column(Integer, nullable=False, index=True)
    assignment = Column(
        Enum(AssignmentLetterEnum, name="assignment_letter"),
        nullable=False,
        index=True,
    )
    score = Column(Integer, nullable=False)

    student = relationship("Student", back_populates="grades")
