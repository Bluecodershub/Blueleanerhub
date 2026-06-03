"""
BlueLearnerHub AI Orchestrator
================================
Central intelligence layer that coordinates all AI agents.

Every AI feature on the platform routes through this orchestrator.
To add a new AI capability:
  1. Write a new Agent class implementing BaseAgent
  2. Register it in BlueLearnerAI.agents
  3. Add an API endpoint in app/api/v1/

Architecture:
  Request → AIRouter (intent classification) → Agent → Response
  All agents share: Memory (Redis), Embedder, LLMClient
"""

from __future__ import annotations

import logging
import time
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

from sentence_transformers import SentenceTransformer

from app.config import settings
from app.services.cache_service import CacheService
from app.core.database import get_redis
from app.ai.airllm_service import generate_response

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────────────────────
# SHARED INFRASTRUCTURE
# ─────────────────────────────────────────────────────────────────────────────


class LLMClient:
    """
    Thin wrapper around the inbuilt local model provider.
    Centralises model selection, retry logic, and token counting.

    To swap to OpenAI GPT-4: replace the generate() internals here;
    no agent code needs to change.
    """

    def __init__(self):
        self._provider_name = "local-inbuilt"

    def generate(
        self,
        prompt: str,
        *,
        model: str = "flash",  # "pro" for complex tasks, "flash" for quick tasks
        temperature: float = 0.7,
        max_tokens: int = 2048,
    ) -> str:
        try:
            return generate_response(prompt, max_new_tokens=max_tokens)
        except Exception as exc:
            logger.error(f"[LLMClient] Generation failed: {exc}")
            raise

    def stream(self, prompt: str, model: str = "pro"):
        """Yields text chunks for SSE streaming."""
        yield self.generate(prompt, model=model)


class EmbeddingClient:
    """
    Generates semantic embeddings for tutorials, Q&A, and user skill profiles.
    Used by all agents for similarity search and duplicate detection.
    Embeddings are stored in pgvector via the Node.js backend.
    """

    def __init__(self):
        # SentenceTransformers runs locally — no API cost for embeddings
        logger.info("[Embedder] Loading sentence-transformers model...")
        self._model = SentenceTransformer("all-MiniLM-L6-v2")  # 384-dim, fast
        logger.info("[Embedder] Ready")

    def embed(self, text: str) -> List[float]:
        return self._model.encode(text, normalize_embeddings=True).tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return self._model.encode(texts, normalize_embeddings=True).tolist()


# ─────────────────────────────────────────────────────────────────────────────
# BASE AGENT
# ─────────────────────────────────────────────────────────────────────────────


class BaseAgent(ABC):
    """
    All AI agents extend this class.

    Provides:
      - self.llm       : LLMClient
      - self.embedder  : EmbeddingClient
      - self.cache     : CacheService
      - self.name      : agent identifier

    Override run() with your agent logic.
    """

    def __init__(self, llm: LLMClient, embedder: EmbeddingClient, cache: CacheService):
        self.llm = llm
        self.embedder = embedder
        self.cache = cache

    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]: ...

    def _cache_key(self, *parts: str) -> str:
        return f"agent:{self.name}:" + ":".join(parts)

    def _cache_get(self, key: str):
        return self.cache.get(key) if self.cache is not None else None

    def _cache_set(self, key: str, value, ttl: int):
        if self.cache is not None:
            self.cache.set(key, value, ttl=ttl)


# ─────────────────────────────────────────────────────────────────────────────
# AGENT IMPLEMENTATIONS
# ─────────────────────────────────────────────────────────────────────────────


class AITutorAgent(BaseAgent):
    """
    Context-aware AI tutor.
    Understands the student's current tutorial, section, and learning history.
    Uses Gemini Pro for nuanced, Socratic explanations.
    """

    @property
    def name(self) -> str:
        return "tutor"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        question = input_data["question"]
        context = input_data.get("context", {})
        tutorial = context.get("tutorial_title", "")
        domain = context.get("domain", "general")
        user_level = context.get("user_level", 1)

        cache_key = self._cache_key(question[:80], tutorial[:40])
        if cached := self._cache_get(cache_key):
            return {"answer": cached, "cached": True}

        prompt = f"""You are an expert {domain} tutor on BlueLearnerHub.

Student context:
- Tutorial: {tutorial}
- User level: {user_level}/10
- Question: {question}

Instructions:
- Use the Socratic method: guide with questions, don't just give answers
- Match explanation complexity to level {user_level}
- If the question is about code, provide a minimal working example
- End with one follow-up question to check understanding
- Format: clean Markdown"""

        answer = self.llm.generate(prompt, model="pro", temperature=0.6)
        self._cache_set(cache_key, answer, ttl=3600)

        return {"answer": answer, "cached": False}


class QuizGeneratorAgent(BaseAgent):
    """
    Generates high-quality multiple-choice questions for any domain.
    Used by: daily challenge cron, teacher quiz builder, adaptive quizzes.
    """

    @property
    def name(self) -> str:
        return "quiz_generator"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        topic = input_data["topic"]
        difficulty = input_data.get("difficulty", "medium")
        count = input_data.get("count", 5)
        domain = input_data.get("domain", "computer_science")

        cache_key = self._cache_key(topic, difficulty, str(count))
        if cached := self._cache_get(cache_key):
            return {"questions": cached, "cached": True}

        prompt = f"""Generate {count} high-quality {difficulty} multiple-choice questions about:
Topic: {topic}
Domain: {domain}

For EACH question, output EXACTLY this JSON structure (no extra text):
{{
  "question": "...",
  "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}},
  "correct_answer": "A",
  "explanation": "Why A is correct and others are wrong",
  "difficulty": "{difficulty}",
  "estimated_seconds": 60
}}

Return a JSON array of {count} question objects. Only return valid JSON."""

        raw = self.llm.generate(prompt, model="flash", temperature=0.8, max_tokens=3000)

        import json, re

        json_match = re.search(r"\[.*\]", raw, re.DOTALL)
        questions = json.loads(json_match.group()) if json_match else []

        self._cache_set(cache_key, questions, ttl=3600 * 6)  # Cache for 6 hours
        return {"questions": questions, "cached": False}


class HackathonGeneratorAgent(BaseAgent):
    """
    Auto-generates complete hackathon specs: theme, problems, datasets,
    evaluation criteria, and judging rubric.
    Used by: admin dashboard, corporate hackathon portal.
    """

    @property
    def name(self) -> str:
        return "hackathon_generator"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        theme_hint = input_data.get("theme_hint", "")
        domain = input_data.get("domain", "software")
        duration = input_data.get("duration_hours", 48)
        level = input_data.get("level", "undergraduate")

        prompt = f"""Design a complete hackathon specification.

Parameters:
- Domain: {domain}
- Duration: {duration} hours
- Participant level: {level}
- Theme guidance: {theme_hint or "generate a compelling theme"}

Generate a JSON object with this EXACT structure:
{{
  "theme": "Catchy hackathon theme title",
  "tagline": "One-line description",
  "background": "2-3 sentence context and motivation",
  "problem_statements": [
    {{
      "id": 1,
      "title": "Problem title",
      "description": "Detailed problem description",
      "constraints": ["constraint 1", "constraint 2"],
      "starter_resources": ["resource url or description"],
      "difficulty": "easy|medium|hard"
    }}
  ],
  "evaluation_criteria": [
    {{"criterion": "Innovation", "weight": 25, "description": "..."}},
    {{"criterion": "Technical Execution", "weight": 30, "description": "..."}},
    {{"criterion": "Impact", "weight": 25, "description": "..."}},
    {{"criterion": "Presentation", "weight": 20, "description": "..."}}
  ],
  "judging_rubric": {{
    "round_1": "Automated scoring criteria",
    "round_2": "Expert panel criteria"
  }},
  "prizes": ["1st place description", "2nd place", "3rd place"],
  "timeline": [
    {{"time": "0h", "event": "Kickoff"}},
    {{"time": "24h", "event": "Midpoint check-in"}},
    {{"time": "48h", "event": "Final submission"}}
  ]
}}

Return only valid JSON."""

        raw = self.llm.generate(prompt, model="pro", temperature=0.9, max_tokens=4000)

        import json, re

        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        hackathon = json.loads(json_match.group()) if json_match else {}

        return {"hackathon": hackathon}


class CodeReviewerAgent(BaseAgent):
    """
    Reviews code diffs (pull requests or hackathon submissions).
    Returns structured feedback with line-level comments and an overall score.
    """

    @property
    def name(self) -> str:
        return "code_reviewer"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        diff = input_data.get("diff", "")
        context = input_data.get("context", "pull_request")  # or 'hackathon'
        language = input_data.get("language", "unknown")

        prompt = f"""You are an expert code reviewer for a {context}.
Language: {language}

Analyze this diff and return a JSON review:
{diff[:8000]}

Return JSON:
{{
  "overall_score": 75,
  "summary": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "issues": [
    {{
      "severity": "critical|major|minor|suggestion",
      "file": "filename",
      "line": 42,
      "comment": "Specific actionable feedback"
    }}
  ],
  "security_concerns": ["any security issues found"],
  "performance_notes": ["performance observations"],
  "suggested_improvements": ["top 3 improvements"]
}}"""

        raw = self.llm.generate(prompt, model="pro", temperature=0.3, max_tokens=3000)

        import json, re

        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        review = json.loads(json_match.group()) if json_match else {"summary": raw}

        return {"review": review, "score": review.get("overall_score", 0)}


class LearningPathAgent(BaseAgent):
    """
    Generates personalized learning paths based on user skills, goals,
    and performance history.
    """

    @property
    def name(self) -> str:
        return "path_generator"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        user_skills = input_data.get("skills", [])
        career_goal = input_data.get("career_goal", "software engineer")
        current_level = input_data.get("level", 1)
        weak_areas = input_data.get("weak_areas", [])

        prompt = f"""Design a personalized learning path.

User profile:
- Current skills: {", ".join(user_skills) or "beginner"}
- Career goal: {career_goal}
- Platform level: {current_level}/10
- Weak areas: {", ".join(weak_areas) or "none identified"}

Return a JSON learning path:
{{
  "title": "Your personalized path title",
  "estimated_weeks": 12,
  "phases": [
    {{
      "phase": 1,
      "title": "Foundation",
      "duration_weeks": 4,
      "focus": "What to master in this phase",
      "resources": [
        {{"type": "tutorial|course|project|quiz", "title": "...", "priority": "essential|recommended"}}
      ],
      "milestone": "What you can do after this phase"
    }}
  ],
  "daily_habit": "15-minute daily practice recommendation",
  "key_projects": ["project 1", "project 2", "project 3"]
}}"""

        raw = self.llm.generate(prompt, model="pro", temperature=0.7, max_tokens=3000)

        import json, re

        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        path = json.loads(json_match.group()) if json_match else {}

        return {"path": path}


class TutorialGeneratorAgent(BaseAgent):
    """
    Helps teachers rapidly draft complete tutorials.
    Given a topic and level, generates a full multi-section tutorial
    including content, code examples, and exercises.
    """

    @property
    def name(self) -> str:
        return "tutorial_generator"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        topic = input_data["topic"]
        domain = input_data.get("domain", "programming")
        difficulty = input_data.get("difficulty", "beginner")
        language = input_data.get("language", "python")

        prompt = f"""Create a complete interactive tutorial draft.

Topic: {topic}
Domain: {domain}
Difficulty: {difficulty}
Programming language: {language}

Return JSON:
{{
  "title": "Tutorial title",
  "description": "1-2 sentence description",
  "estimated_minutes": 20,
  "sections": [
    {{
      "title": "Section title",
      "content": "Full Markdown content with explanations (200-400 words)",
      "starter_code": "Code the student starts with",
      "solution_code": "Complete working solution",
      "exercise_prompt": "Clear exercise instruction",
      "exercise_test_cases": [
        {{"input": "...", "expected_output": "...", "is_hidden": false}}
      ]
    }}
  ],
  "tags": ["tag1", "tag2"],
  "prerequisites": ["prerequisite tutorial slugs"]
}}

Create 3-5 logical, progressive sections. Code examples must be runnable."""

        raw = self.llm.generate(prompt, model="pro", temperature=0.7, max_tokens=6000)

        import json, re

        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        tutorial = json.loads(json_match.group()) if json_match else {}

        return {"tutorial": tutorial}


class ContentModerationAgent(BaseAgent):
    """
    Screens Q&A posts for spam, toxicity, and off-topic content.
    Returns a moderation decision before content is published.
    """

    @property
    def name(self) -> str:
        return "moderator"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        content = input_data["content"]
        content_type = input_data.get("type", "question")  # question | answer

        prompt = f"""Moderate this {content_type} for a technical learning platform.

Content:
{content[:2000]}

Return JSON:
{{
  "decision": "approve|flag|reject",
  "confidence": 0.95,
  "reasons": ["reason if flagged/rejected"],
  "is_spam": false,
  "is_toxic": false,
  "is_off_topic": false,
  "suggested_tags": ["relevant tags if approve"]
}}"""

        raw = self.llm.generate(prompt, model="flash", temperature=0.1, max_tokens=500)

        import json, re

        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        result = (
            json.loads(json_match.group()) if json_match else {"decision": "approve"}
        )

        return result


class SemanticSearchAgent(BaseAgent):
    """
    Finds semantically similar content using vector embeddings.
    Used for: Q&A duplicate detection, tutorial recommendations,
    content search, personalized suggestions.
    """

    @property
    def name(self) -> str:
        return "semantic_search"

    def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates an embedding for the query and returns it for the caller
        to use in a pgvector similarity search.

        The actual database query is performed by the Node.js backend or
        directly via the /api/v1/search/semantic endpoint.
        """
        query = input_data["query"]
        top_k = input_data.get("top_k", 5)
        threshold = input_data.get("similarity_threshold", 0.75)

        embedding = self.embedder.embed(query)

        return {
            "query": query,
            "embedding": embedding,
            "top_k": top_k,
            "threshold": threshold,
        }


# ─────────────────────────────────────────────────────────────────────────────
# ORCHESTRATOR — singleton used across the entire AI service
# ─────────────────────────────────────────────────────────────────────────────


class BlueLearnerAI:
    """
    Central AI orchestrator.
    All agent calls go through here for unified logging, error handling,
    and performance metrics.

    Usage:
        from app.services.ai_orchestrator import ai
        result = ai.run("tutor", {"question": "...", "context": {...}})
    """

    def __init__(self):
        logger.info("[AI Orchestrator] Initialising...")

        self.llm = LLMClient()
        self.embedder = EmbeddingClient()
        self.cache = None  # Initialize lazily
        cache = self.cache

        # Register all agents
        self.agents: Dict[str, BaseAgent] = {
            name: cls(self.llm, self.embedder, cache)
            for name, cls in {
                "tutor": AITutorAgent,
                "quiz_generator": QuizGeneratorAgent,
                "hackathon_generator": HackathonGeneratorAgent,
                "code_reviewer": CodeReviewerAgent,
                "path_generator": LearningPathAgent,
                "tutorial_generator": TutorialGeneratorAgent,
                "moderator": ContentModerationAgent,
                "semantic_search": SemanticSearchAgent,
            }.items()
        }

        logger.info(f"[AI Orchestrator] Ready. Agents: {list(self.agents.keys())}")

    @property
    def cache(self):
        if self._cache is None:
            try:
                from app.core.database import redis_client

                if redis_client is not None:
                    self._cache = CacheService(redis_client)
                else:
                    self._cache = None
            except Exception:
                self._cache = None
        return self._cache

    @cache.setter
    def cache(self, value):
        self._cache = value

    def run(self, agent_name: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dispatch a request to the named agent.
        All calls are timed and logged for monitoring.
        """
        if agent_name not in self.agents:
            raise ValueError(
                f"Unknown agent: '{agent_name}'. Available: {list(self.agents.keys())}"
            )

        agent = self.agents[agent_name]
        start = time.perf_counter()

        try:
            result = agent.run(input_data)
            elapsed = (time.perf_counter() - start) * 1000
            logger.info(f"[Orchestrator] agent={agent_name} elapsed={elapsed:.0f}ms")
            return {"success": True, "agent": agent_name, **result}
        except Exception as exc:
            elapsed = (time.perf_counter() - start) * 1000
            logger.error(
                f"[Orchestrator] agent={agent_name} FAILED after {elapsed:.0f}ms: {exc}"
            )
            raise

    def list_agents(self) -> List[str]:
        return list(self.agents.keys())


# ─────────────────────────────────────────────────────────────────────────────
# Module-level singleton — imported by all API endpoints
# ─────────────────────────────────────────────────────────────────────────────

ai = BlueLearnerAI()
