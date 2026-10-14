"""
Synchronous SQLAlchemy database setup (psycopg2).
Uses a simple session-per-request pattern with FastAPI dependency injection.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import get_settings

settings = get_settings()

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables on startup (idempotent) and ensure schema is up to date."""
    from app.models import allocation_run, allocation_group  # noqa: F401
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        from sqlalchemy import text
        conn.execute(text("ALTER TABLE allocation_runs ADD COLUMN IF NOT EXISTS year INTEGER;"))
