import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Automation & Agent Hub"
    API_V1_STR: str = "/api"
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_GEMINI_MODEL: str = os.getenv("DEFAULT_GEMINI_MODEL", "gemini-3.8-flash")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/automation_hub")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-internal-automation-hub-2026")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    LOCAL_LLM_URL: str = os.getenv("LOCAL_LLM_URL", "http://localhost:11434")

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
