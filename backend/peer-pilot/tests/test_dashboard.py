# tests/test_dashboard.py

from app.models.team import Team
from app.models.student import Student
from app.models.grade import Grade, AssignmentLetterEnum
from app.models.peer_review import PeerReview, ReviewStatusEnum


def test_get_student_dashboard_basic(client, db_session):
    # Arrange
    # --------
    # Create team
    team = Team(name="Team Alpha", color="#FF0000")
    db_session.add(team)
    db_session.flush()

    # Create student
    student = Student(
        name="John Doe",
        email="john.doe@example.com",
        team_id=team.id,
    )
    db_session.add(student)
    db_session.flush()

    # Create a grade for the student
    grade = Grade(
        student_id=student.id,
        sprint=1,
        assignment=AssignmentLetterEnum.A,
        score=85,
    )
    db_session.add(grade)

    # Create a peer review assignment for the student's team
    peer_review = PeerReview(
        sprint=1,
        reviewing_team_id=team.id,
        reviewed_team_id=team.id,
        review_link="https://example.com/review1.pdf",
        status=ReviewStatusEnum.submitted,
    )
    db_session.add(peer_review)

    db_session.commit()

    # Act
    # ----
    response = client.get(f"/dashboard/students/{student.id}")

    # Assert
    # -------
    assert response.status_code == 200
    data = response.json()

    # Student block
    assert data["student"]["id"] == student.id
    assert data["student"]["name"] == "John Doe"
    assert data["student"]["email"] == "john.doe@example.com"
    assert data["student"]["teamId"] == team.id

    # Teams list contains our team
    team_ids = {t["id"] for t in data["teams"]}
    assert team.id in team_ids

    # Students list contains our student
    student_ids = {s["id"] for s in data["students"]}
    assert student.id in student_ids

    # Grades for the student are returned
    assert len(data["grades"]) == 1
    assert data["grades"][0]["studentId"] == student.id
    assert data["grades"][0]["score"] == 85
    assert data["grades"][0]["assignment"] == "A"

    # Review assignments for the student's team are returned
    assert len(data["reviewAssignments"]) == 1
    assert data["reviewAssignments"][0]["sprint"] == 1
    assert data["reviewAssignments"][0]["reviewingTeamId"] == team.id
    assert data["reviewAssignments"][0]["reviewedTeamId"] == team.id
    assert data["reviewAssignments"][0]["reviewLink"] == "https://example.com/review1.pdf"
