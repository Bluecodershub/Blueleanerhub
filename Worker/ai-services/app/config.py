from functools import lru_cache
from typing import List, Optional, Dict
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    def __init__(self):
        # Application
        self.app_name = "EdTech AI Services"
        self.app_version = "1.0.0"
        self.debug = str(os.getenv("DEBUG", "True")).lower() == "true"

        # Server
        self.host = os.getenv("HOST", "0.0.0.0")
        self.port = int(os.getenv("PORT", "8000"))

        # Database
        self.database_url = os.getenv(
            "DATABASE_URL",
            "postgresql://edtech_user:REPLACE_WITH_ACTUAL_PASSWORD@localhost:5432/edtech_platform",
        )

        # Redis - don't expose password in constructed URL to prevent logging exposure
        self.redis_host = os.getenv("REDIS_HOST", "localhost")
        self.redis_port = int(os.getenv("REDIS_PORT", "6379"))
        self.redis_password = os.getenv("REDIS_PASSWORD", "")
        self.redis_db = int(os.getenv("REDIS_DB", "0"))
        # Use full REDIS_URL if provided, otherwise construct without password for logging safety
        self.redis_url = os.getenv("REDIS_URL") or (
            f"redis://{':' + self.redis_password + '@' if self.redis_password else ''}"
            f"{self.redis_host}:{self.redis_port}/{self.redis_db}"
        )

        # CORS
        self.allowed_origins = [
            "http://localhost:3000",
            "http://localhost:5000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5000",
        ]

        # Inbuilt local AI model
        self.local_llm_provider = os.getenv("LOCAL_LLM_PROVIDER", "airllm")
        self.local_llm_model = os.getenv(
            "LOCAL_LLM_MODEL",
            "mistralai/Mistral-7B-Instruct-v0.2",
        )

        # Model Paths
        self.models_dir = os.getenv("MODELS_DIR", "data/models")
        self.data_dir = os.getenv("DATA_DIR", "data")

        # ML Settings
        self.max_sequence_length = 512
        self.batch_size = 32
        self.learning_rate = 0.001
        self.epochs = 10
        self.device = os.getenv("DEVICE", "cpu")

        # Model Configuration
        self.question_gen_model = os.getenv("QUESTION_GEN_MODEL", self.local_llm_model)
        self.response_eval_model = os.getenv("RESPONSE_EVAL_MODEL", self.local_llm_model)
        self.code_eval_model = os.getenv("CODE_EVAL_MODEL", "judge0")

        # Cache Settings
        self.cache_ttl = 3600
        self.enable_caching = True

        # JWT - require secret in production, use generated dev secret otherwise
        import secrets

        jwt_env = os.getenv("JWT_SECRET", "")
        if not jwt_env:
            if os.getenv("NODE_ENV") == "production":
                raise ValueError("JWT_SECRET must be set in production")
            jwt_env = f"dev-{secrets.token_hex(32)}"
        self.jwt_secret = jwt_env
        self.jwt_algorithm = "HS256"
        self.jwt_expires_in = 86400

        # Celery
        self.celery_broker_url = (
            f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/1"
        )
        self.celery_result_backend = (
            f"redis://:{self.redis_password}@{self.redis_host}:{self.redis_port}/2"
        )

        # Logging
        self.log_level = os.getenv("LOG_LEVEL", "INFO")
        self.log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
