from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models.student import Student
from app.models.grade import Grade
from app.models.peer_review import PeerReview
from app.models.team import Team
from app.schemas.dashboard import StudentDashboard
from app.schemas.student import StudentRead
from app.schemas.team import TeamRead
from app.schemas.grade import GradeRead
from app.schemas.peer_review import PeerReviewRead

router = APIRouter()


@router.get("/students/{student_id}", response_model=StudentDashboard)
def get_student_dashboard(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    teams = db.query(Team).all()
    team_members = db.query(Student).filter(Student.team_id == student.team_id).all()
    grades = db.query(Grade).filter(Grade.student_id == student_id).all()
    review_assignments = (
        db.query(PeerReview)
        .filter(PeerReview.reviewing_team_id == student.team_id)
        .order_by(PeerReview.sprint)
        .all()
    )

    student_read = StudentRead.model_validate(student)
    teams_read = [TeamRead.model_validate(t) for t in teams]
    team_members_read = [StudentRead.model_validate(s) for s in team_members]
    grades_read = [GradeRead.model_validate(g) for g in grades]
    peer_reviews_read = [PeerReviewRead.model_validate(pr) for pr in review_assignments]

    dashboard = StudentDashboard(
        student=student_read,
        teams=teams_read,
        students=team_members_read,
        grades=grades_read,
        review_assignments=peer_reviews_read,
    )
    return dashboard
