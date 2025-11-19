from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import app_settings

engine = create_engine(
    app_settings.DATABASE_URL,
    future=True,
    echo=False,
    connect_args={"check_same_thread": False} if app_settings.DATABASE_URL.startswith("sqlite") else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
