from pydantic import BaseModel
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
	APP_ENV: str = "dev"
	API_PREFIX: str = "/api"
	JWT_SECRET: str = "changeme"
	JWT_ALG: str = "HS256"
	ACCESS_TTL_MIN: int = 15
	REFRESH_TTL_DAYS: int = 30
	DATABASE_URL: str = "sqlite:///./app.db"
	CORS_ORIGINS: List[str] = ["*"]

	class Config:
		env_file = ".env"

settings = Settings()