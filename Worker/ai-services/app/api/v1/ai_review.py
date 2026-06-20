"""
/ai-review endpoint — AI-assisted review of student submissions
================================================================

Exposes POST /api/v1/ai-review. Accepts a code / assignment / project /
capstone / hackathon submission and returns structured, learning-focused
feedback produced by the locally-running model (via app/ai/).

Design rules (aligned with the platform's AI Review Disclaimer policy):
  * The review is ASSISTIVE and preliminary — never the final authority.
  * Scores come only from the model. If the model does not return parseable
    JSON, scores stay null and the raw feedback is surfaced — we never
    fabricate numbers.
  * If the model/provider is unavailable, the endpoint returns 503 with a
    clear "not configured" message. It never returns a fake review.
"""

from __future__ import annotations

import json
import logging
import re
from typing import List, Optional

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.ai.airllm_service import generate_response, get_provider

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ai-review"])

DISCLAIMER = (
    "AI review is for assistance and preliminary evaluation only. Scores may not "
    "always be accurate. A mentor or admin can review and override these results. "
    "This feedback is not final professional advice — verify important outputs."
)

SUBMISSION_TYPES = {"code", "assignment", "project", "capstone", "hackathon"}


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ReviewRequest(BaseModel):
    submission_type: str = Field(
        default="code",
        description="One of: code | assignment | project | capstone | hackathon",
        examples=["code"],
    )
    content: str = Field(
        ...,
        min_length=1,
        max_length=20000,
        description="The submission to review (source code, write-up, or description).",
    )
    language: Optional[str] = Field(
        default=None,
        description="Programming language, when reviewing code (e.g. 'python').",
    )
    context: Optional[str] = Field(
        default=None,
        max_length=4000,
        description="Problem statement, rubric, or assignment brief for grounding.",
    )
    max_new_tokens: Optional[int] = Field(default=1024, ge=128, le=2048)


class ReviewScores(BaseModel):
    overall: Optional[int] = Field(default=None, ge=0, le=100)
    code_quality: Optional[int] = Field(default=None, ge=0, le=100)
    logic: Optional[int] = Field(default=None, ge=0, le=100)
    documentation: Optional[int] = Field(default=None, ge=0, le=100)
    creativity: Optional[int] = Field(default=None, ge=0, le=100)
    completion: Optional[int] = Field(default=None, ge=0, le=100)


class ReviewResponse(BaseModel):
    submission_type: str
    scores: ReviewScores
    strengths: List[str] = []
    weaknesses: List[str] = []
    mistakes: List[str] = []
    suggestions: List[str] = []
    improvement_roadmap: List[str] = []
    summary: str = ""
    structured: bool = Field(
        ...,
        description="True when the model returned parseable JSON; false means summary holds raw feedback.",
    )
    provider: str
    disclaimer: str = DISCLAIMER


# ---------------------------------------------------------------------------
# Prompt + parsing helpers
# ---------------------------------------------------------------------------

def _build_prompt(req: ReviewRequest) -> str:
    lang = f" ({req.language})" if req.language else ""
    context = f"\n\nAssignment / problem context:\n{req.context}" if req.context else ""
    return (
        "You are an experienced software mentor giving a fair, learning-focused "
        f"review of a student's {req.submission_type} submission{lang}.\n"
        "Respond with ONLY a single JSON object, no prose outside it, using this exact shape:\n"
        "{\n"
        '  "scores": {"overall": int, "code_quality": int, "logic": int, '
        '"documentation": int, "creativity": int, "completion": int},  // each 0-100\n'
        '  "strengths": [string],\n'
        '  "weaknesses": [string],\n'
        '  "mistakes": [string],\n'
        '  "suggestions": [string],\n'
        '  "improvement_roadmap": [string],\n'
        '  "summary": string\n'
        "}\n"
        "Be specific and constructive. Base scores on what is actually present."
        f"{context}\n\nSubmission:\n```\n{req.content}\n```\n"
    )


def _extract_json(text: str) -> Optional[dict]:
    """Pull the first balanced JSON object out of model output. None if absent/invalid."""
    start = text.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(text)):
        if text[i] == "{":
            depth += 1
        elif text[i] == "}":
            depth -= 1
            if depth == 0:
                candidate = text[start : i + 1]
                try:
                    return json.loads(candidate)
                except json.JSONDecodeError:
                    # Tolerate trailing commas the model may emit.
                    cleaned = re.sub(r",\s*([}\]])", r"\1", candidate)
                    try:
                        return json.loads(cleaned)
                    except json.JSONDecodeError:
                        return None
    return None


def _as_str_list(value) -> List[str]:
    if isinstance(value, list):
        return [str(v).strip() for v in value if str(v).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _clamp_score(value) -> Optional[int]:
    try:
        n = int(value)
    except (TypeError, ValueError):
        return None
    return max(0, min(100, n))


# ---------------------------------------------------------------------------
# Endpoint
# ---------------------------------------------------------------------------

@router.post(
    "/ai-review",
    response_model=ReviewResponse,
    summary="AI-assisted review of a student submission",
    description=(
        "Returns structured, learning-focused feedback (scores, strengths, "
        "weaknesses, suggestions, improvement roadmap) for a code/assignment/"
        "project/capstone/hackathon submission. Assistive only; a mentor or "
        "admin can override. Returns 503 when the model is not configured."
    ),
)
async def ai_review(request: ReviewRequest) -> ReviewResponse:
    sub_type = request.submission_type.lower().strip()
    if sub_type not in SUBMISSION_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"submission_type must be one of: {', '.join(sorted(SUBMISSION_TYPES))}",
        )

    logger.info("[/ai-review] type=%s lang=%s len=%d", sub_type, request.language, len(request.content))

    try:
        raw = generate_response(prompt=_build_prompt(request), max_new_tokens=request.max_new_tokens)
    except RuntimeError as exc:
        # Model/provider not installed or failed to load — never fake a review.
        logger.error("[/ai-review] provider unavailable: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI review is not configured — the model is unavailable. A mentor review is still available.",
        )
    except Exception as exc:  # noqa: BLE001
        logger.error("[/ai-review] inference error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI review failed. Check server logs.",
        )

    provider = get_provider().provider_name
    parsed = _extract_json(raw)

    if not parsed:
        # Honest fallback: surface the raw model feedback, no invented scores.
        return ReviewResponse(
            submission_type=sub_type,
            scores=ReviewScores(),
            summary=raw.strip()[:4000],
            structured=False,
            provider=provider,
        )

    s = parsed.get("scores") or {}
    return ReviewResponse(
        submission_type=sub_type,
        scores=ReviewScores(
            overall=_clamp_score(s.get("overall")),
            code_quality=_clamp_score(s.get("code_quality")),
            logic=_clamp_score(s.get("logic")),
            documentation=_clamp_score(s.get("documentation")),
            creativity=_clamp_score(s.get("creativity")),
            completion=_clamp_score(s.get("completion")),
        ),
        strengths=_as_str_list(parsed.get("strengths")),
        weaknesses=_as_str_list(parsed.get("weaknesses")),
        mistakes=_as_str_list(parsed.get("mistakes")),
        suggestions=_as_str_list(parsed.get("suggestions")),
        improvement_roadmap=_as_str_list(parsed.get("improvement_roadmap")),
        summary=str(parsed.get("summary") or "").strip(),
        structured=True,
        provider=provider,
    )
