"""
/notebooks  — Study Notebooks AI endpoints
==========================================

Called by the Node.js backend (never directly by the browser).

Routes:
  POST   /api/v1/notebooks/ingest           Ingest a source (chunk + embed)
  DELETE /api/v1/notebooks/sources/{sid}    Delete chunks for a source
  POST   /api/v1/notebooks/chat             RAG-grounded Q&A
  POST   /api/v1/notebooks/generate         Generate study artefact
"""

from __future__ import annotations

import logging
from copy import deepcopy
from time import perf_counter
from uuid import uuid4
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from app.services.notebook_service import get_notebook_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/notebooks", tags=["notebooks"])

NOTEBOOK_ENDPOINTS = ["ingest", "delete_chunks", "chat", "generate"]
NOTEBOOK_METRICS: Dict[str, Dict[str, float]] = {
    endpoint: {
        "success": 0,
        "failure": 0,
        "total_latency_ms": 0,
        "last_latency_ms": 0,
        "last_status_code": 0,
    }
    for endpoint in NOTEBOOK_ENDPOINTS
}


def _request_id(request: Request) -> str:
    incoming = request.headers.get("x-request-id", "").strip()
    return incoming or str(uuid4())


def _elapsed_ms(started_at: float) -> int:
    return int((perf_counter() - started_at) * 1000)


def _record_metric(endpoint: str, ok: bool, latency_ms: int, status_code: int) -> None:
    metric = NOTEBOOK_METRICS.setdefault(
        endpoint,
        {
            "success": 0,
            "failure": 0,
            "total_latency_ms": 0,
            "last_latency_ms": 0,
            "last_status_code": 0,
        },
    )
    key = "success" if ok else "failure"
    metric[key] += 1
    metric["total_latency_ms"] += latency_ms
    metric["last_latency_ms"] = latency_ms
    metric["last_status_code"] = status_code


def _metrics_snapshot() -> Dict[str, Any]:
    snapshot = deepcopy(NOTEBOOK_METRICS)
    for endpoint, data in snapshot.items():
        total_calls = int(data["success"] + data["failure"])
        avg_latency = (data["total_latency_ms"] / total_calls) if total_calls else 0
        data["total_calls"] = total_calls
        data["avg_latency_ms"] = round(avg_latency, 2)
    return snapshot


def _log_success(endpoint: str, request_id: str, started_at: float, extra: Optional[Dict[str, Any]] = None) -> None:
    latency_ms = _elapsed_ms(started_at)
    _record_metric(endpoint, ok=True, latency_ms=latency_ms, status_code=200)
    payload = {
        "request_id": request_id,
        "endpoint": endpoint,
        "latency_ms": latency_ms,
    }
    if extra:
        payload.update(extra)
    logger.info(f"[notebooks/{endpoint}] success", extra=payload)


def _raise_classified_error(endpoint: str, exc: Exception, request_id: str, started_at: float, extra: Optional[Dict[str, Any]] = None):
    latency_ms = _elapsed_ms(started_at)

    if isinstance(exc, HTTPException):
        _record_metric(endpoint, ok=False, latency_ms=latency_ms, status_code=exc.status_code)
        logger.error(
            f"[notebooks/{endpoint}] failed",
            extra={
                "request_id": request_id,
                "endpoint": endpoint,
                "latency_ms": latency_ms,
                "status_code": exc.status_code,
                **(extra or {}),
            },
            exc_info=True,
        )
        raise exc

    detail = str(exc).lower()
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    message = "Request failed"

    if isinstance(exc, ValueError):
        status_code = status.HTTP_400_BAD_REQUEST
        message = "Invalid request data"
    elif "timeout" in detail or isinstance(exc, TimeoutError):
        status_code = status.HTTP_504_GATEWAY_TIMEOUT
        message = "Upstream AI request timed out"
    elif "connection" in detail or "temporarily unavailable" in detail:
        status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        message = "Upstream AI service unavailable"
    elif "rate limit" in detail or "429" in detail:
        status_code = status.HTTP_429_TOO_MANY_REQUESTS
        message = "Upstream AI service rate limited"

    payload = {
        "request_id": request_id,
        "endpoint": endpoint,
        "latency_ms": latency_ms,
        "status_code": status_code,
        "error": str(exc),
    }
    if extra:
        payload.update(extra)

    _record_metric(endpoint, ok=False, latency_ms=latency_ms, status_code=status_code)
    logger.error(f"[notebooks/{endpoint}] failed", extra=payload, exc_info=True)
    raise HTTPException(status_code=status_code, detail=message)


@router.get("/health", status_code=status.HTTP_200_OK)
async def notebooks_health():
    """Notebook endpoints diagnostics for operational visibility."""
    metrics = _metrics_snapshot()
    total_calls = sum(m.get("total_calls", 0) for m in metrics.values())
    total_failures = sum(int(m.get("failure", 0)) for m in metrics.values())
    failure_rate = (total_failures / total_calls) if total_calls else 0

    return {
        "status": "ok",
        "service": "ai-notebooks",
        "failure_rate": round(failure_rate, 4),
        "metrics": metrics,
    }


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response schemas
# ─────────────────────────────────────────────────────────────────────────────

class IngestRequest(BaseModel):
    source_id:   int
    notebook_id: int
    source_type: str = Field(..., pattern="^(text|url|pdf)$")
    content:     Optional[str] = None
    url:         Optional[str] = None
    file_path:   Optional[str] = None
    title:       str = "Untitled Source"


class IngestResponse(BaseModel):
    source_id:   int
    chunk_count: int
    word_count:  int
    extracted_text: str = ""


class ChatRequest(BaseModel):
    notebook_id: int
    message:     str = Field(..., min_length=1, max_length=4096)
    history:     List[Dict[str, Any]] = Field(default_factory=list)


class CitedSource(BaseModel):
    source_id: int
    title:     str
    snippet:   Optional[str] = None
    chunk_index: Optional[int] = None
    similarity: Optional[float] = None


class ChatResponse(BaseModel):
    answer:  str
    sources: List[CitedSource]


class GenerateRequest(BaseModel):
    notebook_id: int
    type:        str = Field(..., pattern="^(summary|study_guide|notebook_guide|faq|flashcards|quiz|audio_overview|compare_sources)$")


class GenerateResponse(BaseModel):
    title:   str
    content: str


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_200_OK)
async def ingest_source(req: IngestRequest, request: Request, response: Response):
    """
    Chunk and embed a source document, storing vectors in notebook_chunks.
    Called asynchronously by the Node backend after creating a notebook_sources row.
    """
    request_id = _request_id(request)
    started_at = perf_counter()
    try:
        response.headers["x-request-id"] = request_id
        svc    = get_notebook_service()
        result = svc.ingest_source(
            source_id   = req.source_id,
            notebook_id = req.notebook_id,
            source_type = req.source_type,
            content     = req.content,
            url         = req.url,
            file_path   = req.file_path,
            title       = req.title,
        )
        payload = IngestResponse(
            source_id   = req.source_id,
            chunk_count = result["chunk_count"],
            word_count  = result["word_count"],
            extracted_text = result.get("extracted_text", ""),
        )
        _log_success(
            "ingest",
            request_id,
            started_at,
            {
                "source_id": req.source_id,
                "notebook_id": req.notebook_id,
                "chunk_count": payload.chunk_count,
                "word_count": payload.word_count,
            },
        )
        return payload
    except Exception as exc:
        _raise_classified_error(
            "ingest",
            exc,
            request_id,
            started_at,
            {"source_id": req.source_id, "notebook_id": req.notebook_id},
        )


@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source_chunks(source_id: int, request: Request, response: Response):
    """Remove all vector chunks for a deleted source."""
    request_id = _request_id(request)
    started_at = perf_counter()
    try:
        response.headers["x-request-id"] = request_id
        get_notebook_service().delete_source_chunks(source_id)
        _log_success(
            "delete_chunks",
            request_id,
            started_at,
            {"source_id": source_id},
        )
    except Exception as exc:
        _raise_classified_error(
            "delete_chunks",
            exc,
            request_id,
            started_at,
            {"source_id": source_id},
        )


@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, request: Request, response: Response):
    """
    Answer a question grounded in the notebook's source documents (RAG).
    Returns the answer and a list of cited sources.
    """
    request_id = _request_id(request)
    started_at = perf_counter()
    try:
        response.headers["x-request-id"] = request_id
        svc    = get_notebook_service()
        result = svc.chat(
            notebook_id = req.notebook_id,
            message     = req.message,
            history     = req.history,
        )
        payload = ChatResponse(
            answer  = result["answer"],
            sources = [CitedSource(**s) for s in result["sources"]],
        )
        _log_success(
            "chat",
            request_id,
            started_at,
            {
                "notebook_id": req.notebook_id,
                "source_count": len(payload.sources),
                "answer_chars": len(payload.answer or ""),
            },
        )
        return payload
    except Exception as exc:
        _raise_classified_error(
            "chat",
            exc,
            request_id,
            started_at,
            {"notebook_id": req.notebook_id},
        )


@router.post("/generate", response_model=GenerateResponse)
async def generate(req: GenerateRequest, request: Request, response: Response):
    """
    Generate a study artefact (summary / study guide / FAQ / flashcards / quiz)
    from all content currently in the notebook.
    """
    request_id = _request_id(request)
    started_at = perf_counter()
    try:
        response.headers["x-request-id"] = request_id
        svc    = get_notebook_service()
        result = svc.generate(notebook_id=req.notebook_id, gen_type=req.type)
        payload = GenerateResponse(title=result["title"], content=result["content"])
        _log_success(
            "generate",
            request_id,
            started_at,
            {
                "notebook_id": req.notebook_id,
                "type": req.type,
                "content_chars": len(payload.content or ""),
            },
        )
        return payload
    except Exception as exc:
        _raise_classified_error(
            "generate",
            exc,
            request_id,
            started_at,
            {"notebook_id": req.notebook_id, "type": req.type},
        )
