"""
Hackathon and code evaluation schemas for AI services API.
Defines request/response models for code submission, evaluation, and ranking.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime


class ProgrammingLanguage(str, Enum):
    """Supported programming languages."""
    PYTHON = "python"
    JAVA = "java"
    CPP = "cpp"
    JAVASCRIPT = "javascript"
    C = "c"
    GO = "go"
    RUST = "rust"


class CodeMetricType(str, Enum):
    """Types of code metrics."""
    LINES_OF_CODE = "lines_of_code"
    CYCLOMATIC_COMPLEXITY = "cyclomatic_complexity"
    MAINTAINABILITY_INDEX = "maintainability_index"
    TECHNICAL_DEBT = "technical_debt"


class TestResult(BaseModel):
    """Individual test case result."""
    test_case_id: int = Field(..., description="Test case identifier")
    test_name: str = Field(..., description="Name of test")
    input_data: str = Field(..., description="Input provided to code")
    expected_output: str = Field(..., description="Expected output")
    actual_output: str = Field(..., description="Actual output from code")
    passed: bool = Field(..., description="Whether test passed")
    execution_time: float = Field(..., ge=0, description="Execution time in milliseconds")
    error_message: Optional[str] = Field(None, description="Error if test failed")


class CodeMetric(BaseModel):
    """Code quality metric."""
    metric_type: CodeMetricType
    value: float = Field(..., ge=0, description="Metric value")
    threshold: Optional[float] = Field(None, description="Acceptable threshold")
    passed: bool = Field(..., description="Whether metric meets threshold")
    recommendation: Optional[str] = Field(None, description="Improvement suggestion")


class CodeEvaluationResponse(BaseModel):
    """Comprehensive code evaluation result."""
    submission_id: int = Field(..., description="Submission identifier")
    language: ProgrammingLanguage = Field(..., description="Programming language")
    
    # Score breakdown
    correctness_score: float = Field(..., ge=0, le=100, description="Correctness percentage")
    efficiency_score: float = Field(..., ge=0, le=100, description="Efficiency percentage")
    code_quality_score: float = Field(..., ge=0, le=100, description="Code quality percentage")
    best_practices_score: float = Field(..., ge=0, le=100, description="Best practices percentage")
    innovation_score: float = Field(..., ge=0, le=100, description="Innovation/creativity percentage")
    final_score: float = Field(..., ge=0, le=100, description="Final weighted score")
    
    # Test results
    test_results: List[TestResult] = Field(..., description="Individual test results")
    passed_tests: int = Field(..., ge=0, description="Number of passed tests")
    total_tests: int = Field(..., ge=0, description="Total number of tests")
    
    # Performance metrics
    execution_time: Optional[float] = Field(None, ge=0, description="Total execution time (ms)")
    memory_used: Optional[float] = Field(None, ge=0, description="Memory used (MB)")
    
    # Code metrics
    metrics: List[CodeMetric] = Field(default_factory=list, description="Code quality metrics")
    
    # Feedback and details
    feedback: List[str] = Field(default_factory=list, description="Feedback items")
    strengths: List[str] = Field(default_factory=list, description="Code strengths")
    improvements: List[str] = Field(default_factory=list, description="Improvement areas")
    
    details: Dict = Field(default_factory=dict, description="Additional evaluation details")
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "submission_id": 123,
                "language": "python",
                "correctness_score": 95.0,
                "efficiency_score": 85.0,
                "code_quality_score": 90.0,
                "best_practices_score": 88.0,
                "innovation_score": 92.0,
                "final_score": 90.0,
                "passed_tests": 9,
                "total_tests": 10,
                "execution_time": 125.5,
                "memory_used": 45.2,
                "feedback": ["Good use of list comprehension", "Consider error handling"]
            }
        }
    }


class EvaluateCodeRequest(BaseModel):
    """Request to evaluate code submission."""
    submission_id: int = Field(..., description="Submission identifier")
    code: str = Field(..., min_length=1, description="Source code to evaluate")
    language: ProgrammingLanguage = Field(..., description="Programming language")
    test_cases: Optional[List[Dict]] = Field(
        None,
        description="Custom test cases (input/expected_output pairs)"
    )
    timeout: Optional[int] = Field(
        5000,
        ge=100,
        le=30000,
        description="Execution timeout in milliseconds"
    )
    requirements: Optional[Dict] = Field(
        None,
        description="Additional requirements (memory limit, etc)"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "submission_id": 123,
                "code": "def hello():\n    return 'Hello, World!'",
                "language": "python",
                "test_cases": [
                    {"input": "", "expected_output": "Hello, World!"}
                ]
            }
        }
    }


# ============================================================================
# Plagiarism Detection
# ============================================================================

class SimilarSubmission(BaseModel):
    """Submission similar to checked submission."""
    submission_id: int
    user_id: int
    similarity_percentage: float = Field(..., ge=0, le=100)
    matching_lines: int = Field(..., ge=0, description="Number of matching lines")


class PlagiarismCheckResponse(BaseModel):
    """Result of plagiarism check."""
    submission_id: int = Field(..., description="Submission being checked")
    is_plagiarized: bool = Field(..., description="Whether plagiarism detected")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    plagiarism_percentage: float = Field(..., ge=0, le=100, description="Percentage of plagiarism")
    
    similar_submissions: List[SimilarSubmission] = Field(
        default_factory=list,
        description="Similar submissions found"
    )
    similarity_scores: Dict[int, float] = Field(
        default_factory=dict,
        description="Submission ID to similarity score mapping"
    )
    
    # Analysis details
    report: str = Field(..., description="Detailed plagiarism report")
    flagged_sections: List[Dict] = Field(
        default_factory=list,
        description="Code sections flagged as similar"
    )
    recommendations: List[str] = Field(
        default_factory=list,
        description="Recommendations for instructors"
    )
    
    checked_at: datetime = Field(default_factory=datetime.utcnow)


class CheckPlagiarismRequest(BaseModel):
    """Request to check submission for plagiarism."""
    submission_id: int = Field(..., description="Submission to check")
    code: str = Field(..., min_length=1, description="Source code")
    language: ProgrammingLanguage = Field(..., description="Programming language")
    all_submissions: Optional[List[Dict]] = Field(
        None,
        description="Reference submissions to compare against"
    )
    threshold: Optional[float] = Field(
        0.7,
        ge=0,
        le=1,
        description="Similarity threshold (0-1)"
    )


# ============================================================================
# Submission Ranking
# ============================================================================

class SubmissionScore(BaseModel):
    """Individual submission score and ranking."""
    submission_id: int = Field(..., description="Submission identifier")
    user_id: int = Field(..., description="User identifier")
    username: Optional[str] = Field(None, description="Username")
    final_score: float = Field(..., ge=0, le=100, description="Final score (0-100)")
    rank: int = Field(..., ge=1, description="Ranking position")
    
    # Score breakdown
    breakdown: Dict[str, float] = Field(
        ...,
        description="Score breakdown by category"
    )
    
    # Metadata
    submitted_at: datetime = Field(..., description="Submission timestamp")
    evaluation_status: str = Field(..., description="Status (pending, evaluated, error)")


class RankSubmissionsRequest(BaseModel):
    """Request to rank hackathon submissions."""
    hackathon_id: int = Field(..., description="Hackathon identifier")
    submissions: List[Dict] = Field(..., min_items=1, description="Submissions to rank")
    weights: Optional[Dict[str, float]] = Field(
        None,
        description="Custom scoring weights"
    )


class RankSubmissionsResponse(BaseModel):
    """Ranked submissions response."""
    hackathon_id: int = Field(..., description="Hackathon identifier")
    total_submissions: int = Field(..., ge=0, description="Total submissions")
    
    ranked_submissions: List[SubmissionScore] = Field(
        ...,
        description="Ranked submissions"
    )
    
    # Statistics
    statistics: Dict = Field(
        default_factory=dict,
        description="Ranking statistics"
    )
    
    ranked_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Hackathon Models
# ============================================================================

class HackathonChallenge(BaseModel):
    """Individual hackathon challenge."""
    challenge_id: int
    title: str = Field(..., min_length=1, max_length=200)
    description: str
    difficulty: str = Field(..., pattern="^(easy|medium|hard|expert)$")
    languages: List[ProgrammingLanguage]
    test_cases: List[Dict] = Field(..., min_items=1)
    time_limit: int = Field(..., ge=100, description="Time limit in seconds")
    memory_limit: int = Field(..., ge=64, description="Memory limit in MB")


class HackathonSubmission(BaseModel):
    """Code submission to hackathon."""
    submission_id: int
    hackathon_id: int
    challenge_id: int
    user_id: int
    code: str
    language: ProgrammingLanguage
    evaluation_score: Optional[float] = None
    plagiarism_score: Optional[float] = None
    submitted_at: datetime
    evaluated_at: Optional[datetime] = None


class HackathonLeaderboard(BaseModel):
    """Hackathon leaderboard entry."""
    rank: int
    user_id: int
    username: str
    total_score: float = Field(..., ge=0, le=100)
    challenges_solved: int
    submission_count: int
    best_time: Optional[float]


class HackathonStats(BaseModel):
    """Statistics for hackathon."""
    hackathon_id: int
    total_participants: int
    total_submissions: int
    challenges_count: int
    average_score: float
    highest_score: float
    completed_challenges: int


# ============================================================================
# Code Review & Feedback
# ============================================================================

class CodeReviewComment(BaseModel):
    """Comment on code review."""
    line_number: int
    severity: str = Field(..., pattern="^(info|warning|error)$")
    message: str
    suggestion: Optional[str] = None
    category: str  # style, performance, security, etc


class CodeReview(BaseModel):
    """Code review with comments and suggestions."""
    submission_id: int
    reviewer: str = Field(default="AI")
    comments: List[CodeReviewComment] = Field(default_factory=list)
    summary: str
    overall_quality: str = Field(..., pattern="^(poor|fair|good|excellent)$")


# ============================================================================
# Export all schemas
# ============================================================================

__all__ = [
    # Enums
    "ProgrammingLanguage",
    "CodeMetricType",
    # Code evaluation
    "TestResult",
    "CodeMetric",
    "EvaluateCodeRequest",
    "CodeEvaluationResponse",
    # Plagiarism detection
    "SimilarSubmission",
    "CheckPlagiarismRequest",
    "PlagiarismCheckResponse",
    # Ranking
    "SubmissionScore",
    "RankSubmissionsRequest",
    "RankSubmissionsResponse",
    # Hackathon models
    "HackathonChallenge",
    "HackathonSubmission",
    "HackathonLeaderboard",
    "HackathonStats",
    # Code review
    "CodeReviewComment",
    "CodeReview",
]
