"""
Offline instruction data entry point.

External AI API generation has been disabled. Curated seed data is stored in
data/training and can be expanded manually from platform-owned content.
"""

from __future__ import annotations

import json
from pathlib import Path


def main() -> None:
    data_dir = Path("data/training")
    manifest = data_dir / "manifest.json"
    if not manifest.exists():
        raise SystemExit(
            "Training manifest not found. Expected data/training/manifest.json "
            "under worker/ai-services."
        )

    payload = json.loads(manifest.read_text(encoding="utf-8"))
    train_files = payload.get("splits", {}).get("train", [])
    total = 0
    for name in train_files:
        path = data_dir / name
        if path.exists():
            total += sum(1 for line in path.read_text(encoding="utf-8").splitlines() if line.strip())

    print(f"Offline training data ready: {total} train examples in {data_dir}")
    print("Use: python -m app.training.finetune_lora --data data/training")


if __name__ == "__main__":
    main()
