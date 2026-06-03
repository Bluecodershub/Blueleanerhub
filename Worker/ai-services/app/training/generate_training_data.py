"""
Offline training data status command.

The previous hosted-AI data generator was removed because BlueLearnerHub is
training its own inbuilt model without external AI APIs.
"""

from __future__ import annotations

from app.training.generate_instruction_data import main


if __name__ == "__main__":
    main()
