# tests/test_grades.py

from app.models.team import Team
from app.models.student import Student
from app.models.grade import Grade, AssignmentLetterEnum


def _create_student_with_team(db_session):
    team = Team(name="Team Beta", color="#00FF00")
    db_session.add(team)
    db_session.flush()

    student = Student(
        name="Alice",
        email="alice@example.com",
        team_id=team.id,
    )
    db_session.add(student)
    db_session.flush()
    return team, student


def test_create_grade(client, db_session):
    # Arrange
    # --------
    _, student = _create_student_with_team(db_session)

    payload = {
        # Arrange: request body
        "studentId": student.id,
        "sprint": 2,
        "assignment": "R",
        "score": 90,
    }

    # Act
    # ----
    response = client.post("/grades/", json=payload)

    # Assert
    # -------
    assert response.status_code == 200 or response.status_code == 201
    data = response.json()
    assert data["studentId"] == student.id
    assert data["sprint"] == 2
    assert data["assignment"] == "R"
    assert data["score"] == 90


def test_list_grades_filtered_by_student(client, db_session):
    # Arrange
    # --------
    _, student = _create_student_with_team(db_session)

    grade1 = Grade(
        student_id=student.id,
        sprint=1,
        assignment=AssignmentLetterEnum.A,
        score=70,
    )
    grade2 = Grade(
        student_id=student.id,
        sprint=2,
        assignment=AssignmentLetterEnum.I,
        score=95,
    )
    db_session.add_all([grade1, grade2])
    db_session.commit()

    # Act
    # ----
    response = client.get(f"/grades/?student_id={student.id}")

    # Assert
    # -------
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    sprints = {g["sprint"] for g in data}
    assert sprints == {1, 2}


def test_list_grades_filtered_by_student_and_sprint(client, db_session):
    # Arrange
    # --------
    _, student = _create_student_with_team(db_session)

    grade1 = Grade(
        student_id=student.id,
        sprint=1,
        assignment=AssignmentLetterEnum.A,
        score=70,
    )
    grade2 = Grade(
        student_id=student.id,
        sprint=2,
        assignment=AssignmentLetterEnum.I,
        score=95,
    )
    db_session.add_all([grade1, grade2])
    db_session.commit()

    # Act
    # ----
    response = client.get(f"/grades/?student_id={student.id}&sprint=2")

    # Assert
    # -------
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["sprint"] == 2
    assert data[0]["score"] == 95
    assert data[0]["assignment"] == "I"
