from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.student import Student
from app.models.team import Team
from app.models.grade import Grade
from app.models.peer_review import PeerReview
from app.models.user import User
from app.schemas.student import StudentRead
from app.schemas.team import TeamRead
from app.schemas.grade import GradeRead
from app.schemas.peer_review import PeerReviewRead
from app.schemas.dashboard import StudentDashboard  # твой уже существующий

router = APIRouter()


@router.get("/students/{student_id}", response_model=StudentDashboard)
def get_student_dashboard(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    student = db.query(Student).get(student_id)
    if not student:
        raise HTTPException(404, "Student not found")

    teams = db.query(Team).all()
    students = db.query(Student).all()
    grades = db.query(Grade).filter(Grade.student_id == student_id).all()

    # ревью, где его команда reviewer или reviewee
    review_assignments = []
    if student.team_id:
        review_assignments = (
            db.query(PeerReview)
            .filter(
                (PeerReview.reviewing_team_id == student.team_id)
                | (PeerReview.reviewed_team_id == student.team_id)
            )
            .all()
        )

    return StudentDashboard(
        student=StudentRead.model_validate(student),
        teams=[TeamRead.model_validate(t) for t in teams],
        students=[StudentRead.model_validate(s) for s in students],
        grades=[
            GradeRead(
                id=g.id,
                studentId=g.student_id,
                sprint=g.sprint,
                assignment=g.assignment,
                score=g.score,
            )
            for g in grades
        ],
        review_assignments=[PeerReviewRead.model_validate(r) for r in review_assignments],
    )
