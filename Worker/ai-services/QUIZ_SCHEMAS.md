# Quiz Schemas Guide

Complete reference for quiz request/response schemas in EdTech AI Services.

## Overview

The quiz schemas define all data models for quiz-related operations:
- **Quiz Generation** - Create new quizzes based on topics
- **Quiz Submission** - Submit answers for evaluation
- **Difficulty Prediction** - Predict question complexity
- **Personalization** - Adaptive quizzes based on user profile
- **Analytics** - Track progress and learning outcomes

## Quick Start

### Generate a Quiz

```python
from app.schemas import GenerateQuizRequest, DifficultyLevel

request = GenerateQuizRequest(
    topic="Python List Comprehension",
    difficulty=DifficultyLevel.MEDIUM,
    num_questions=5
)

# POST /api/v1/quiz/generate
response = await generate_quiz(request)
# Returns: GenerateQuizResponse with 5 questions
```

### Submit Quiz

```python
from app.schemas import SubmitQuizRequest, QuestionAnswer

answers = [
    QuestionAnswer(question_index=0, selected_answer="A", time_taken=30),
    QuestionAnswer(question_index=1, selected_answer="B", time_taken=45),
]

request = SubmitQuizRequest(
    quiz_id="quiz_123",
    user_id=456,
    user_name="John Doe",
    answers=answers,
    total_time=120
)

# POST /api/v1/quiz/submit
response = await submit_quiz(request)
# Returns: SubmitQuizResponse with score, feedback, etc
```

## Enums

### DifficultyLevel

Difficulty levels for questions and quizzes:

```python
from app.schemas import DifficultyLevel

# Available levels
DifficultyLevel.EASY      # For beginners
DifficultyLevel.MEDIUM    # Intermediate difficulty
DifficultyLevel.HARD      # Advanced challenges
DifficultyLevel.EXPERT    # Mastery level
```

### QuestionType

Types of questions supported:

```python
from app.schemas import QuestionType

# Available types
QuestionType.MULTIPLE_CHOICE   # A/B/C/D options
QuestionType.TRUE_FALSE        # Boolean answers
QuestionType.CODE              # Programming tasks
QuestionType.SHORT_ANSWER      # Brief text responses
QuestionType.ESSAY             # Extended text responses
```

## Core Models

### GenerateQuizRequest

Request to generate a new quiz.

```python
from app.schemas import GenerateQuizRequest, DifficultyLevel, QuestionType

request = GenerateQuizRequest(
    topic="Python List Comprehension",           # Required
    difficulty=DifficultyLevel.MEDIUM,           # Required
    num_questions=10,                             # Default: 10, Range: 1-50
    question_type=QuestionType.MULTIPLE_CHOICE,  # Optional
    context="Focus on practical examples",       # Optional
    language="english"                            # Default: english
)
```

**Fields:**
- `topic` (str): Subject to create quiz for (1-200 chars)
- `difficulty` (DifficultyLevel): Difficulty level
- `num_questions` (int): Number of questions (1-50)
- `question_type` (QuestionType, optional): Type of questions
- `context` (str, optional): Additional context (max 1000 chars)
- `language` (str, optional): Language for questions

### GenerateQuizResponse

Response with generated quiz questions.

```python
{
    "questions": [
        {
            "question": "What is Python?",
            "question_type": "multiple_choice",
            "options": {
                "A": "A programming language",
                "B": "A snake species",
                "C": "A website type",
                "D": "A JavaScript module"
            },
            "correct_answer": "A",
            "explanation": "Python is a popular programming language...",
            "difficulty": "easy",
            "topic": "Python Basics",
            "estimated_time": 60,
            "tags": ["basics", "programming"]
        },
        # ... more questions
    ],
    "total_questions": 10,
    "estimated_duration": 15,  # minutes
    "difficulty_distribution": {
        "easy": 3,
        "medium": 4,
        "hard": 2,
        "expert": 1
    },
    "generated_at": "2026-03-01T10:30:00"
}
```

**Fields:**
- `questions` (List[GeneratedQuestion]): Generated questions
- `total_questions` (int): Total number of questions
- `estimated_duration` (int): Estimated time in minutes
- `difficulty_distribution` (Dict): Count by difficulty
- `generated_at` (datetime): When generated

### GeneratedQuestion

Individual quiz question.

```python
{
    "question": "What is Python?",
    "question_type": "multiple_choice",
    "options": {
        "A": "A programming language",
        "B": "A snake species",
        "C": "A website type",
        "D": "A JavaScript module"
    },
    "correct_answer": "A",
    "explanation": "Python is a popular programming language...",
    "difficulty": "medium",
    "topic": "Python Basics",
    "estimated_time": 60,  # seconds
    "tags": ["basics", "programming"]
}
```

**Fields:**
- `question` (str): Question text
- `question_type` (QuestionType): Type of question
- `options` (QuestionOption): A, B, C, D options
- `correct_answer` (str): Correct option (A, B, C, or D)
- `explanation` (str): Why the answer is correct
- `difficulty` (DifficultyLevel): Question difficulty
- `topic` (str): Related topic
- `estimated_time` (int): Time estimate in seconds (10-600)
- `tags` (List[str]): Related tags

## Submission & Evaluation

### SubmitQuizRequest

Submit completed quiz for evaluation.

```python
from app.schemas import SubmitQuizRequest, QuestionAnswer

request = SubmitQuizRequest(
    quiz_id="quiz_123",
    user_id=456,
    user_name="John Doe",
    answers=[
        QuestionAnswer(
            question_index=0,
            selected_answer="A",
            time_taken=30
        ),
        QuestionAnswer(
            question_index=1,
            selected_answer="B",
            time_taken=45
        ),
    ],
    total_time=120  # seconds
)
```

**Fields:**
- `quiz_id` (str): ID of quiz being submitted
- `user_id` (int): User submitting quiz
- `user_name` (str): User's name
- `answers` (List[QuestionAnswer]): User's answers
- `total_time` (int): Total time spent in seconds

### SubmitQuizResponse

Evaluation result with score and feedback.

```python
{
    "quiz_id": "quiz_123",
    "user_id": 456,
    "score": 80.0,                          # Percentage (0-100)
    "correct_count": 8,
    "total_count": 10,
    "evaluations": [
        {
            "question_index": 0,
            "question": "What is Python?",
            "user_answer": "A",
            "correct_answer": "A",
            "is_correct": true,
            "explanation": "Python is...",
            "time_taken": 30
        },
        # ... more evaluations
    ],
    "time_analysis": {
        "total": 120,
        "average_per_question": 12
    },
    "performance_level": "Good",            # Excellent/Good/Fair/Poor
    "feedback": "Great work! Keep practicing to improve further.",
    "submitted_at": "2026-03-01T10:30:00"
}
```

**Fields:**
- `quiz_id` (str): Quiz ID
- `user_id` (int): User ID
- `score` (float): Score as percentage (0-100)
- `correct_count` (int): Correct answers
- `total_count` (int): Total questions
- `evaluations` (List[QuestionEvaluation]): Per-question evaluation
- `time_analysis` (Dict): Time statistics
- `performance_level` (str): Performance category
- `feedback` (str): Personalized feedback
- `submitted_at` (datetime): When submitted

## Difficulty Prediction

### PredictDifficultyRequest

Request to predict question difficulty.

```python
from app.schemas import PredictDifficultyRequest

request = PredictDifficultyRequest(
    question_text="What is the capital of Germany?",
    options=["Berlin", "Munich", "Hamburg", "Dresden"],
    topic="Geography",
    context="European capitals"
)
```

### PredictDifficultyResponse

Predicted difficulty with confidence.

```python
{
    "difficulty": "easy",
    "confidence": 0.92,                 # 0-1 confidence
    "probabilities": {
        "easy": 0.92,
        "medium": 0.07,
        "hard": 0.01,
        "expert": 0.00
    },
    "reasoning": "Straightforward geographic fact question"
}
```

## Personalization

### PersonalizedQuizRequest

Request adaptive quiz for user.

```python
from app.schemas import PersonalizedQuizRequest, DifficultyLevel

request = PersonalizedQuizRequest(
    user_id=456,
    topic="Data Structures",
    num_questions=10,
    target_difficulty=DifficultyLevel.HARD,
    learning_style="visual",
    prev_performance=82.5
)
```

**Fields:**
- `user_id` (int): User ID
- `topic` (str): Quiz topic
- `num_questions` (int): Number of questions
- `target_difficulty` (DifficultyLevel, optional): Desired difficulty
- `learning_style` (str, optional): User's learning style
- `prev_performance` (float, optional): Previous score (0-100)

### AdaptiveQuizResponse

Quiz response with personalization info.

```python
{
    # ... all GenerateQuizResponse fields ...
    "user_profile_summary": {
        "strong_areas": ["Python", "Data Structures"],
        "weak_areas": ["Algorithms", "System Design"],
        "learning_pace": "normal"
    },
    "recommended_topics": [
        "Advanced Algorithms",
        "Distributed Systems"
    ],
    "personalization_notes": "Difficulty adjusted based on 82%+ average"
}
```

## Analytics Models

### UserProgress

User's progress on a topic.

```python
{
    "user_id": 456,
    "topic": "Python Basics",
    "total_attempts": 5,
    "average_score": 82.0,
    "best_score": 95.0,
    "worst_score": 65.0,
    "improvement_rate": 15.0,          # percentage improvement
    "last_attempt": "2026-03-01T10:30:00",
    "mastery_level": "intermediate"    # beginner/intermediate/advanced/expert
}
```

### TopicMastery

Mastery level for specific topic.

```python
{
    "topic": "Python Basics",
    "mastery_percentage": 82.5,        # 0-100
    "quizzes_attempted": 8,
    "average_score": 80.0,
    "last_updated": "2026-03-01T10:30:00",
    "next_recommended_difficulty": "hard"
}
```

## Batch Operations

### BatchGenerateQuizRequest

Generate multiple quizzes at once.

```python
from app.schemas import BatchGenerateQuizRequest, GenerateQuizRequest

request = BatchGenerateQuizRequest(
    quizzes=[
        GenerateQuizRequest(topic="Python", difficulty="medium"),
        GenerateQuizRequest(topic="JavaScript", difficulty="medium"),
        GenerateQuizRequest(topic="SQL", difficulty="easy"),
    ],
    batch_id="batch_001"  # Optional
)
```

**Limits:**
- Minimum: 1 quiz
- Maximum: 10 quizzes

### BatchGenerateQuizResponse

Response with multiple quizzes.

```python
{
    "batch_id": "batch_001",
    "quizzes": [
        # ... GenerateQuizResponse objects ...
    ],
    "total_questions": 25,
    "generated_at": "2026-03-01T10:30:00"
}
```

## Usage Examples

### Example 1: Generate Quiz

```python
from app.schemas import GenerateQuizRequest, DifficultyLevel, QuestionType

# Create request
request = GenerateQuizRequest(
    topic="Python List Comprehension",
    difficulty=DifficultyLevel.MEDIUM,
    num_questions=5,
    question_type=QuestionType.MULTIPLE_CHOICE
)

# POST /api/v1/quiz/generate
response = await client.post("/api/v1/quiz/generate", json=request.model_dump())
quiz = response.json()

# Access response
print(f"Generated {quiz['total_questions']} questions")
print(f"Estimated time: {quiz['estimated_duration']} minutes")
for q in quiz['questions']:
    print(f"- {q['question']}")
```

### Example 2: Submit and Evaluate

```python
from app.schemas import SubmitQuizRequest, QuestionAnswer

# Create answers
answers = [
    QuestionAnswer(question_index=0, selected_answer="A", time_taken=30),
    QuestionAnswer(question_index=1, selected_answer="B", time_taken=45),
    QuestionAnswer(question_index=2, selected_answer="C", time_taken=25),
    QuestionAnswer(question_index=3, selected_answer="D", time_taken=60),
    QuestionAnswer(question_index=4, selected_answer="A", time_taken=40),
]

# Submit quiz
request = SubmitQuizRequest(
    quiz_id="quiz_123",
    user_id=456,
    user_name="John Doe",
    answers=answers,
    total_time=200
)

# POST /api/v1/quiz/submit
response = await client.post("/api/v1/quiz/submit", json=request.model_dump())
result = response.json()

# Access result
print(f"Score: {result['score']}%")
print(f"Correct: {result['correct_count']}/{result['total_count']}")
print(f"Feedback: {result['feedback']}")
```

### Example 3: Adaptive Quiz

```python
from app.schemas import PersonalizedQuizRequest, DifficultyLevel

request = PersonalizedQuizRequest(
    user_id=456,
    topic="Data Structures",
    num_questions=10,
    target_difficulty=DifficultyLevel.MEDIUM,
    prev_performance=75.0
)

# POST /api/v1/quiz/adaptive
response = await client.post("/api/v1/quiz/adaptive", json=request.model_dump())
quiz = response.json()

# Access personalization info
print(f"Strong areas: {quiz['user_profile_summary']['strong_areas']}")
print(f"Recommended: {quiz['recommended_topics']}")
```

## Validation Rules

### GenerateQuizRequest

| Field | Min | Max | Required |
|-------|-----|-----|----------|
| topic | 1 char | 200 chars | ✓ |
| num_questions | 1 | 50 | ✗ (default: 10) |
| difficulty | - | - | ✓ |
| context | - | 1000 chars | ✗ |

### SubmitQuizRequest

| Field | Min | Max | Required |
|-------|-----|-----|----------|
| answers | 1 | unlimited | ✓ |
| total_time | 0 | unlimited | ✓ |
| user_id | 1 | - | ✓ |

## Error Handling

All endpoints may return:

```python
# 400 Bad Request - Invalid input
{
    "detail": "Field validation error..."
}

# 404 Not Found - Quiz not found
{
    "detail": "Quiz not found"
}

# 422 Unprocessable Entity - Schema validation failed
{
    "detail": [
        {
            "loc": ["body", "num_questions"],
            "msg": "ensure this value is less than or equal to 50",
            "type": "value_error.number.not_le"
        }
    ]
}
```

## Best Practices

### 1. Use Enums

```python
# Good
from app.schemas import DifficultyLevel
difficulty=DifficultyLevel.MEDIUM

# Avoid
difficulty="medium"  # String without validation
```

### 2. Validate Input

```python
# Let Pydantic validate
try:
    request = GenerateQuizRequest(**data)
except ValidationError as e:
    print(f"Invalid input: {e}")
```

### 3. Cache Responses

```python
# Quiz generation can be expensive
cache_key = f"quiz:{request.topic}:{request.difficulty}"
if await cache.exists(cache_key):
    return await cache.get(cache_key)
```

### 4. Handle Partial Results

```python
# Some questions may fail to generate
if len(response.questions) < request.num_questions:
    # Log warning
    logger.warning(f"Generated {len(response.questions)}/{request.num_questions}")
```

## Integration with FastAPI

All models automatically integrate with FastAPI:

```python
from fastapi import APIRouter
from app.schemas import GenerateQuizRequest, GenerateQuizResponse

router = APIRouter()

@router.post("/generate", response_model=GenerateQuizResponse)
async def generate_quiz(request: GenerateQuizRequest):
    # Pydantic validates request
    # Return response_model validates response
    pass

# Automatic OpenAPI schema generation
# Available at /docs and /redoc
```

## Related Documentation

- [CACHE_SERVICE.md](CACHE_SERVICE.md) - Cache usage for quiz data
- [DATABASE.md](DATABASE.md) - Database patterns for quiz storage
- [API.md](../docs/API.md) - Complete API reference

---

**Last Updated:** March 2026  
**Status:** Production Ready  
**Maintained By:** EdTech Development Team
