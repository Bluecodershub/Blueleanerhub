"""
AI provider abstraction package.
Import get_provider() to access the active LLM backend.
"""

from app.ai.airllm_service import get_provider, generate_response, LLMProvider

__all__ = ["get_provider", "generate_response", "LLMProvider"]
