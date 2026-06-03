"""
Quiz-related Pydantic schemas for AI services API.
Defines request/response models for quiz generation and evaluation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime


class DifficultyLevel(str, Enum):
    """Quiz difficulty levels."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class QuestionType(str, Enum):
    """Types of quiz questions."""
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    CODE = "code"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"


# ============================================================================
# Question Models
# ============================================================================

class QuestionOption(BaseModel):
    """Multiple choice question options."""
    A: str = Field(..., description="Option A")
    B: str = Field(..., description="Option B")
    C: str = Field(..., description="Option C")
    D: str = Field(..., description="Option D")


class GeneratedQuestion(BaseModel):
    """Individual generated quiz question."""
    question: str = Field(..., description="Question text")
    question_type: QuestionType = Field(
        QuestionType.MULTIPLE_CHOICE,
        description="Type of question"
    )
    options: QuestionOption = Field(..., description="Answer options (A, B, C, D)")
    correct_answer: str = Field(..., description="Correct answer (A, B, C, or D)")
    explanation: str = Field(..., description="Explanation of correct answer")
    difficulty: DifficultyLevel = Field(..., description="Question difficulty")
    topic: str = Field(..., description="Topic this question covers")
    estimated_time: int = Field(60, ge=10, le=600, description="Estimated time in seconds")
    tags: List[str] = Field(default_factory=list, description="Related tags")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "question": "What is the capital of France?",
                "question_type": "multiple_choice",
                "options": {
                    "A": "London",
                    "B": "Paris",
                    "C": "Berlin",
                    "D": "Madrid"
                },
                "correct_answer": "B",
                "explanation": "Paris is the capital of France.",
                "difficulty": "easy",
                "topic": "Geography",
                "estimated_time": 30,
                "tags": ["capital", "europe", "basic"]
            }
        }
    }


class TrueFalseQuestion(BaseModel):
    """True/False question model."""
    question: str
    correct_answer: bool
    explanation: str
    difficulty: DifficultyLevel
    topic: str
    tags: List[str] = []


class CodeQuestion(BaseModel):
    """Code-based question model."""
    question: str
    starter_code: str = Field(..., description="Initial code template")
    test_cases: List[Dict[str, str]] = Field(..., description="Test cases with input/expected output")
    solution: str = Field(..., description="Complete solution code")
    difficulty: DifficultyLevel
    topic: str
    language: str = Field("python", description="Programming language")
    tags: List[str] = []


# ============================================================================
# Quiz Generation Request/Response
# ============================================================================

class GenerateQuizRequest(BaseModel):
    """Request to generate a quiz."""
    topic: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Topic for quiz generation"
    )
    difficulty: DifficultyLevel = Field(
        DifficultyLevel.MEDIUM,
        description="Desired difficulty level"
    )
    num_questions: int = Field(
        10,
        ge=1,
        le=50,
        description="Number of questions to generate (1-50)"
    )
    question_type: Optional[QuestionType] = Field(
        None,
        description="Type of questions to generate"
    )
    context: Optional[str] = Field(
        None,
        max_length=1000,
        description="Additional context or learning materials"
    )
    language: Optional[str] = Field(
        "english",
        description="Language for questions"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "topic": "Python List Comprehension",
                "difficulty": "medium",
                "num_questions": 5,
                "question_type": "multiple_choice",
                "context": "Focus on practical examples"
            }
        }
    }


class GenerateQuizResponse(BaseModel):
    """Response containing generated quiz."""
    questions: List[GeneratedQuestion] = Field(..., description="Generated questions")
    total_questions: int = Field(..., description="Total number of questions")
    estimated_duration: int = Field(..., ge=0, description="Estimated duration in minutes")
    difficulty_distribution: Dict[str, int] = Field(
        ...,
        description="Count of questions by difficulty"
    )
    generated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When the quiz was generated"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "total_questions": 5,
                "estimated_duration": 15,
                "difficulty_distribution": {
                    "easy": 2,
                    "medium": 2,
                    "hard": 1
                }
            }
        }
    }


# ============================================================================
# Quiz Submission & Evaluation
# ============================================================================

class QuestionAnswer(BaseModel):
    """User's answer to a question."""
    question_index: int = Field(..., ge=0, description="Index of question in quiz")
    selected_answer: str = Field(..., description="User's selected answer (A, B, C, D)")
    time_taken: int = Field(..., ge=0, description="Time spent in seconds")
    is_correct: Optional[bool] = Field(None, description="Whether answer is correct")


class SubmitQuizRequest(BaseModel):
    """Submit completed quiz for evaluation."""
    quiz_id: str = Field(..., description="Generated quiz ID")
    user_id: int = Field(..., description="User ID")
    user_name: str = Field(..., description="User name")
    answers: List[QuestionAnswer] = Field(..., description="User's answers")
    total_time: int = Field(..., ge=0, description="Total time spent in seconds")


class QuestionEvaluation(BaseModel):
    """Evaluation of a single question."""
    question_index: int
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    time_taken: int


class SubmitQuizResponse(BaseModel):
    """Response with quiz evaluation."""
    quiz_id: str
    user_id: int
    score: float = Field(..., ge=0, le=100, description="Score as percentage")
    correct_count: int
    total_count: int
    evaluations: List[QuestionEvaluation]
    time_analysis: Dict[str, int] = Field(
        ...,
        description="Time statistics (total, average, etc)"
    )
    performance_level: str = Field(
        ...,
        description="Performance level (Excellent, Good, Fair, Poor)"
    )
    feedback: str = Field(..., description="Personalized feedback")
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "quiz_id": "quiz_123",
                "user_id": 456,
                "score": 80.0,
                "correct_count": 4,
                "total_count": 5,
                "performance_level": "Good",
                "feedback": "Great work! Keep practicing harder topics."
            }
        }
    }


# ============================================================================
# Difficulty Prediction
# ============================================================================

class PredictDifficultyRequest(BaseModel):
    """Request to predict question difficulty."""
    question_text: str = Field(..., min_length=10, description="Question text")
    options: Optional[List[str]] = Field(
        None,
        min_items=2,
        max_items=5,
        description="Answer options (if multiple choice)"
    )
    topic: Optional[str] = Field(None, description="Topic of question")
    context: Optional[str] = Field(None, description="Additional context")


class PredictDifficultyResponse(BaseModel):
    """Predicted difficulty for a question."""
    difficulty: DifficultyLevel = Field(..., description="Predicted difficulty")
    confidence: float = Field(
        ...,
        ge=0,
        le=1,
        description="Confidence score (0-1)"
    )
    probabilities: Dict[str, float] = Field(
        ...,
        description="Probability for each difficulty level"
    )
    reasoning: Optional[str] = Field(None, description="Reasoning for prediction")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "difficulty": "medium",
                "confidence": 0.85,
                "probabilities": {
                    "easy": 0.05,
                    "medium": 0.85,
                    "hard": 0.08,
                    "expert": 0.02
                }
            }
        }
    }


# ============================================================================
# Personalized & Adaptive Quizzes
# ============================================================================

class PersonalizedQuizRequest(BaseModel):
    """Request for personalized quiz based on user profile."""
    user_id: int
    topic: str = Field(..., description="Topic for personalized quiz")
    num_questions: int = Field(10, ge=1, le=50)
    target_difficulty: Optional[DifficultyLevel] = Field(None, description="Target difficulty")
    learning_style: Optional[str] = Field(
        None,
        description="User's learning style (visual, auditory, kinesthetic, etc)"
    )
    prev_performance: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Previous performance score on this topic"
    )


class UserProfile(BaseModel):
    """User learning profile."""
    user_id: int
    topics_covered: List[str]
    average_performance: Dict[str, float]
    preferred_difficulty: DifficultyLevel
    learning_pace: str  # "slow", "normal", "fast"
    weak_areas: List[str]
    strong_areas: List[str]


class AdaptiveQuizResponse(GenerateQuizResponse):
    """Adaptive quiz response with personalization info."""
    user_profile_summary: Dict = Field(..., description="Summary of user profile")
    recommended_topics: List[str] = Field(
        default_factory=list,
        description="Recommended topics to study"
    )
    personalization_notes: Optional[str] = Field(
        None,
        description="Notes on personalization applied"
    )


# ============================================================================
# Analytics & Progress
# ============================================================================

class QuizAttempt(BaseModel):
    """Record of a quiz attempt."""
    quiz_id: str
    user_id: int
    score: float
    correct_count: int
    total_count: int
    duration: int  # seconds
    attempted_at: datetime
    difficulty: DifficultyLevel
    topic: str


class UserProgress(BaseModel):
    """User's progress on a topic."""
    user_id: int
    topic: str
    total_attempts: int
    average_score: float
    best_score: float
    worst_score: float
    improvement_rate: float  # score improvement percentage
    last_attempt: Optional[datetime] = None
    mastery_level: str  # "beginner", "intermediate", "advanced", "expert"


class TopicMastery(BaseModel):
    """Mastery level for a specific topic."""
    topic: str
    mastery_percentage: float = Field(..., ge=0, le=100)
    quizzes_attempted: int
    average_score: float
    last_updated: datetime
    next_recommended_difficulty: DifficultyLevel


# ============================================================================
# Batch Operations
# ============================================================================

class BatchGenerateQuizRequest(BaseModel):
    """Request to generate multiple quizzes."""
    quizzes: List[GenerateQuizRequest] = Field(..., min_items=1, max_items=10)
    batch_id: Optional[str] = Field(None, description="Optional batch identifier")


class BatchGenerateQuizResponse(BaseModel):
    """Response with multiple generated quizzes."""
    batch_id: str
    quizzes: List[GenerateQuizResponse]
    total_questions: int
    generated_at: datetime


# ============================================================================
# Export all schemas
# ============================================================================

__all__ = [
    # Enums
    "DifficultyLevel",
    "QuestionType",
    # Question models
    "QuestionOption",
    "GeneratedQuestion",
    "TrueFalseQuestion",
    "CodeQuestion",
    # Quiz generation
    "GenerateQuizRequest",
    "GenerateQuizResponse",
    # Quiz submission
    "QuestionAnswer",
    "SubmitQuizRequest",
    "QuestionEvaluation",
    "SubmitQuizResponse",
    # Difficulty prediction
    "PredictDifficultyRequest",
    "PredictDifficultyResponse",
    # Personalized quizzes
    "PersonalizedQuizRequest",
    "UserProfile",
    "AdaptiveQuizResponse",
    # Analytics
    "QuizAttempt",
    "UserProgress",
    "TopicMastery",
    # Batch operations
    "BatchGenerateQuizRequest",
    "BatchGenerateQuizResponse",
]
