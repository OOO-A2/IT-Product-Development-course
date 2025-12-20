from fastapi import APIRouter
from app.api.endpoints import students, teams, grades, peer_reviews, team_grades, dashboard, projects, auth

api_router = APIRouter()
api_router.include_router(students.router, prefix="/students", tags=["students"])
api_router.include_router(teams.router, prefix="/teams", tags=["teams"])
api_router.include_router(grades.router, prefix="/grades", tags=["grades"])
api_router.include_router(peer_reviews.router, prefix="/peer-reviews", tags=["peer-reviews"])
api_router.include_router(team_grades.router, prefix="/team-grades", tags=["team-grades"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
