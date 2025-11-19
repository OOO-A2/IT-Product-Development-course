import enum

from sqlalchemy import Column, Enum, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.models.base import Base


class AssignmentLetterEnum(str, enum.Enum):
    A = "A" # noqa: E741
    R = "R" # noqa: E741
    I = "I" # noqa: E741
    C = "C" # noqa: E741


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
