from typing import List

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.student import StudentRead
from app.schemas.team import TeamRead
from app.schemas.grade import GradeRead
from app.schemas.peer_review import PeerReviewRead


class StudentDashboard(BaseModel):
    student: StudentRead
    teams: List[TeamRead]
    students: List[StudentRead]
    grades: List[GradeRead]
    review_assignments: List[PeerReviewRead] = Field(serialization_alias="reviewAssignments")

    model_config = ConfigDict(
        from_attributes=True,
    )
