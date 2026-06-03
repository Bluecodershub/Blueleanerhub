"""
/adaptive — Cross-module adaptive guidance endpoints.
"""

from __future__ import annotations

import json
import logging
import re
import unicodedata
from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from app.services.ai_orchestrator import LLMClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/adaptive", tags=["adaptive-guidance"])


class GuidanceItem(BaseModel):
    title: str
    insight: str
    action: str
    priority: Literal["high", "medium", "low"]
    confidence: float = Field(0.7, ge=0.0, le=1.0)


class AdaptiveGuidanceRequest(BaseModel):
    module_type: Literal["notebook", "tutorial", "hackathon", "quiz"]
    target_id: int
    target_title: str = ""
    metrics: Dict[str, Any] = Field(default_factory=dict)
    events: List[Dict[str, Any]] = Field(default_factory=list)


class AdaptiveGuidanceResponse(BaseModel):
    guidance: List[GuidanceItem]
    behavior_summary: Dict[str, Any]
    generated_at: str


_llm: Optional[LLMClient] = None

_BLOCKED_PROMPT_PATTERNS = [
    re.compile(r"\bignore\s+all\s+instructions\b", re.IGNORECASE),
    re.compile(r"\breturn\s+only\b", re.IGNORECASE),
    re.compile(r"\bsystem\s+prompt\b", re.IGNORECASE),
    re.compile(r"\bdeveloper\s+message\b", re.IGNORECASE),
]


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def sanitize_user_input(value: Any, max_len: int = 200) -> str:
    # Preserve 0/False by stringifying non-None values directly.
    text = value if isinstance(value, str) else ("" if value is None else str(value))
    text = unicodedata.normalize("NFKC", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.casefold()
    for pattern in _BLOCKED_PROMPT_PATTERNS:
        text = pattern.sub(" ", text)
    text = " ".join(text.strip().split())
    return text[:max_len]


def _sanitize_metrics(metrics: Dict[str, Any]) -> Dict[str, Any]:
    cleaned: Dict[str, Any] = {}
    for key, value in list(metrics.items())[:50]:
        safe_key = sanitize_user_input(key, 60)
        if not safe_key:
            continue
        if isinstance(value, (int, float, bool)) or value is None:
            cleaned[safe_key] = value
        elif isinstance(value, str):
            cleaned[safe_key] = sanitize_user_input(value, 200)
        else:
            cleaned[safe_key] = sanitize_user_input(str(value), 200)
    return cleaned


def _sanitize_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    cleaned_events: List[Dict[str, Any]] = []
    for raw_event in events[-25:]:
        if not isinstance(raw_event, dict):
            continue
        cleaned_events.append({
            "event_type": sanitize_user_input(raw_event.get("event_type", "unknown"), 100),
            "event_payload": _sanitize_metrics(raw_event.get("event_payload", {}) if isinstance(raw_event.get("event_payload"), dict) else {}),
            "created_at": sanitize_user_input(raw_event.get("created_at", ""), 80),
        })
    return cleaned_events


def _get_llm() -> LLMClient:
    global _llm
    if _llm is None:
        _llm = LLMClient()
    return _llm


def _fallback_guidance(module_type: str, metrics: Dict[str, Any]) -> List[GuidanceItem]:
    if module_type == "notebook":
        source_count = _safe_int(metrics.get("sourceCount", 0), 0)
        total_messages = _safe_int(metrics.get("totalMessages", 0), 0)
        if source_count == 0:
            return [GuidanceItem(title="Add Sources First", insight="No source context is available yet.", action="Add two quality sources before deep Q&A.", priority="high", confidence=0.95)]
        if total_messages < 3:
            return [GuidanceItem(title="Ask Deeper Questions", insight="Conversation depth is still shallow.", action="Use compare/why/how prompts to build stronger understanding.", priority="medium", confidence=0.82)]
    if module_type == "tutorial":
        completion = _safe_float(metrics.get("completionPercent", 0), 0.0)
        if completion < 50:
            return [GuidanceItem(title="Focus on Completion", insight="You are still in early tutorial stages.", action="Finish the next two sections before switching topics.", priority="high", confidence=0.86)]
    if module_type == "hackathon":
        submissions = _safe_int(metrics.get("submissionCount", 0), 0)
        if submissions == 0:
            return [GuidanceItem(title="Ship an MVP", insight="No submission feedback loop has started.", action="Submit a baseline build to unlock iterative improvements.", priority="high", confidence=0.9)]
    if module_type == "quiz":
        avg = _safe_float(metrics.get("averageScore", 0), 0.0)
        if avg < 60:
            return [GuidanceItem(title="Target Weak Areas", insight="Average score indicates conceptual gaps.", action="Run focused practice on missed topics, then retry.", priority="high", confidence=0.87)]

    return [GuidanceItem(title="Maintain Learning Cadence", insight="Current activity is stable.", action="Continue with one targeted challenge to improve retention.", priority="low", confidence=0.7)]


@router.post("/guidance", response_model=AdaptiveGuidanceResponse, status_code=status.HTTP_200_OK)
async def generate_adaptive_guidance(req: AdaptiveGuidanceRequest, request: Request, response: Response):
    request_id = request.headers.get("x-request-id", "") or f"adaptive-{req.module_type}-{req.target_id}"
    response.headers["x-request-id"] = request_id

    target_title_input = req.target_title if isinstance(req.target_title, str) and req.target_title.strip() else None
    if target_title_input is None:
        target_title_input = f"<target_{req.target_id}>" if req.target_id == 0 else (
            str(req.target_id) if req.target_id is not None else "unknown"
        )

    sanitized_title = sanitize_user_input(target_title_input, 200) or "unknown"
    sanitized_metrics = _sanitize_metrics(req.metrics)
    sanitized_events = _sanitize_events(req.events)

    behavior_summary = {
        "moduleType": req.module_type,
        "targetId": req.target_id,
        "targetTitle": sanitized_title,
        "eventCount": len(sanitized_events),
        **sanitized_metrics,
    }

    prompt = (
        "You are an elite adaptive learning coach for an EdTech platform. "
        "Given behavior metrics and interaction events, return a JSON array with 3 concise guidance items. "
        "Each item must include: title, insight, action, priority (high|medium|low), confidence (0..1). "
        "Focus on actionable, personalized coaching.\n\n"
        f"MODULE: {req.module_type}\n"
        f"TARGET: {sanitized_title}\n"
        f"METRICS: {json.dumps(sanitized_metrics, ensure_ascii=True)}\n"
        f"EVENTS: {json.dumps(sanitized_events, ensure_ascii=True)}\n\n"
        "Output only valid JSON array."
    )

    try:
        llm = _get_llm()
        raw = llm.generate(prompt, model="flash", temperature=0.25, max_tokens=900)
        start = raw.find("[")
        end = raw.rfind("]")
        if start == -1 or end == -1 or end <= start:
            raise ValueError("LLM did not return JSON array")

        parsed = json.loads(raw[start:end + 1])
        guidance = [GuidanceItem(**item) for item in parsed[:5]]
        if not guidance:
            guidance = _fallback_guidance(req.module_type, sanitized_metrics)
    except Exception as exc:
        logger.warning("adaptive guidance fallback used: %s", exc)
        guidance = _fallback_guidance(req.module_type, sanitized_metrics)

    return AdaptiveGuidanceResponse(
        guidance=guidance,
        behavior_summary=behavior_summary,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
