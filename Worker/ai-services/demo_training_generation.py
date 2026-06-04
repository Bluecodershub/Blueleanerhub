"""
Legacy hosted-AI training-data demo.

BlueLearnerHub now uses offline seed data and local/inbuilt model training.
Do not generate training data from hosted AI providers for this project.
"""

from pathlib import Path


def main() -> None:
    training_dir = Path(__file__).parent / "data" / "training"
    print("Hosted-AI training generation is disabled.")
    print(f"Use the curated offline dataset in: {training_dir}")
    print("See Worker/ai-services/data/training/README.md for the supported workflow.")


if __name__ == "__main__":
    main()
