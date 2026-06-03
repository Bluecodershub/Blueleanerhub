"""
BlueLearner LoRA Fine-Tuning
============================
Fine-tune a small open-source LLM (1-3B parameters) on BlueLearnerHub
instruction data using LoRA (Low-Rank Adaptation).

Runs on CPU out of the box.  For GPU, set DEVICE=cuda.

Usage:
  # Quick test (100 examples)
  python -m app.training.finetune_lora --quick

  # Full training
  python -m app.training.finetune_lora \
    --model Qwen/Qwen2.5-1.5B-Instruct \
    --data data/training_datasets \
    --epochs 3 \
    --output models/bluelearner-v1
"""

import argparse
import json
import logging
import math
import os
import sys
from typing import Dict, List, Optional

import torch
from datasets import Dataset
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig,
    TrainingArguments,
    Trainer,
    DataCollatorForSeq2Seq,
    set_seed,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("finetune_lora")

DEFAULT_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"

# ── Data Loading ────────────────────────────────────────────────────────────


def load_jsonl(path: str) -> List[Dict]:
    data = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                data.append(json.loads(line))
    return data


def load_data(data_dir: str, max_examples: Optional[int] = None) -> List[Dict]:
    manifest_path = os.path.join(data_dir, "manifest.json")
    all_path = os.path.join(data_dir, "bluelearner_all.jsonl")
    if os.path.exists(manifest_path):
        logger.info(f"Loading manifest from {manifest_path}")
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        data = []
        for fname in manifest.get("splits", {}).get("train", []):
            data.extend(load_jsonl(os.path.join(data_dir, fname)))
    elif os.path.exists(all_path):
        logger.info(f"Loading data from {all_path}")
        data = load_jsonl(all_path)
    else:
        logger.info(f"Loading per-persona files from {data_dir}")
        data = []
        for fname in sorted(os.listdir(data_dir)):
            if fname.startswith("bluelearner_") and fname.endswith(".jsonl"):
                data.extend(load_jsonl(os.path.join(data_dir, fname)))

    if max_examples and len(data) > max_examples:
        data = data[:max_examples]

    logger.info(f"Loaded {len(data)} examples from {data_dir}")
    return data


def format_chat(example: Dict) -> str:
    if "messages" in example:
        return example["messages"]

    system = example.get("system", "")
    instruction = example.get("instruction", "")
    output = example.get("output", "")

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": instruction},
        {"role": "assistant", "content": output},
    ]
    return messages


def tokenize_function(examples, tokenizer, max_length: int = 512):
    texts = []
    for i in range(len(examples["messages"])):
        messages = examples["messages"][i]
        text = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=False
        )
        texts.append(text)

    tokenized = tokenizer(
        texts,
        padding="max_length",
        truncation=True,
        max_length=max_length,
        return_tensors=None,
    )

    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized


# ── Model Loading ───────────────────────────────────────────────────────────


def load_base_model(model_name: str, device: str):
    logger.info(f"Loading base model: {model_name}")
    logger.info(f"Device: {device}")

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

    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model = AutoModelForCausalLM.from_pretrained(model_name, **kwargs)

    # Freeze base model parameters (for LoRA efficiency)
    for param in model.parameters():
        param.requires_grad = False

    logger.info(f"Model loaded. Parameters: {model.num_parameters():,}")
    return model, tokenizer


def apply_lora(model, r: int = 16):
    logger.info(f"Applying LoRA (rank={r})...")

    lora_config = LoraConfig(
        r=r,
        lora_alpha=r * 2,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )

    model = get_peft_model(model, lora_config)
    model.print_trainable_parameters()
    return model


# ── Training ────────────────────────────────────────────────────────────────


def train(
    model,
    tokenizer,
    train_dataset: Dataset,
    val_dataset: Optional[Dataset],
    output_dir: str,
    device: str,
    num_epochs: int = 3,
    batch_size: int = 1,
    grad_accum: int = 8,
    learning_rate: float = 2e-4,
):
    logger.info(f"Training config: epochs={num_epochs}, batch={batch_size}, "
                f"grad_accum={grad_accum}, lr={learning_rate}")

    training_args = TrainingArguments(
        output_dir=output_dir,
        overwrite_output_dir=True,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        gradient_accumulation_steps=grad_accum,
        learning_rate=learning_rate,
        warmup_ratio=0.03,
        logging_steps=10,
        save_steps=200,
        save_total_limit=2,
        eval_strategy="steps" if val_dataset else "no",
        eval_steps=200 if val_dataset else None,
        fp16=False,
        bf16=False,
        dataloader_pin_memory=False,
        remove_unused_columns=False,
        report_to=["tensorboard"] if device == "cuda" else [],
        no_cuda=(device == "cpu"),
        gradient_checkpointing=True,
        gradient_checkpointing_kwargs={"use_reentrant": False},
    )

    collator = DataCollatorForSeq2Seq(tokenizer, pad_to_multiple_of=8)

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        data_collator=collator,
        tokenizer=tokenizer,
    )

    logger.info("Starting training...")
    trainer.train()

    logger.info(f"Saving model to {output_dir}")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)

    return trainer


def split_dataset(data: List[Dict], val_split: float = 0.05):
    split_idx = int(len(data) * (1 - val_split))
    train_data = data[:split_idx]
    val_data = data[split_idx:]
    logger.info(f"Split: {len(train_data)} train + {len(val_data)} validation")
    return train_data, val_data


# ── Main ────────────────────────────────────────────────────────────────────


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default=DEFAULT_MODEL,
                        help=f"Base model (default: {DEFAULT_MODEL})")
    parser.add_argument("--data", type=str, default="data/training",
                        help="Directory with manifest.json, bluelearner_all.jsonl, or bluelearner_*.jsonl files")
    parser.add_argument("--output", type=str, default="models/bluelearner-v1",
                        help="Output directory for fine-tuned model")
    parser.add_argument("--epochs", type=int, default=3)
    parser.add_argument("--lr", type=float, default=2e-4)
    parser.add_argument("--batch-size", type=int, default=1,
                        help="Per-device batch size (default: 1)")
    parser.add_argument("--grad-accum", type=int, default=8,
                        help="Gradient accumulation steps (default: 8)")
    parser.add_argument("--lora-rank", type=int, default=16)
    parser.add_argument("--max-length", type=int, default=512)
    parser.add_argument("--max-examples", type=int, default=None)
    parser.add_argument("--quick", action="store_true",
                        help="Quick test with 100 examples, 1 epoch")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    set_seed(args.seed)
    device = os.getenv("DEVICE", "cpu").lower()

    if args.quick:
        args.max_examples = 100
        args.epochs = 1
        args.output = os.path.join(args.output, "quick-test")
        logger.info("QUICK MODE: 100 examples, 1 epoch")

    # Load data
    raw_data = load_data(args.data, args.max_examples)
    if not raw_data:
        logger.error("No training data found. Add JSONL files under data/training or run a local data preparation job.")
        sys.exit(1)

    # Format messages
    for ex in raw_data:
        ex["messages"] = format_chat(ex)
    logger.info(f"Example messages: {raw_data[0]['messages'][:2]}")

    # Load model
    model, tokenizer = load_base_model(args.model, device)

    # Apply LoRA
    model = apply_lora(model, r=args.lora_rank)

    # Prepare datasets
    train_data, val_data = split_dataset(raw_data)
    train_dataset = Dataset.from_list(train_data)
    val_dataset = Dataset.from_list(val_data) if val_data else None

    def tok_fn(examples):
        return tokenize_function(examples, tokenizer, max_length=args.max_length)

    train_dataset = train_dataset.map(tok_fn, batched=True, remove_columns=["messages"])
    if val_dataset:
        val_dataset = val_dataset.map(tok_fn, batched=True, remove_columns=["messages"])

    # Train
    train(
        model, tokenizer, train_dataset, val_dataset,
        output_dir=args.output,
        device=device,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        grad_accum=args.grad_accum,
        learning_rate=args.lr,
    )

    # Quick inference test
    logger.info("Testing inference...")
    test_prompt = "Explain what a linked list is to a beginner."
    messages = [
        {"role": "system", "content": "You are the BlueLearnerHub AI Tutor."},
        {"role": "user", "content": test_prompt},
    ]
    inputs = tokenizer.apply_chat_template(
        messages, tokenize=True, add_generation_prompt=True,
        return_tensors="pt"
    )
    model.eval()
    with torch.no_grad():
        outputs = model.generate(
            inputs, max_new_tokens=100, do_sample=True, temperature=0.7
        )
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        logger.info(f"Test response:\n{response}")

    print(f"\n{'='*60}")
    print(f"✅ Fine-tuning complete!")
    print(f"📁 Model saved to: {os.path.abspath(args.output)}")
    print(f"📊 Training data: {len(raw_data)} examples")
    print(f"{'='*60}")
    print("\nNext steps:")
    print("  1. Deploy: python -m app.models.bluelearner_model")
    print("  2. Convert for Ollama (optional): see docs")


if __name__ == "__main__":
    main()
