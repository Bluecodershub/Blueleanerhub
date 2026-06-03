"""Central configuration loader used by all services."""

import os
from pathlib import Path
from dotenv import load_dotenv

# automatically load .env from project root if present
dotenv_path = Path(__file__).parent.parent / ".env"
if dotenv_path.exists():
    load_dotenv(dotenv_path)


class Settings:
    NODE_ENV = os.getenv("NODE_ENV", "development")
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

    DATABASE_URL = os.getenv("DATABASE_URL")
    REDIS_URL = os.getenv("REDIS_URL")

    # support Supabase as alternative PostgreSQL provider
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")
    # if DATABASE_URL is not set but SUPABASE_URL is, use it
    if not DATABASE_URL and SUPABASE_URL:
        DATABASE_URL = SUPABASE_URL

    JWT_SECRET = os.getenv("JWT_SECRET")
    JWT_REFRESH_SECRET = os.getenv("JWT_REFRESH_SECRET")

    OPENCLAW_API_KEY = os.getenv("OPENCLAW_API_KEY")

    # AirLLM model path
    AIRLLM_MODEL_PATH = os.getenv("AIRLLM_MODEL_PATH")

    # Telegram bot
    TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

    # SMTP email
    SMTP_HOST = os.getenv("SMTP_HOST")
    # convert port to integer with default and validation
    try:
        SMTP_PORT = int(os.getenv("SMTP_PORT", 25))
    except (TypeError, ValueError):
        raise RuntimeError("Invalid SMTP_PORT environment variable; must be integer")
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

    # CRM storage
    CRM_STORAGE_PATH = os.getenv("CRM_STORAGE_PATH", "sales_system/crm.json")

    # other variables can be added as needed

    def validate(self):
        # check critical secrets in production
        if self.NODE_ENV.lower() == "production":
            if not self.JWT_SECRET or not self.JWT_REFRESH_SECRET:
                raise RuntimeError("JWT_SECRET and JWT_REFRESH_SECRET must be set in production")


settings = Settings()
# perform post-instantiation validation
try:
    settings.validate()
except Exception as e:
    # re-raise with context
    raise
