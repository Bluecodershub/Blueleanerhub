"""
BlueLearner API route — serves the fine-tuned model.
Mounted at: /api/v1/bluelearner/*
"""

import logging
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, validator

from app.models.bluelearner_model import get_provider

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bluelearner", tags=["bluelearner"])

MAX_PROMPT_LEN = 4096
MAX_TOKENS = 1024


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=MAX_PROMPT_LEN)
    max_tokens: int = Field(256, ge=1, le=MAX_TOKENS)

    @validator('prompt')
    def strip_prompt(cls, v: str) -> str:
        return v.strip()


class ChatMessage(BaseModel):
    role: str = Field(..., pattern=r'^(user|assistant|system)$')
    content: str = Field(..., min_length=1, max_length=MAX_PROMPT_LEN)


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_items=1)
    max_tokens: int = Field(256, ge=1, le=MAX_TOKENS)


@router.post("/generate")
async def generate(body: GenerateRequest):
    provider = get_provider()
    if provider is None:
        raise HTTPException(status_code=503, detail="BlueLearner model not enabled")
    response = provider.generate_response(body.prompt, max_new_tokens=body.max_tokens)
    return {"success": True, "response": response, "provider": provider.provider_name}


@router.post("/chat")
async def chat(body: ChatRequest):
    """
    Chat-style endpoint. Builds a prompt from the last user message.
    """
    provider = get_provider()
    if provider is None:
        raise HTTPException(status_code=503, detail="BlueLearner model not enabled")

    prompt = body.messages[-1].content
    response = provider.generate_response(prompt, max_new_tokens=body.max_tokens)

    return {"success": True, "response": response, "provider": provider.provider_name}


@router.get("/status")
async def status():
    provider = get_provider()
    if provider is None:
        return {"enabled": False}
    return {"enabled": True, "provider": provider.provider_name}
