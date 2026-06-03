# BlueLearnerAI Agent

This directory contains a lightweight command-line AI assistant that uses the
[OpenClaw](https://openclaw.ai) SDK to automate development tasks such as
scaffolding, code generation, documentation lookup, and deployment orchestration.

## Getting Started

1. Create a Python virtual environment and install dependencies:
   ```bash
   cd ai-agent
   python -m venv venv
   source venv/bin/activate   # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Set the environment variable `OPENCLAW_API_KEY` with your OpenClaw API key
   (or leave unset to run in offline stub mode).

3. Run the agent:
   ```bash
   python agent.py
   ```

The agent will start an interactive prompt where you can ask questions or issue
commands, for example:

```
👨‍💻 >> scaffold backend endpoint users
👨‍💻 >> deploy frontend vercel
```

The stub included in `agent.py` simply echoes prompts; extend the `OpenClawAgent`
wrapper with real functionality when integrating with the SDK.
