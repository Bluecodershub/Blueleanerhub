"""
API routes for EdTech AI Services.
Contains all endpoint versions and routers.
"""

from fastapi import APIRouter
from app.api import v1
from app.api.v1 import quiz, hackathon, interview, chat, ai_tutor, notebooks, adaptive, bluelearner, ai_review

api_router = APIRouter()

# v1 routes
api_router.include_router(quiz.router,      prefix="/v1")
api_router.include_router(hackathon.router, prefix="/v1")
api_router.include_router(interview.router, prefix="/v1")
api_router.include_router(chat.router,      prefix="/v1")

# AI-assisted submission review (code / assignment / project / capstone / hackathon)
api_router.include_router(ai_review.router, prefix="/v1")

# AI Orchestrator endpoints — all agents accessible via /api/v1/ai/*
api_router.include_router(ai_tutor.router,        prefix="/v1")
api_router.include_router(ai_tutor.search_router, prefix="/v1")

# Study Notebooks — NotebookLM-style AI research assistant
api_router.include_router(notebooks.router, prefix="/v1")
api_router.include_router(adaptive.router, prefix="/v1")

# BlueLearner custom fine-tuned model
api_router.include_router(bluelearner.router, prefix="/v1")

__all__ = [
    "api_router",
    "v1",
]
