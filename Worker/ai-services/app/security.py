"""
SECURE FASTAPI CONFIGURATION FOR AI SERVICES
Implements proper CORS, security headers, and validation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from starlette.requests import Request as StarletteRequest
import os
from typing import List
from app.core.logging import logger


def get_allowed_origins() -> List[str]:
    """
    Get list of allowed origins from environment
    Falls back to sensible defaults for development
    """
    origins_str = os.getenv("CORS_ORIGINS", "")
    
    if origins_str:
        # Use explicitly configured origins
        origins = [o.strip() for o in origins_str.split(",") if o.strip()]
    else:
        # Build from individual variables
        origins = []
        
        frontend_url = os.getenv("FRONTEND_URL")
        backend_url = os.getenv("BACKEND_URL")
        
        if frontend_url:
            origins.append(frontend_url)
        if backend_url:
            origins.append(backend_url)
    
    # Add development origins if in development
    if os.getenv("DEBUG", "false").lower() == "true":
        origins.extend([
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:4000",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:3001",
            "http://127.0.0.1:4000",
        ])
    
    # Remove duplicates and empty strings
    origins = list(set([o for o in origins if o]))
    
    if not origins:
        raise ValueError(
            "No CORS origins configured. Set CORS_ORIGINS or FRONTEND_URL environment variable."
        )
    
    logger.info(f"Allowed CORS origins: {origins}")
    return origins


def setup_security_middleware(app: FastAPI):
    """
    Configure all security-related middleware
    """
    
    # Get allowed origins
    allowed_origins = get_allowed_origins()
    
    # ============================================
    # 1. TRUSTED HOST MIDDLEWARE
    # ============================================
    # Only accept requests from known hosts
    trusted_hosts = os.getenv("TRUSTED_HOSTS", "localhost,127.0.0.1").split(",")
    trusted_hosts = [h.strip() for h in trusted_hosts if h.strip()]
    
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=trusted_hosts,
        www_redirect=False,
    )
    
    # ============================================
    # 2. GZIP COMPRESSION
    # ============================================
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    
    # ============================================
    # 3. CORS MIDDLEWARE - SECURE CONFIGURATION
    # ============================================
    # IMPORTANT: This is now restrictive by default
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,          # ✅ Specific origins only
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # ✅ Limited methods
        allow_headers=["Content-Type", "Authorization"],             # ✅ Limited headers
        expose_headers=["Content-Type"],
        max_age=3600,                           # Cache preflight for 1 hour
    )
    
    # ============================================
    # 4. SECURITY RESPONSE HEADERS
    # ============================================
    @app.middleware("http")
    async def add_security_headers(request, call_next):
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Prevent iframe embedding
        response.headers["X-Frame-Options"] = "DENY"
        
        # XSS protection (legacy)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Disable permissions
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' https:; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self';"
        )
        
        # HSTS header (for HTTPS)
        if os.getenv("NODE_ENV") == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # Remove server header
        response.headers.pop("server", None)
        
        return response
    
    # ============================================
    # 5. REQUEST VALIDATION
    # ============================================
    @app.middleware("http")
    async def validate_requests(request: StarletteRequest, call_next):
        """Validate and log requests"""

        # Only allow specific content types for POST/PUT/PATCH
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if content_type and not (
                "application/json" in content_type or
                "multipart/form-data" in content_type or
                "application/x-www-form-urlencoded" in content_type
            ):
                return JSONResponse(
                    status_code=415,
                    content={"detail": "Unsupported Media Type. Use application/json or multipart/form-data"},
                )

        response = await call_next(request)
        return response


def setup_https_redirect(app: FastAPI):
    """Setup HTTPS redirect for production"""

    if os.getenv("NODE_ENV") == "production":
        @app.middleware("http")
        async def https_redirect_middleware(request: StarletteRequest, call_next):
            # Only redirect when behind a trusted proxy that sets X-Forwarded-Proto
            forwarded_proto = request.headers.get("X-Forwarded-Proto", "")
            if forwarded_proto == "http" and request.url.path != "/health":
                https_url = request.url.replace(scheme="https")
                return RedirectResponse(url=str(https_url), status_code=301)

            response = await call_next(request)
            return response


def validate_security_config():
    """Validate that all required security environment variables are set"""
    
    required_vars = [
        "FRONTEND_URL",
        "BACKEND_URL",
        "JWT_SECRET",
        "DATABASE_URL",
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing)}\n"
            f"Please set these in your .env file"
        )
    
    # Warn if using development defaults
    if os.getenv("NODE_ENV") != "production":
        logger.warning("⚠️  Running in development mode. Not recommended for production.")
    
    # Warn if CORS_ORIGINS not set
    if not os.getenv("CORS_ORIGINS"):
        logger.warning("⚠️  CORS_ORIGINS not set. Using FRONTEND_URL and BACKEND_URL.")
    
    if os.getenv("NODE_ENV") == "production" and os.getenv("LOCAL_LLM_PROVIDER") == "stub":
        raise ValueError("LOCAL_LLM_PROVIDER=stub is not allowed in production.")


# Example usage in main.py:
"""
from fastapi import FastAPI
from app.security import setup_security_middleware, setup_https_redirect, validate_security_config

# Validate configuration first
validate_security_config()

# Create app
app = FastAPI(
    title="EdTech AI Services",
    description="Secure AI/ML services",
    version="1.0.0"
)

# Setup security
setup_security_middleware(app)
setup_https_redirect(app)

# Now add your routes...
"""
