"""
Algorithm Engine – Application Settings
All config is read from environment variables (or .env file).
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    app_env: str = "development"
    app_port: int = 8090

    # Internal service URLs
    student_service_url: str = "http://localhost:8081"
    hostel_service_url: str = "http://localhost:8082"

    # Postgres (for storing allocation runs/results)
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/algorithm_db"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
