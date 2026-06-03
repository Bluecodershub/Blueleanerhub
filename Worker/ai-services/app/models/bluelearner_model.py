"""
BlueLearner Fine-Tuned Model Service
======================================
Loads and serves the fine-tuned LoRA model for inference.
Plugs into the existing LLMProvider abstraction from airllm_service.py.

Environment variables:
  BLUELEARNER_MODEL      : base model ID (default: Qwen/Qwen2.5-1.5B-Instruct)
  BLUELEARNER_ADAPTER    : path to LoRA adapter weights (default: models/bluelearner-v1)
  BLUELEARNER_ENABLED    : set to "true" to enable (default: false)
"""

from __future__ import annotations

import logging
import os
from functools import lru_cache
from typing import Optional

import torch
from peft import PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer

from app.ai.airllm_service import LLMProvider

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"


class BlueLearnerProvider(LLMProvider):
    """
    Loads the base model + fine-tuned LoRA adapter and provides
    chat-style inference.
    """

    def __init__(self, model_id: str, adapter_path: str, device: str = "cpu"):
        logger.info(f"[BlueLearner] Loading base: {model_id}")
        logger.info(f"[BlueLearner] Adapter: {adapter_path}")
        logger.info(f"[BlueLearner] Device: {device}")

        self._tokenizer = AutoTokenizer.from_pretrained(
            model_id, trust_remote_code=True
        )
        if self._tokenizer.pad_token is None:
            self._tokenizer.pad_token = self._tokenizer.eos_token

        kwargs = {
            "trust_remote_code": True,
            "torch_dtype": torch.float32,
            "low_cpu_mem_usage": True,
        }
        if device == "cuda":
            kwargs["torch_dtype"] = torch.bfloat16
            kwargs["device_map"] = "auto"
        else:
            kwargs["device_map"] = {"": "cpu"}

        self._base_model = AutoModelForCausalLM.from_pretrained(model_id, **kwargs)
        self._base_model.eval()

        if os.path.exists(adapter_path):
            logger.info(f"[BlueLearner] Loading LoRA adapter from {adapter_path}")
            self._model = PeftModel.from_pretrained(
                self._base_model, adapter_path, device_map=kwargs.get("device_map")
            )
            self._model.eval()
            logger.info("[BlueLearner] LoRA adapter loaded successfully")
        else:
            logger.warning(f"[BlueLearner] Adapter not found at {adapter_path}, "
                           "using base model without fine-tuning")
            self._model = self._base_model

        self._device = device
        self._model_id = model_id
        self._adapter_path = adapter_path

    def generate_response(self, prompt: str, max_new_tokens: int = 256) -> str:
        messages = [
            {"role": "system", "content": "You are BlueLearnerHub's AI assistant."},
            {"role": "user", "content": prompt},
        ]

        inputs = self._tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt",
        ).to(self._device)

        with torch.no_grad():
            outputs = self._model.generate(
                inputs,
                max_new_tokens=max_new_tokens,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.05,
                pad_token_id=self._tokenizer.pad_token_id,
                eos_token_id=self._tokenizer.eos_token_id,
            )

        response = self._tokenizer.decode(
            outputs[0][inputs.shape[1]:], skip_special_tokens=True
        )
        return response.strip()

    @property
    def provider_name(self) -> str:
        return f"bluelearner:{os.path.basename(self._adapter_path)}"


@lru_cache(maxsize=1)
def get_provider() -> Optional[LLMProvider]:
    if os.getenv("BLUELEARNER_ENABLED", "").lower() != "true":
        logger.info("[BlueLearner] Disabled (set BLUELEARNER_ENABLED=true to enable)")
        return None

    model_id = os.getenv("BLUELEARNER_MODEL", DEFAULT_MODEL)
    adapter_path = os.getenv(
        "BLUELEARNER_ADAPTER",
        os.path.join(os.path.dirname(__file__), "..", "..", "models", "bluelearner-v1"),
    )
    adapter_path = os.path.abspath(adapter_path)
    device = os.getenv("DEVICE", "cpu")

    return BlueLearnerProvider(
        model_id=model_id,
        adapter_path=adapter_path,
        device=device,
    )


def generate_response(prompt: str, max_new_tokens: int = 256) -> str:
    provider = get_provider()
    if provider is None:
        return "[BlueLearner disabled]"
    return provider.generate_response(prompt, max_new_tokens=max_new_tokens)
