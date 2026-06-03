"""
Pydantic schemas for EdTech AI Services API.
Contains all request/response models for API endpoints.
"""

from app.schemas.quiz import (
    # Enums
    DifficultyLevel,
    QuestionType,
    # Question models
    QuestionOption,
    GeneratedQuestion,
    TrueFalseQuestion,
    CodeQuestion,
    # Quiz generation
    GenerateQuizRequest,
    GenerateQuizResponse,
    # Quiz submission
    QuestionAnswer,
    SubmitQuizRequest,
    QuestionEvaluation,
    SubmitQuizResponse,
    # Difficulty prediction
    PredictDifficultyRequest,
    PredictDifficultyResponse,
    # Personalized quizzes
    PersonalizedQuizRequest,
    UserProfile as QuizUserProfile,
    AdaptiveQuizResponse,
    # Analytics
    QuizAttempt,
    UserProgress,
    TopicMastery,
    # Batch operations
    BatchGenerateQuizRequest,
    BatchGenerateQuizResponse,
)

from app.schemas.hackathon import (
    # Enums
    ProgrammingLanguage,
    CodeMetricType,
    # Code evaluation
    TestResult,
    CodeMetric,
    EvaluateCodeRequest,
    CodeEvaluationResponse,
    # Plagiarism detection
    SimilarSubmission,
    CheckPlagiarismRequest,
    PlagiarismCheckResponse,
    # Ranking
    SubmissionScore,
    RankSubmissionsRequest,
    RankSubmissionsResponse,
    # Hackathon models
    HackathonChallenge,
    HackathonSubmission,
    HackathonLeaderboard,
    HackathonStats,
    # Code review
    CodeReviewComment,
    CodeReview,
)

from app.schemas.interview import (
    # Enums
    QuestionCategory,
    EducationLevel,
    # Resume screening
    SkillMatch,
    ScreenResumeRequest,
    ScreenResumeResponse,
    # Interview question generation
    InterviewQuestion,
    GenerateInterviewQuestionsRequest,
    GenerateInterviewQuestionsResponse,
    # Response evaluation
    EvaluationCriteria,
    EvaluateResponseRequest,
    EvaluateResponseResponse,
    # Candidate ranking
    CandidateScreeningResult,
    CandidateInterviewResult,
    RankCandidatesRequest,
    RankedCandidate,
    RankCandidatesResponse,
    # Additional models
    CandidateProfile,
    InterviewSession,
    HiringDecision,
)

__all__ = [
    # ========== QUIZ SCHEMAS ==========
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
    "QuizUserProfile",
    "AdaptiveQuizResponse",
    # Analytics
    "QuizAttempt",
    "UserProgress",
    "TopicMastery",
    # Batch operations
    "BatchGenerateQuizRequest",
    "BatchGenerateQuizResponse",
    
    # ========== HACKATHON SCHEMAS ==========
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
    
    # ========== INTERVIEW SCHEMAS ==========
    # Enums
    "QuestionCategory",
    "EducationLevel",
    # Resume screening
    "SkillMatch",
    "ScreenResumeRequest",
    "ScreenResumeResponse",
    # Interview question generation
    "InterviewQuestion",
    "GenerateInterviewQuestionsRequest",
    "GenerateInterviewQuestionsResponse",
    # Response evaluation
    "EvaluationCriteria",
    "EvaluateResponseRequest",
    "EvaluateResponseResponse",
    # Candidate ranking
    "CandidateScreeningResult",
    "CandidateInterviewResult",
    "RankCandidatesRequest",
    "RankedCandidate",
    "RankCandidatesResponse",
    # Additional models
    "CandidateProfile",
    "InterviewSession",
    "HiringDecision",
]
