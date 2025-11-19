import os
import time
import requests
import uuid


def get_base_url() -> str:
    base_url = os.getenv("STAGING_BASE_URL")
    if not base_url:
        raise RuntimeError("STAGING_BASE_URL is not set")
    return base_url.rstrip("/")


def get_or_create_test_student_id(base_url: str) -> int:

    team_resp = requests.post(
        f"{base_url}/teams",
        json={"name": f"{uuid.uuid4()}", "color": "#000000"},
        timeout=5,
    )
    assert team_resp.status_code in (200, 201), (
        f"Failed to create test team: {team_resp.status_code} {team_resp.text}"
    )
    team_id = team_resp.json()["id"]

    student_resp = requests.post(
        f"{base_url}/students",
        json={
            "name": "QAST Test Student",
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


def test_qast001_1_dashboard_load_time_and_structure():
    # Arrange
    # --------
    base_url = get_base_url()
    student_id = get_or_create_test_student_id(base_url)
    url = f"{base_url}/dashboard/students/{student_id}"

    # Act
    # ----
    start = time.perf_counter()
    resp = requests.get(url, timeout=5)
    duration = time.perf_counter() - start

    # Assert
    # -------
    # HTTP 200
    assert resp.status_code == 200, f"Unexpected status {resp.status_code}: {resp.text}"

    data = resp.json()
    assert "student" in data, "No 'student' block in dashboard response"
    assert "teams" in data, "No 'teams' block in dashboard response"
    assert "students" in data, "No 'students' block in dashboard response"
    assert "grades" in data, "No 'grades' block in dashboard response"
    assert "reviewAssignments" in data, "No 'reviewAssignments' block in dashboard response"

    assert data["student"], "Student block is empty"
    assert isinstance(data["teams"], list)
    assert isinstance(data["grades"], list)

    assert duration <= 2.0, f"Dashboard response too slow: {duration:.3f}s (limit 2s)"
