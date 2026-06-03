from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
import os

from app.config import settings
from app.api import api_router
from app.core.logging import logger
from app.core.database import startup_events, shutdown_events

# AIR LLM provider — loaded once here so the first /chat request is fast.
# To change the model, set LOCAL_LLM_MODEL in your .env file.
# To disable local LLM (e.g. in CI), set LOCAL_LLM_PROVIDER=stub.
from app.ai.airllm_service import get_provider

# BlueLearner fine-tuned model — loaded at startup if enabled.
from app.models.bluelearner_model import get_provider as get_bluelearner_provider


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan events for startup and shutdown
    """
    # Startup
    logger.info("Starting AI Services...")
    logger.info(f"Environment: {settings.debug}")

    # Initialize database connections (PostgreSQL + Redis)
    try:
        await startup_events()
        logger.info("✓ Database connections initialized")
    except Exception as e:
        logger.warning(f"Database initialization issue (service may be degraded): {e}")

    # Warm up the local LLM provider so the first request doesn't time out.
    # The model is loaded once and cached for the lifetime of the process.
    try:
        provider = get_provider()
        logger.info(f"✓ Local LLM provider ready: {provider.provider_name}")
    except Exception as e:
        logger.error(
            f"✗ Local LLM provider failed to load: {e}  "
            "(set LOCAL_LLM_PROVIDER=stub to skip local model loading)"
        )

    # Warm up BlueLearner if enabled (set BLUELEARNER_ENABLED=true)
    try:
        bl_provider = get_bluelearner_provider()
        if bl_provider:
            logger.info(f"✓ BlueLearner provider ready: {bl_provider.provider_name}")
        else:
            logger.info("○ BlueLearner disabled (set BLUELEARNER_ENABLED=true to enable)")
    except Exception as e:
        logger.warning(f"○ BlueLearner not available: {e}")

    yield

    # Shutdown
    logger.info("Shutting down AI Services...")
    await shutdown_events()


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI/ML services for EdTech platform",
    lifespan=lifespan,
)

# Import and setup security middleware
from app.security import (
    setup_security_middleware,
    setup_https_redirect,
    validate_security_config,
)

# Validate security configuration
try:
    validate_security_config()
except ValueError as e:
    logger.warning(f"Security configuration warning: {e}")

# Setup security middleware
setup_security_middleware(app)
setup_https_redirect(app)

# Legacy CORS (kept for compatibility, but overridden by security.py)
# CORS middleware is now handled by security.py with proper origin validation
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Now handled by security.py
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# Request logging middleware
@app.middleware("http")
async def internal_service_auth(request: Request, call_next):
    """Restrict AI API routes to backend-to-worker calls when configured."""
    if request.url.path.startswith("/api/"):
        secret = os.getenv("INTERNAL_SERVICE_SECRET", "")
        if not secret and os.getenv("NODE_ENV") == "production":
            return JSONResponse(
                status_code=500,
                content={"success": False, "error": "Service misconfigured"},
            )
        if secret and request.headers.get("x-internal-service") != secret:
            return JSONResponse(
                status_code=401,
                content={"success": False, "error": "Unauthorized"},
            )

    return await call_next(request)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = time.time()

    logger.info(f"Request: {request.method} {request.url.path}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(f"Response: {response.status_code} - Time: {process_time:.3f}s")

    return response


# Exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc) if settings.debug else None,
        },
    )


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }


# Include API routes
app.include_router(api_router, prefix="/api")


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
