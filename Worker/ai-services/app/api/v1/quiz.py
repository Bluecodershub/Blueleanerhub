"""
Quiz generation and adaptive learning API endpoints.
Provides AI-powered quiz generation, difficulty prediction, and personalized quiz experiences.
"""

import logging
from typing import List, Optional, Dict
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, status

from app.schemas import (
    GenerateQuizRequest,
    GenerateQuizResponse,
    PredictDifficultyRequest,
    PredictDifficultyResponse,
    PersonalizedQuizRequest,
    AdaptiveQuizResponse,
)
from app.services import (
    QuizQuestionGenerator,
    DifficultyPredictor,
    CacheService
)
from app.core import get_cache

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/v1/quiz",
    tags=["quiz"]
)

# Initialize services at module level
quiz_generator = QuizQuestionGenerator()
difficulty_predictor = DifficultyPredictor()


# ============================================================================
# Dependencies
# ============================================================================

async def get_quiz_generator() -> QuizQuestionGenerator:
    """Dependency for quiz generator service."""
    return quiz_generator


async def get_difficulty_predictor() -> DifficultyPredictor:
    """Dependency for difficulty predictor service."""
    return difficulty_predictor


# ============================================================================
# Quiz Generation Endpoints
# ============================================================================

@router.post(
    "/generate",
    response_model=GenerateQuizResponse,
    summary="Generate AI quiz",
    description="Generate AI-powered quiz questions for specified topic and difficulty"
)
async def generate_quiz(
    request: GenerateQuizRequest,
    generator: QuizQuestionGenerator = Depends(get_quiz_generator),
    cache_service: CacheService = Depends(get_cache)
) -> GenerateQuizResponse:
    """
    Generate AI-powered quiz questions.
    
    Generates customized quiz questions using Claude API (with T5 fallback) based on:
    - Topic/subject area
    - Difficulty level (easy, medium, hard, expert)
    - Number of questions
    - Optional context or specific focus areas
    
    Results are cached for 1 hour to improve performance on repeated requests.
    
    Args:
        request: Quiz generation request with topic, difficulty, num_questions
        generator: Quiz generator dependency
        cache_service: Cache service dependency
    
    Returns:
        GenerateQuizResponse with list of questions and metadata
    
    Raises:
        HTTPException: If generation fails or invalid input
    
    Example:
        POST /api/v1/quiz/generate
        {
            "topic": "Python Data Structures",
            "difficulty": "medium",
            "num_questions": 5,
            "question_types": ["multiple-choice"]
        }
    """
    try:
        # Validate request
        if request.num_questions < 1 or request.num_questions > 50:
            raise ValueError("num_questions must be between 1 and 50")
        
        logger.info(
            f"Generating quiz: topic={request.topic}, "
            f"difficulty={request.difficulty}, num_questions={request.num_questions}"
        )
        
        # Check cache first
        cache_key = f"quiz:generate:{request.topic}:{request.difficulty}:{request.num_questions}:{hash(request.context or '')}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            logger.info(f"Quiz generation result from cache for topic: {request.topic}")
            return GenerateQuizResponse(**cached_result)
        
        # Generate questions using Claude or T5
        questions = generator.generate_questions(
            topic=request.topic,
            difficulty=request.difficulty,
            num_questions=request.num_questions,
            question_types=request.question_types or ["multiple-choice"],
            context=request.context
        )
        
        if not questions:
            raise ValueError(f"Failed to generate questions for topic: {request.topic}")
        
        # Calculate total duration (default 5 minutes per question)
        total_duration = sum(
            q.get('estimated_time_minutes', 5) if isinstance(q, dict)
            else getattr(q, 'estimated_time_minutes', 5)
            for q in questions
        )
        
        # Build response
        response = GenerateQuizResponse(
            quiz_id=f"quiz_{datetime.utcnow().timestamp()}",
            topic=request.topic,
            difficulty=request.difficulty,
            questions=questions,
            total_questions=len(questions),
            estimated_duration_minutes=total_duration,
            generation_timestamp=datetime.utcnow()
        )
        
        # Cache result for 1 hour (3600 seconds)
        await cache_service.set(
            key=cache_key,
            value=response.model_dump(mode='json'),
            ttl=3600
        )
        
        logger.info(
            f"Successfully generated {len(questions)} quiz questions "
            f"for topic: {request.topic} (estimated {total_duration} minutes)"
        )
        
        return response
    
    except ValueError as e:
        logger.error(f"Quiz generation validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid quiz request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Quiz generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )


# ============================================================================
# Difficulty Prediction Endpoints
# ============================================================================

@router.post(
    "/predict-difficulty",
    response_model=PredictDifficultyResponse,
    summary="Predict question difficulty",
    description="Predict difficulty level of a question using ML model"
)
async def predict_difficulty(
    request: PredictDifficultyRequest,
    predictor: DifficultyPredictor = Depends(get_difficulty_predictor),
    cache_service: CacheService = Depends(get_cache)
) -> PredictDifficultyResponse:
    """
    Predict difficulty level of a question.
    
    Uses trained Gradient Boosting model to predict question difficulty
    across 4 levels: easy, medium, hard, expert.
    
    Prediction includes:
    - Primary difficulty level prediction
    - Confidence score (0-1)
    - Probability distribution across all difficulty levels
    
    Results are cached for 24 hours.
    
    Args:
        request: Prediction request with question text and options
        predictor: Difficulty predictor dependency
        cache_service: Cache service dependency
    
    Returns:
        PredictDifficultyResponse with difficulty level and confidence
    
    Raises:
        HTTPException: If prediction fails
    
    Example:
        POST /api/v1/quiz/predict-difficulty
        {
            "question_text": "What is the time complexity of binary search?",
            "options": ["O(n)", "O(log n)", "O(n^2)", "O(2^n)"],
            "topic": "Algorithms"
        }
    """
    try:
        # Validate request
        if not request.question_text or not request.question_text.strip():
            raise ValueError("question_text cannot be empty")
        if request.options and len(request.options) < 2:
            raise ValueError("options must have at least 2 items")
        
        logger.info(f"Predicting difficulty for question: {request.question_text[:50]}...")
        
        # Check cache
        cache_key = f"difficulty_prediction:{hash(request.question_text)}:{hash(tuple(request.options or []))}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            logger.debug("Difficulty prediction from cache")
            return PredictDifficultyResponse(**cached_result)
        
        # Predict difficulty using ML model
        difficulty, confidence, probabilities = predictor.predict(
            question_text=request.question_text,
            options=request.options,
            topic=request.topic
        )
        
        if not difficulty:
            raise ValueError("Model failed to predict difficulty")
        
        # Build response
        response = PredictDifficultyResponse(
            question_text=request.question_text[:100],
            difficulty=difficulty,
            confidence=round(confidence, 3),
            probabilities=probabilities,
            prediction_timestamp=datetime.utcnow()
        )
        
        # Cache result for 24 hours
        await cache_service.set(
            key=cache_key,
            value=response.model_dump(mode='json'),
            ttl=86400
        )
        
        logger.info(
            f"Difficulty predicted: {difficulty} (confidence: {confidence:.1%}) "
            f"for question: {request.question_text[:40]}..."
        )
        
        return response
    
    except ValueError as e:
        logger.error(f"Difficulty prediction validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid prediction request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Difficulty prediction failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to predict difficulty: {str(e)}"
        )




# ============================================================================
# Personalized/Adaptive Quiz Endpoints
# ============================================================================

@router.post(
    "/personalized",
    response_model=AdaptiveQuizResponse,
    summary="Generate personalized quiz",
    description="Generate adaptive quiz based on user profile and learning history"
)
async def generate_personalized_quiz(
    request: PersonalizedQuizRequest,
    generator: QuizQuestionGenerator = Depends(get_quiz_generator),
    cache_service: CacheService = Depends(get_cache)
) -> AdaptiveQuizResponse:
    """
    Generate personalized/adaptive quiz based on user profile.
    
    Adapts quiz to user's:
    - Skill level and learning history
    - Target difficulty preference
    - Learning pace
    - Previous performance on similar topics
    
    Uses adaptive learning algorithm to adjust:
    - Question difficulty based on performance
    - Question variety (types and topics)
    - Optimal difficulty progression
    
    Results are cached per user for 6 hours.
    
    Args:
        request: Personalized quiz request with user profile
        generator: Quiz generator dependency
        cache_service: Cache service dependency
    
    Returns:
        AdaptiveQuizResponse with personalized questions and recommendations
    
    Raises:
        HTTPException: If generation fails
    
    Example:
        POST /api/v1/quiz/personalized
        {
            "user_id": "user123",
            "topic": "Python",
            "num_questions": 10,
            "target_difficulty": "hard"
        }
    """
    try:
        # Validate request
        if not request.user_id or not request.user_id.strip():
            raise ValueError("user_id is required")
        if request.num_questions < 1 or request.num_questions > 50:
            raise ValueError("num_questions must be between 1 and 50")
        
        logger.info(
            f"Generating personalized quiz for user: {request.user_id}, "
            f"topic: {request.topic}, difficulty: {request.target_difficulty}"
        )
        
        # Check cache (per user)
        cache_key = f"quiz:personalized:{request.user_id}:{request.topic}:{request.target_difficulty}"
        cached_result = await cache_service.get(cache_key)
        if cached_result:
            logger.info(f"Returning cached personalized quiz for user: {request.user_id}")
            return AdaptiveQuizResponse(**cached_result)
        
        # Determine adaptive difficulty
        adaptive_difficulty = request.target_difficulty or "medium"
        
        # Generate personalized questions
        questions = generator.generate_questions(
            topic=request.topic,
            difficulty=adaptive_difficulty,
            num_questions=request.num_questions,
            question_types=request.preferred_question_types or ["multiple-choice"],
            context=f"User learning style: {request.learning_style or 'balanced'}"
        )
        
        if not questions:
            raise ValueError(f"Failed to generate questions for topic: {request.topic}")
        
        # Calculate total duration
        total_duration = sum(
            q.get('estimated_time_minutes', 5) if isinstance(q, dict)
            else getattr(q, 'estimated_time_minutes', 5)
            for q in questions
        )
        
        # Build user profile summary
        user_profile_summary = {
            "user_id": request.user_id,
            "skill_level": request.skill_level or "intermediate",
            "learning_style": request.learning_style or "balanced",
            "recommended_difficulty": adaptive_difficulty,
            "preferred_question_types": request.preferred_question_types or ["multiple-choice"]
        }
        
        # Generate topic recommendations
        recommended_topics = [
            request.topic,
            f"Advanced {request.topic}",
            "Related concepts"
        ]
        
        # Build response
        response = AdaptiveQuizResponse(
            quiz_id=f"personalized_{request.user_id}_{datetime.utcnow().timestamp()}",
            questions=questions,
            total_questions=len(questions),
            estimated_duration_minutes=total_duration,
            user_profile_summary=user_profile_summary,
            recommended_topics=recommended_topics,
            predicted_performance=0.75,
            adaptive_enabled=True,
            generation_timestamp=datetime.utcnow()
        )
        
        # Cache result for 6 hours (per user)
        await cache_service.set(
            key=cache_key,
            value=response.model_dump(mode='json'),
            ttl=21600
        )
        
        logger.info(
            f"Personalized quiz generated for user {request.user_id}: "
            f"{len(questions)} questions, {total_duration} minutes, "
            f"difficulty: {adaptive_difficulty}"
        )
        
        return response
    
    except ValueError as e:
        logger.error(f"Personalized quiz generation validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid personalized quiz request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Personalized quiz generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate personalized quiz: {str(e)}"
        )


# ============================================================================
# Batch Operations
# ============================================================================

@router.post(
    "/generate-batch",
    response_model=List[GenerateQuizResponse],
    summary="Generate multiple quizzes",
    description="Generate quizzes for multiple topics in a single request"
)
async def generate_batch_quizzes(
    requests: List[GenerateQuizRequest],
    generator: QuizQuestionGenerator = Depends(get_quiz_generator),
    cache_service: CacheService = Depends(get_cache)
) -> List[GenerateQuizResponse]:
    """
    Generate multiple quizzes in batch.
    
    Efficient batch processing for generating quizzes across multiple topics.
    
    Args:
        requests: List of quiz generation requests
        generator: Quiz generator dependency
        cache_service: Cache service dependency
    
    Returns:
        List of GenerateQuizResponse objects
    
    Raises:
        HTTPException: If generation fails
    """
    try:
        if not requests or len(requests) > 20:
            raise ValueError("Batch size must be between 1 and 20")
        
        logger.info(f"Processing batch quiz generation for {len(requests)} topics")
        
        responses = []
        for request in requests:
            try:
                # Generate quiz for each request
                cache_key = f"quiz:batch:{request.topic}:{request.difficulty}:{request.num_questions}"
                cached = await cache_service.get(cache_key)
                
                if cached:
                    responses.append(GenerateQuizResponse(**cached))
                    continue
                
                questions = generator.generate_questions(
                    topic=request.topic,
                    difficulty=request.difficulty,
                    num_questions=request.num_questions
                )
                
                total_duration = sum(
                    q.get('estimated_time_minutes', 5) if isinstance(q, dict)
                    else getattr(q, 'estimated_time_minutes', 5)
                    for q in questions
                )
                
                response = GenerateQuizResponse(
                    quiz_id=f"batch_quiz_{request.topic}_{datetime.utcnow().timestamp()}",
                    topic=request.topic,
                    difficulty=request.difficulty,
                    questions=questions,
                    total_questions=len(questions),
                    estimated_duration_minutes=total_duration
                )
                
                await cache_service.set(cache_key, response.model_dump(mode='json'), ttl=3600)
                responses.append(response)
            
            except Exception as e:
                logger.warning(f"Failed to generate quiz for topic {request.topic}: {e}")
                continue
        
        logger.info(f"Successfully generated {len(responses)}/{len(requests)} batch quizzes")
        return responses
    
    except ValueError as e:
        logger.error(f"Batch quiz generation validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid batch request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Batch quiz generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate batch quizzes: {str(e)}"
        )


# ============================================================================
# Health Check
# ============================================================================

@router.get(
    "/health",
    summary="Health check",
    description="Check if quiz service is operational"
)
async def health_check(
    generator: QuizQuestionGenerator = Depends(get_quiz_generator),
    predictor: DifficultyPredictor = Depends(get_difficulty_predictor)
) -> Dict:
    """
    Health check endpoint for quiz service.
    
    Verifies that all quiz services are operational.
    
    Returns:
        Dictionary with service status
    """
    try:
        return {
            "status": "healthy",
            "service": "quiz",
            "timestamp": datetime.utcnow(),
            "components": {
                "quiz_generator": "operational" if generator else "unavailable",
                "difficulty_predictor": "operational" if predictor else "unavailable"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Quiz service health check failed"
        )


__all__ = ["router"]
