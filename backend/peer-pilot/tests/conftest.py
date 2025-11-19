# tests/conftest.py

from pathlib import Path
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))
    
from main import web_app
from app.core.db import get_db
from app.models.base import Base  # Declarative Base for all models


# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def prepare_database():
    """
    Create tables once per test session.
    Drop them afterwards.
    """
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """
    New DB session wrapped in a transaction per test.
    After the test finishes, everything is rolled back.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """
    FastAPI TestClient with overridden get_db dependency
    to use our test session.
    """

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    web_app.dependency_overrides[get_db] = override_get_db

    with TestClient(web_app) as c:
        yield c

    web_app.dependency_overrides.clear()
