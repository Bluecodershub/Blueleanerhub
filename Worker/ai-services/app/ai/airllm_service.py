"""
AIR LLM Service — Local Model Inference Layer
==============================================

This module loads and runs a local LLM using the airllm library.
It also defines a provider abstraction so models can be swapped without
changing any caller code.

HOW TO CHANGE THE MODEL
-----------------------
Set the environment variable LOCAL_LLM_MODEL to any Hugging Face model ID
that AIR LLM supports. Examples:
  - "mistralai/Mistral-7B-Instruct-v0.2"   (default)
  - "meta-llama/Llama-2-7b-chat-hf"
  - "microsoft/phi-2"

HOW TO SCALE THIS LAYER
------------------------
1. Horizontal: Run multiple replicas of this FastAPI service behind a load
   balancer (e.g. Nginx, AWS ALB). Each replica loads the model once on
   startup and handles requests concurrently.
2. GPU acceleration: Set AIRLLM_COMPRESSION=None and run on a CUDA/ROCm
   machine. AIR LLM will detect the GPU automatically.
3. Swap to a hosted API: Replace LocalLLMProvider with GeminiProvider or
   OpenAIProvider below — the /chat endpoint requires no changes.
"""

from __future__ import annotations

import logging
import os
from abc import ABC, abstractmethod
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Abstract provider — all AI backends implement this interface
# ---------------------------------------------------------------------------

class LLMProvider(ABC):
    """
    Base interface for every AI provider (local or cloud).
    Add new providers by subclassing this and updating get_provider().
    """

    @abstractmethod
    def generate_response(self, prompt: str, max_new_tokens: int = 256) -> str:
        """Send *prompt* to the model and return the generated text."""
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable name used for logging and /health responses."""
        ...


# ---------------------------------------------------------------------------
# AIR LLM — local inference (the primary provider)
# ---------------------------------------------------------------------------

class AirLLMProvider(LLMProvider):
    """
    Wraps AIR LLM to run a local Hugging Face model with split-computing
    compression so it fits in limited RAM/VRAM.

    The model is loaded ONCE when this object is instantiated (at server
    startup via the lifespan hook in main.py) and reused for every request.
    Loading can take 1-3 minutes on first run while weights are downloaded
    and compressed into the .cache/huggingface directory.
    """

    def __init__(self, model_id: str, compression: Optional[str] = "4bit"):
        """
        Parameters
        ----------
        model_id    : Hugging Face model repo, e.g. "mistralai/Mistral-7B-Instruct-v0.2"
        compression : "4bit" (default, smallest RAM), "8bit", or None (full precision).
                      Change via env var AIRLLM_COMPRESSION.
        """
        logger.info(f"[AirLLM] Loading model: {model_id}  compression={compression}")

        # Import here so that servers without airllm installed can still
        # import this module and fall back to a different provider.
        try:
            from airllm import AutoModel  # type: ignore
        except ImportError as exc:
            raise RuntimeError(
                "airllm is not installed. Run: pip install airllm"
            ) from exc

        # MODEL LOAD POINT — weights are fetched from Hugging Face on first run
        # and cached locally in ~/.cache/huggingface/
        if compression:
            self._model = AutoModel.from_pretrained(model_id, compression=compression)
        else:
            self._model = AutoModel.from_pretrained(model_id)

        self._model_id = model_id
        logger.info(f"[AirLLM] Model ready: {model_id}")

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def generate_response(self, prompt: str, max_new_tokens: int = 256) -> str:
        """
        Tokenize *prompt*, run inference, and return the decoded output.

        The model object is NOT re-created between calls — only a forward
        pass is performed, which is fast after the initial load.
        """
        try:
            input_text = [prompt]
            generation_output = self._model.generate(
                input_text,
                max_new_tokens=max_new_tokens,
                use_cache=True,
                return_dict_in_generate=True,
            )
            # AIR LLM returns a list of token id tensors; decode the first one
            tokens = generation_output.sequences[0]
            response: str = self._model.tokenizer.decode(
                tokens, skip_special_tokens=True
            )
            # Strip the original prompt from the output if echoed back
            if response.startswith(prompt):
                response = response[len(prompt):].lstrip()
            return response.strip()
        except Exception as exc:
            logger.error(f"[AirLLM] Inference error: {exc}", exc_info=True)
            raise

    @property
    def provider_name(self) -> str:
        return f"airllm:{self._model_id}"


# ---------------------------------------------------------------------------
# Stub / fallback provider — used when AIR LLM is unavailable
# ---------------------------------------------------------------------------

class StubLLMProvider(LLMProvider):
    """
    Lightweight stand-in that echoes the prompt back.
    Useful for development, CI, or machines without enough RAM for a real model.
    Enable by setting LOCAL_LLM_PROVIDER=stub in the environment.
    """

    def generate_response(self, prompt: str, max_new_tokens: int = 256) -> str:
        logger.warning("[StubLLM] Using stub provider — not a real model")
        return f"[STUB RESPONSE] Received prompt ({len(prompt)} chars). Configure a real provider."

    @property
    def provider_name(self) -> str:
        return "stub"


# ---------------------------------------------------------------------------
# Provider factory — single entry point used by the rest of the app
# ---------------------------------------------------------------------------

@lru_cache(maxsize=1)
def get_provider() -> LLMProvider:
    """
    Return the configured LLM provider (singleton, loaded once at startup).

    Environment variables
    ---------------------
    LOCAL_LLM_PROVIDER   : "airllm" (default) | "stub"
    LOCAL_LLM_MODEL      : Hugging Face model ID for the airllm provider
    AIRLLM_COMPRESSION   : "4bit" | "8bit" | "none"
    """
    provider_name = os.getenv("LOCAL_LLM_PROVIDER", "airllm").lower()

    if provider_name == "stub":
        logger.info("[LLMFactory] Using StubLLMProvider")
        return StubLLMProvider()

    # Default: AIR LLM with Mistral-7B-Instruct
    model_id = os.getenv(
        "LOCAL_LLM_MODEL",
        "mistralai/Mistral-7B-Instruct-v0.2",
    )
    compression_raw = os.getenv("AIRLLM_COMPRESSION", "4bit").lower()
    compression = None if compression_raw == "none" else compression_raw

    logger.info(f"[LLMFactory] Initialising AirLLMProvider  model={model_id}")
    return AirLLMProvider(model_id=model_id, compression=compression)


# ---------------------------------------------------------------------------
# Convenience wrapper — keeps call sites simple
# ---------------------------------------------------------------------------

def generate_response(prompt: str, max_new_tokens: int = 256) -> str:
    """
    Module-level helper.  Callers just do::

        from app.ai.airllm_service import generate_response
        text = generate_response("Explain backpropagation in simple terms.")
    """
    return get_provider().generate_response(prompt, max_new_tokens=max_new_tokens)
