"""
Configuration settings for the application
"""
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "StudyMate AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # API
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 1 week
    
    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    
    # Redis (for Celery)
    REDIS_URL: str = Field(default="redis://localhost:6379", env="REDIS_URL")
    
    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        env="CORS_ORIGINS"
    )
    
    # OpenAI
    OPENAI_API_KEY: str = Field(..., env="OPENAI_API_KEY")
    OPENAI_MODEL: str = Field(default="gpt-4-turbo-preview", env="OPENAI_MODEL")
    
    # Vector Database (Pinecone)
    PINECONE_API_KEY: Optional[str] = Field(default=None, env="PINECONE_API_KEY")
    PINECONE_ENVIRONMENT: Optional[str] = Field(default=None, env="PINECONE_ENVIRONMENT")
    PINECONE_INDEX_NAME: str = Field(default="studymate-index", env="PINECONE_INDEX_NAME")
    
    # File Storage
    UPLOAD_DIR: str = Field(default="/tmp/uploads", env="UPLOAD_DIR")
    MAX_UPLOAD_SIZE: int = Field(default=100 * 1024 * 1024, env="MAX_UPLOAD_SIZE")  # 100MB
    ALLOWED_EXTENSIONS: List[str] = Field(
        default=["pdf", "docx", "txt", "pptx", "xlsx", "mp4", "webm", "mov"],
        env="ALLOWED_EXTENSIONS"
    )
    
    # AWS S3 (Optional)
    AWS_ACCESS_KEY_ID: Optional[str] = Field(default=None, env="AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = Field(default=None, env="AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = Field(default="us-east-1", env="AWS_REGION")
    S3_BUCKET_NAME: Optional[str] = Field(default=None, env="S3_BUCKET_NAME")
    
    # MinIO (Alternative to S3)
    MINIO_ENDPOINT: Optional[str] = Field(default=None, env="MINIO_ENDPOINT")
    MINIO_ACCESS_KEY: Optional[str] = Field(default=None, env="MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: Optional[str] = Field(default=None, env="MINIO_SECRET_KEY")
    MINIO_BUCKET_NAME: str = Field(default="studymate", env="MINIO_BUCKET_NAME")
    
    # AI Assistance Levels
    AI_ASSISTANCE_LEVELS: dict = {
        "minimal": {
            "name": "Minimal Assistance",
            "description": "Only provides hints and guidance",
            "completion_threshold": 0.2
        },
        "moderate": {
            "name": "Moderate Assistance",
            "description": "Provides explanations and partial solutions",
            "completion_threshold": 0.5
        },
        "full": {
            "name": "Full Assistance",
            "description": "Provides complete solutions with explanations",
            "completion_threshold": 0.8
        },
        "autonomous": {
            "name": "Autonomous Agent",
            "description": "Completes assignments independently",
            "completion_threshold": 1.0
        }
    }
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = Field(default=True, env="RATE_LIMIT_ENABLED")
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")
    
    # Monitoring
    PROMETHEUS_ENABLED: bool = Field(default=False, env="PROMETHEUS_ENABLED")
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings()