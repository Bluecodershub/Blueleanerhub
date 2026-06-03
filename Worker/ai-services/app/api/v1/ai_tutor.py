"""
AI Orchestrator Endpoints
==========================
Exposes all BlueLearnerHub AI agents through a clean FastAPI router.

Endpoints:
  POST /api/v1/ai/tutor           — AI tutoring (context-aware)
  POST /api/v1/ai/quiz/generate   — Quiz generation (uses orchestrator)
  POST /api/v1/ai/hackathon/generate — Auto-generate hackathon
  POST /api/v1/ai/review/code     — Code review for PRs / submissions
  POST /api/v1/ai/path/generate   — Personalized learning path
  POST /api/v1/ai/tutorial/draft  — AI-draft a tutorial (teacher assist)
  POST /api/v1/ai/moderate        — Content moderation
  POST /api/v1/search/semantic    — Semantic search embeddings
  GET  /api/v1/ai/agents          — List available agents
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.ai_orchestrator import ai

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["AI Orchestrator"])


# ─────────────────────────────────────────────────────────────────────────────
# REQUEST / RESPONSE SCHEMAS
# ─────────────────────────────────────────────────────────────────────────────

class TutorRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    context: Dict[str, Any] = Field(default_factory=dict)


class QuizGenRequest(BaseModel):
    topic:      str           = Field(..., description="Topic to generate questions about")
    domain:     str           = Field(default="computer_science")
    difficulty: str           = Field(default="medium")
    count:      int           = Field(default=5, ge=1, le=20)


class HackathonGenRequest(BaseModel):
    domain:         str  = Field(default="software")
    duration_hours: int  = Field(default=48, ge=8, le=168)
    level:          str  = Field(default="undergraduate")
    theme_hint:     str  = Field(default="")


class CodeReviewRequest(BaseModel):
    diff:     str           = Field(..., description="Unified diff or code snippet")
    context:  str           = Field(default="pull_request")
    language: Optional[str] = None


class PathGenRequest(BaseModel):
    skills:       List[str] = Field(default_factory=list)
    career_goal:  str       = Field(default="software engineer")
    level:        int       = Field(default=1, ge=1, le=10)
    weak_areas:   List[str] = Field(default_factory=list)


class TutorialDraftRequest(BaseModel):
    topic:      str = Field(..., min_length=3)
    domain:     str = Field(default="programming")
    difficulty: str = Field(default="beginner")
    language:   str = Field(default="python")


class ModerationRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000)
    type:    str = Field(default="question")


class SemanticSearchRequest(BaseModel):
    query:                str   = Field(..., min_length=1)
    content_type:         str   = Field(default="tutorial")
    top_k:                int   = Field(default=5, ge=1, le=50)
    similarity_threshold: float = Field(default=0.75, ge=0.0, le=1.0)


# ─────────────────────────────────────────────────────────────────────────────
# ENDPOINTS
# ─────────────────────────────────────────────────────────────────────────────

def _run(agent: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Shared error wrapper for all agent calls."""
    try:
        return ai.run(agent, data)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Agent {agent} failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI agent encountered an error. Please try again.",
        )


@router.post("/tutor", summary="AI Tutor — context-aware tutoring")
async def ai_tutor(req: TutorRequest):
    return _run("tutor", req.model_dump())


@router.post("/quiz/generate", summary="Generate quiz questions")
async def generate_quiz(req: QuizGenRequest):
    return _run("quiz_generator", req.model_dump())


@router.post("/hackathon/generate", summary="Auto-generate a full hackathon")
async def generate_hackathon(req: HackathonGenRequest):
    return _run("hackathon_generator", req.model_dump())


@router.post("/review/code", summary="AI code review for PRs and submissions")
async def review_code(req: CodeReviewRequest):
    return _run("code_reviewer", req.model_dump())


@router.post("/path/generate", summary="Personalized learning path")
async def generate_path(req: PathGenRequest):
    return _run("path_generator", req.model_dump())


@router.post("/tutorial/draft", summary="AI-draft a tutorial (teacher assist)")
async def draft_tutorial(req: TutorialDraftRequest):
    return _run("tutorial_generator", req.model_dump())


@router.post("/moderate", summary="Moderate Q&A content before publishing")
async def moderate_content(req: ModerationRequest):
    return _run("moderator", req.model_dump())


@router.get("/agents", summary="List all available AI agents")
async def list_agents():
    return {"agents": ai.list_agents()}


# ─────────────────────────────────────────────────────────────────────────────
# SEMANTIC SEARCH — separate prefix for clarity
# ─────────────────────────────────────────────────────────────────────────────

search_router = APIRouter(prefix="/search", tags=["Semantic Search"])


@search_router.post("/semantic", summary="Generate embedding for semantic similarity search")
async def semantic_search(req: SemanticSearchRequest):
    """
    Returns the embedding vector for the query.
    The Node.js backend uses this embedding to query pgvector
    and returns the top-k most similar content items.
    """
    return _run("semantic_search", req.model_dump())
