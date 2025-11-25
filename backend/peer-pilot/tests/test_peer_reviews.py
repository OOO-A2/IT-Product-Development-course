# tests/test_peer_reviews.py

from datetime import datetime, timedelta

from app.models.team import Team
from app.models.peer_review import ReviewStatusEnum


def _create_two_teams(db_session):
    team1 = Team(name="Team One", color="#0000FF")
    team2 = Team(name="Team Two", color="#FFFF00")
    db_session.add_all([team1, team2])
    db_session.flush()
    return team1, team2


def test_create_peer_review(client, db_session):
    # Arrange
    # --------
    team1, team2 = _create_two_teams(db_session)
    due_date = (datetime.utcnow() + timedelta(days=7)).isoformat()

    payload = {
        "sprint": 3,
        "reviewingTeamId": team1.id,
        "reviewedTeamId": team2.id,
        "reviewLink": None,
        "status": "pending",
        "submittedAt": None,
        "dueDate": due_date,
    }

    # Act
    # ----
    response = client.post("/peer-reviews/", json=payload)

    # Assert
    # -------
    assert response.status_code == 200 or response.status_code == 201
    data = response.json()
    assert data["sprint"] == 3
    assert data["reviewingTeamId"] == team1.id
    assert data["reviewedTeamId"] == team2.id
    assert data["status"] == "pending"
    assert data["reviewLink"] is None
    assert data["dueDate"] is not None


def test_list_peer_reviews_filtered_by_sprint_and_reviewing_team(client, db_session):
    # Arrange
    # --------
    team1, team2 = _create_two_teams(db_session)
    due_date = datetime.utcnow()

    # Create two peer reviews
    payload1 = {
        "sprint": 1,
        "reviewingTeamId": team1.id,
        "reviewedTeamId": team2.id,
        "reviewLink": "https://example.com/rev1.pdf",
        "status": ReviewStatusEnum.submitted.value,
        "submittedAt": due_date.isoformat(),
        "dueDate": due_date.isoformat(),
    }
    payload2 = {
        "sprint": 2,
        "reviewingTeamId": team2.id,
        "reviewedTeamId": team1.id,
        "reviewLink": "https://example.com/rev2.pdf",
        "status": ReviewStatusEnum.pending.value,
        "submittedAt": None,
        "dueDate": due_date.isoformat(),
    }

    # Use API to create them (so we test POST as well)
    client.post("/peer-reviews/", json=payload1)
    client.post("/peer-reviews/", json=payload2)

    # Act
    # ----
    response = client.get(
        f"/peer-reviews/?sprint=1&reviewing_team_id={team1.id}"
    )

    # Assert
    # -------
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["sprint"] == 1
    assert data[0]["reviewingTeamId"] == team1.id
    assert data[0]["reviewedTeamId"] == team2.id
    assert data[0]["status"] == "submitted"
    assert data[0]["reviewLink"] == "https://example.com/rev1.pdf"
