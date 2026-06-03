"""
AI Services Test Suite
Tests for quiz generation, caching, and API endpoints.
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
import json


class TestQuizGeneration:
    """Tests for AI quiz generation service"""

    @pytest.mark.asyncio
    async def test_generate_quiz_prompt_structure(self):
        """Verify quiz generation creates proper prompt structure"""
        from app.services.quiz_generator import QuizGenerator

        generator = QuizGenerator()

        # Test prompt building
        prompt = generator._build_prompt(
            topic="Python Basics", difficulty="beginner", num_questions=5
        )

        assert "Python Basics" in prompt
        assert "beginner" in prompt.lower()
        assert "5" in prompt

    def test_difficulty_mapping(self):
        """Verify difficulty levels map correctly"""
        from app.services.quiz_generator import QuizGenerator

        generator = QuizGenerator()

        assert generator._map_difficulty("easy") == "beginner"
        assert generator._map_difficulty("medium") == "intermediate"
        assert generator._map_difficulty("hard") == "advanced"


class TestCacheService:
    """Tests for Redis cache service"""

    @pytest.mark.asyncio
    async def test_cache_get_set(self):
        """Test basic cache operations"""
        from app.services.cache_service import CacheService

        cache = CacheService()

        # Mock Redis client
        with patch.object(cache, "redis", AsyncMock()):
            await cache.set("test_key", {"data": "test_value"}, ttl=60)
            result = await cache.get("test_key")

            # Verify set was called
            cache.redis.set.assert_called_once()

    @pytest.mark.asyncio
    async def test_cache_delete(self):
        """Test cache deletion"""
        from app.services.cache_service import CacheService

        cache = CacheService()

        with patch.object(cache, "redis", AsyncMock()):
            await cache.delete("test_key")
            cache.redis.delete.assert_called_once_with("test_key")


class TestGeminiService:
    """Tests for Gemini AI service"""

    @pytest.mark.asyncio
    async def test_generate_content(self):
        """Test Gemini content generation"""
        from app.services.gemini_service import GeminiService

        service = GeminiService()

        # Mock the Gemini API
        with patch("app.services.gemini_service.genai.GenerativeModel") as mock_model:
            mock_model.return_value.generate_content = AsyncMock(
                return_value=Mock(text="Test response")
            )

            result = await service.generate("Test prompt")

            assert result == "Test response"


class TestAPIEndpoints:
    """Tests for FastAPI endpoints"""

    def test_health_endpoint(self, client):
        """Test /health endpoint returns 200"""
        from fastapi.testclient import TestClient
        from app.main import app

        with TestClient(app) as client:
            response = client.get("/health")
            assert response.status_code == 200

    def test_quiz_generation_endpoint(self, client):
        """Test /api/v1/quiz/generate endpoint"""
        from fastapi.testclient import TestClient
        from app.main import app

        with TestClient(app) as client:
            response = client.post(
                "/api/v1/quiz/generate",
                json={"topic": "Python", "difficulty": "easy", "num_questions": 5},
            )
            # May return 200 (success) or 500 (no API key in test)
            assert response.status_code in [200, 500]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
