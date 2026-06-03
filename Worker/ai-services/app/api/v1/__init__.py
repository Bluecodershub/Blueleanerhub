"""
API v1 routes for EdTech AI Services.
Contains all versioned API endpoints.
"""

from app.api.v1 import quiz, hackathon, interview, chat

__all__ = [
    "quiz",
    "hackathon",
    "interview",
    "chat",
]
