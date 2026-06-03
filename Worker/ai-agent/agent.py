"""BlueLearnerAI - OpenClaw development assistant

This simple command-line agent uses the hypothetical OpenClaw SDK to
provide interactive help when working on the BlueLearnerHub repository.
It can be extended with commands for scaffolding, deployment, and more.
"""

import os
import sys

try:
    from openclaw import OpenClawAgent
except ImportError:
    # Fallback stub if the package isn't installed yet
    class OpenClawAgent:
        def __init__(self, name, api_key=None):
            self.name = name
            self.api_key = api_key
        def ask(self, prompt: str) -> str:
            return f"[stub response for '{prompt}']"


def main():
    api_key = os.getenv("OPENCLAW_API_KEY")
    if not api_key:
        print("WARNING: OPENCLAW_API_KEY not set, running in offline stub mode.")
    agent = OpenClawAgent(name="BlueLearnerAI", api_key=api_key)
    print("BlueLearnerAI is ready. Type 'exit' or Ctrl+C to quit.")
    try:
        while True:
            prompt = input("👨‍💻 >> ")
            if prompt.strip().lower() in ("exit", "quit"):
                break
            response = agent.ask(prompt)
            print(response)
    except KeyboardInterrupt:
        print("\nGoodbye!")


if __name__ == "__main__":
    main()
