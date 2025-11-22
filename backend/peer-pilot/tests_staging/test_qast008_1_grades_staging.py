import os
import uuid
import requests


def get_base_url() -> str:
    base_url = os.getenv("STAGING_BASE_URL")
    if not base_url:
        raise RuntimeError("STAGING_BASE_URL is not set")
    return base_url.rstrip("/")


def create_test_team_and_student(base_url: str) -> int:
    """
    Создаёт тестовую команду и студента через API и возвращает id студента.
    """
    team_resp = requests.post(
        f"{base_url}/teams",
        json={"name":  f"{uuid.uuid4()}", "color": "#123456"},
        timeout=5,
    )
    assert team_resp.status_code in (200, 201), (
        f"Failed to create test team: {team_resp.status_code} {team_resp.text}"
    )
    team_id = team_resp.json()["id"]

    student_resp = requests.post(
        f"{base_url}/students",
        json={
            "name": "QAST008 Student",
            "email": f"{uuid.uuid4()}@example.com",
            "teamId": team_id,
        },
        timeout=5,
    )
    assert student_resp.status_code in (200, 201), (
        f"Failed to create test student: {student_resp.status_code} {student_resp.text}"
    )
    student_id = student_resp.json()["id"]
    return student_id


def test_qast008_1_final_grade_calculation_regression():
    # Arrange
    # --------
    base_url = get_base_url()
    student_id = create_test_team_and_student(base_url)

    # Готовим "эталонный" набор оценок по одному спринту
    expected_grades = [
        {"assignment": "A", "score": 80},
        {"assignment": "R", "score": 90},
        {"assignment": "I", "score": 100},
        {"assignment": "C", "score": 70},
    ]

    # Создаём оценки через API
    for item in expected_grades:
        resp = requests.post(
            f"{base_url}/grades/",
            json={
                "studentId": student_id,
                "sprint": 1,
                "assignment": item["assignment"],
                "score": item["score"],
            },
            timeout=5,
        )
        assert resp.status_code in (200, 201), (
            f"Failed to create grade: {resp.status_code} {resp.text}"
        )

    # Act
    # ----
    # Забираем все оценки этого студента
    resp = requests.get(
        f"{base_url}/grades/",
        params={"student_id": student_id},
        timeout=5,
    )

    # Assert
    # -------
    assert resp.status_code == 200, f"Unexpected status {resp.status_code}: {resp.text}"
    data = resp.json()
    assert isinstance(data, list), "Expected list of grades in response"

    sprint1_grades = [g for g in data if g.get("sprint") == 1]
    assert len(sprint1_grades) == len(expected_grades), (
        f"Expected {len(expected_grades)} grades for sprint 1, got {len(sprint1_grades)}"
    )

    actual_by_assignment = {
        g["assignment"]: g["score"] for g in sprint1_grades
    }
    for item in expected_grades:
        ass = item["assignment"]
        expected_score = item["score"]
        assert ass in actual_by_assignment, f"Grade for assignment {ass} not found"
        actual_score = actual_by_assignment[ass]
        assert actual_score == expected_score, (
            f"Score mismatch for {ass}: expected {expected_score}, got {actual_score}"
        )

    expected_final = sum(g["score"] for g in expected_grades) / len(expected_grades)
    actual_final = sum(actual_by_assignment.values()) / len(actual_by_assignment)
    assert actual_final == expected_final, (
        f"Final grade aggregation changed: expected {expected_final}, got {actual_final}"
    )
