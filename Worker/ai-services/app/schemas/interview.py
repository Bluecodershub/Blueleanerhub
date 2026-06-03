"""
Interview and recruitment schemas for AI services API.
Defines request/response models for resume screening, interview generation,
answer evaluation, and candidate ranking.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum
from datetime import datetime


class QuestionCategory(str, Enum):
    """Interview question categories."""
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    PROBLEM_SOLVING = "problem_solving"
    SITUATIONAL = "situational"
    CULTURAL_FIT = "cultural_fit"


class DifficultyLevel(str, Enum):
    """Question difficulty levels."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class EducationLevel(str, Enum):
    """Candidate education levels."""
    HIGH_SCHOOL = "high_school"
    DIPLOMA = "diploma"
    BACHELOR = "bachelor"
    MASTER = "master"
    PHD = "phd"
    CERTIFICATION = "certification"


# ============================================================================
# Resume Screening
# ============================================================================

class SkillMatch(BaseModel):
    """Skill matching details."""
    skill_name: str = Field(..., description="Skill name")
    required: bool = Field(..., description="Whether skill is required")
    found: bool = Field(..., description="Whether skill found in resume")
    proficiency_level: Optional[str] = Field(
        None,
        description="Proficiency level if found (beginner, intermediate, expert)"
    )
    years_of_experience: Optional[int] = Field(None, ge=0)


class ScreenResumeResponse(BaseModel):
    """Resume screening result."""
    application_id: int = Field(..., description="Application identifier")
    
    # Overall scores
    match_score: float = Field(..., ge=0, le=100, description="Overall match percentage")
    skill_match_percentage: float = Field(..., ge=0, le=100, description="Skill match percentage")
    
    # Extracted information
    extracted_skills: List[str] = Field(..., description="Skills extracted from resume")
    skill_details: List[SkillMatch] = Field(default_factory=list)
    experience_years: Optional[int] = Field(None, ge=0, description="Years of experience")
    education_level: Optional[EducationLevel] = Field(None, description="Education level detected")
    certifications: List[str] = Field(default_factory=list, description="Certifications found")
    
    # Analysis
    strengths: List[str] = Field(default_factory=list, description="Resume strengths")
    gaps: List[str] = Field(default_factory=list, description="Skill gaps")
    red_flags: List[str] = Field(default_factory=list, description="Potential concerns")
    
    # Recommendation
    recommendation: str = Field(..., description="Screening recommendation")
    should_proceed: bool = Field(..., description="Whether to proceed with interview")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    
    detailed_feedback: str = Field(default="", description="Detailed feedback")
    screened_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "application_id": 101,
                "match_score": 85.5,
                "skill_match_percentage": 90.0,
                "extracted_skills": ["Python", "JavaScript", "React", "AWS"],
                "experience_years": 5,
                "education_level": "bachelor",
                "strengths": ["Strong experience with required stack"],
                "gaps": ["Limited cloud architecture experience"],
                "recommendation": "Strong candidate, proceed with technical interview",
                "should_proceed": True,
                "confidence": 0.92
            }
        }
    }


class ScreenResumeRequest(BaseModel):
    """Request to screen resume."""
    application_id: int = Field(..., description="Application identifier")
    resume_url: str = Field(..., description="URL to resume document")
    resume_text: Optional[str] = Field(None, description="Resume text (if already extracted)")
    job_description: str = Field(..., min_length=10, description="Job description")
    required_skills: List[str] = Field(..., min_items=1, description="Required skills to match")
    nice_to_have_skills: Optional[List[str]] = Field(None, description="Optional skills")
    min_experience_years: Optional[int] = Field(0, ge=0, description="Minimum experience required")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "application_id": 101,
                "resume_url": "https://example.com/resume.pdf",
                "job_description": "Senior Python developer...",
                "required_skills": ["Python", "Django", "PostgreSQL"],
                "nice_to_have_skills": ["AWS", "Docker"],
                "min_experience_years": 3
            }
        }
    }


# ============================================================================
# Interview Question Generation
# ============================================================================

class InterviewQuestion(BaseModel):
    """Individual interview question."""
    question_id: int = Field(..., description="Question identifier")
    question: str = Field(..., min_length=10, description="Interview question")
    category: QuestionCategory = Field(..., description="Question category")
    difficulty: DifficultyLevel = Field(..., description="Question difficulty")
    
    # Expected answer guidance
    expected_answer_points: List[str] = Field(
        ...,
        min_items=1,
        description="Key points expected in answer"
    )
    
    evaluation_criteria: List[str] = Field(
        ...,
        min_items=1,
        description="Criteria for evaluating response"
    )
    
    # Metadata
    estimated_time_minutes: int = Field(..., ge=1, le=30)
    follow_up_questions: List[str] = Field(default_factory=list)
    assessment_focus: str = Field(
        ...,
        description="What skill/competency is being assessed"
    )


class GenerateInterviewQuestionsRequest(BaseModel):
    """Request to generate interview questions."""
    candidate_profile: Dict = Field(..., description="Candidate profile data")
    job_role: str = Field(..., min_length=1, description="Job role/title")
    required_skills: List[str] = Field(..., min_items=1, description="Required skills")
    num_questions: int = Field(
        10,
        ge=5,
        le=50,
        description="Number of questions to generate"
    )
    
    # Question configuration
    difficulty_distribution: Optional[Dict[str, int]] = Field(
        None,
        description="Distribution of difficulty levels (optional)"
    )
    include_categories: Optional[List[QuestionCategory]] = Field(
        None,
        description="Specific categories to include"
    )
    experience_level: str = Field(
        "mid",
        pattern="^(junior|mid|senior|lead)$",
        description="Candidate experience level"
    )
    company_culture: Optional[str] = Field(None, description="Company culture/values")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "candidate_profile": {"experience_years": 5, "education": "bachelor"},
                "job_role": "Senior Full-Stack Developer",
                "required_skills": ["Python", "React", "PostgreSQL"],
                "num_questions": 12,
                "experience_level": "senior"
            }
        }
    }


class GenerateInterviewQuestionsResponse(BaseModel):
    """Response with generated interview questions."""
    interview_id: Optional[str] = Field(None, description="Interview session ID")
    questions: List[InterviewQuestion] = Field(..., description="Generated questions")
    total_questions: int = Field(..., ge=0, description="Total questions generated")
    session_duration_minutes: int = Field(..., ge=15, description="Estimated interview duration")
    
    # Question distribution
    category_distribution: Dict[str, int] = Field(
        default_factory=dict,
        description="Questions per category"
    )
    difficulty_distribution: Dict[str, int] = Field(
        default_factory=dict,
        description="Questions per difficulty"
    )
    
    # Interview guidance
    interviewer_notes: str = Field(default="", description="Interviewer guidance")
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Response Evaluation
# ============================================================================

class EvaluationCriteria(BaseModel):
    """Individual evaluation criterion."""
    criterion: str
    score: float = Field(..., ge=0, le=100)
    description: str


class EvaluateResponseResponse(BaseModel):
    """Evaluation of interview response."""
    question_id: int = Field(..., description="Question ID")
    
    # Score breakdown
    relevance_score: float = Field(..., ge=0, le=100, description="Answer relevance")
    completeness_score: float = Field(..., ge=0, le=100, description="Answer completeness")
    technical_accuracy: float = Field(..., ge=0, le=100, description="Technical accuracy")
    communication_quality: float = Field(..., ge=0, le=100, description="Communication clarity")
    confidence_level: float = Field(..., ge=0, le=100, description="Candidate confidence")
    overall_score: float = Field(..., ge=0, le=100, description="Overall score")
    
    # Detailed evaluation
    criteria_results: List[EvaluationCriteria] = Field(
        default_factory=list,
        description="Detailed criteria evaluation"
    )
    
    # Feedback
    feedback: str = Field(..., description="Evaluator feedback")
    improvement_suggestions: List[str] = Field(
        default_factory=list,
        description="Improvement suggestions"
    )
    strengths_identified: List[str] = Field(
        default_factory=list,
        description="Answer strengths"
    )
    
    # Classifications
    answer_quality: str = Field(
        ...,
        pattern="^(poor|below_average|average|good|excellent)$",
        description="Overall answer quality"
    )
    red_flags: List[str] = Field(default_factory=list, description="Potential concerns")
    
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "question_id": 1,
                "relevance_score": 90.0,
                "completeness_score": 85.0,
                "technical_accuracy": 95.0,
                "communication_quality": 88.0,
                "confidence_level": 92.0,
                "overall_score": 90.0,
                "feedback": "Excellent technical understanding with clear explanation",
                "answer_quality": "excellent"
            }
        }
    }


class EvaluateResponseRequest(BaseModel):
    """Request to evaluate interview response."""
    question_id: int = Field(..., description="Question ID")
    question: str = Field(..., description="The asked question")
    candidate_answer: str = Field(..., min_length=1, description="Candidate's answer")
    expected_answer: Optional[str] = Field(None, description="Expected/sample answer")
    
    # Evaluation context
    evaluation_criteria: Optional[List[str]] = Field(None, description="Custom evaluation criteria")
    category: Optional[QuestionCategory] = Field(None, description="Question category")
    difficulty: Optional[DifficultyLevel] = Field(None, description="Question difficulty")
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "question_id": 1,
                "question": "How would you optimize a slow database query?",
                "candidate_answer": "I would analyze the query execution plan...",
                "expected_answer": "Check indexes, use EXPLAIN, optimize joins..."
            }
        }
    }


# ============================================================================
# Candidate Ranking
# ============================================================================

class CandidateScreeningResult(BaseModel):
    """Resume screening result for ranking."""
    resume_score: float
    skill_match: float
    experience_match: float
    education_match: float


class CandidateInterviewResult(BaseModel):
    """Interview result for ranking."""
    interview_score: float
    question_scores: List[float]
    category_scores: Dict[str, float]
    average_difficulty_handled: str


class RankedCandidate(BaseModel):
    """Ranked candidate with comprehensive scoring."""
    candidate_id: int = Field(..., description="Candidate identifier")
    user_id: Optional[int] = Field(None, description="User identifier")
    name: Optional[str] = Field(None, description="Candidate name")
    
    # Ranking
    rank: int = Field(..., ge=1, description="Ranking position")
    hire_probability: float = Field(..., ge=0, le=1, description="Probability of success")
    comprehensive_score: float = Field(..., ge=0, le=100, description="Final score (0-100)")
    
    # Score breakdown
    resume_score: Optional[float] = Field(None)
    interview_score: Optional[float] = Field(None)
    technical_score: Optional[float] = Field(None)
    soft_skills_score: Optional[float] = Field(None)
    cultural_fit_score: Optional[float] = Field(None)
    
    # Details
    recommendation: str = Field(..., description="Hiring recommendation")
    strengths: List[str] = Field(..., description="Key strengths")
    weaknesses: List[str] = Field(..., description="Key weaknesses")
    considerations: List[str] = Field(
        default_factory=list,
        description="Special considerations"
    )
    
    # Hiring decision
    should_hire: bool = Field(..., description="Hire recommendation")
    confidence: float = Field(..., ge=0, le=1, description="Decision confidence")


class RankCandidatesRequest(BaseModel):
    """Request to rank candidates."""
    job_id: int = Field(..., description="Job posting identifier")
    candidates: List[Dict] = Field(..., min_items=1, description="Candidate data to rank")
    
    # Ranking configuration
    assessment_results: Optional[List[Dict]] = Field(
        None,
        description="Assessment results for candidates"
    )
    weights: Optional[Dict[str, float]] = Field(
        None,
        description="Custom scoring weights"
    )
    min_hire_score: Optional[float] = Field(
        70.0,
        ge=0,
        le=100,
        description="Minimum score for hire recommendation"
    )
    
    model_config = {
        "json_schema_extra": {
            "example": {
                "job_id": 42,
                "candidates": [
                    {"candidate_id": 1, "name": "John Doe"},
                    {"candidate_id": 2, "name": "Jane Smith"}
                ],
                "weights": {"resume": 0.3, "interview": 0.5, "fit": 0.2}
            }
        }
    }


class RankCandidatesResponse(BaseModel):
    """Ranked candidates response."""
    job_id: int = Field(..., description="Job identifier")
    total_candidates: int = Field(..., ge=0, description="Total candidates ranked")
    
    rankings: List[RankedCandidate] = Field(..., description="Ranked candidates")
    
    # Summary statistics
    avg_score: Optional[float] = Field(None, description="Average candidate score")
    top_score: Optional[float] = Field(None, description="Highest score")
    recommended_count: int = Field(
        ...,
        ge=0,
        description="Number recommended for hire"
    )
    
    # Summary
    ranking_summary: str = Field(default="", description="Summary of findings")
    ranked_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# Candidate Profile
# ============================================================================

class CandidateProfile(BaseModel):
    """Complete candidate profile."""
    candidate_id: int
    name: str
    email: str
    phone: Optional[str] = None
    
    # Experience
    current_role: str
    years_of_experience: int
    previous_roles: List[str] = Field(default_factory=list)
    
    # Skills
    technical_skills: List[str]
    soft_skills: List[str] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    
    # Education
    education_level: EducationLevel
    degree_field: Optional[str] = None
    university: Optional[str] = None
    
    # Assessment results
    resume_score: Optional[float] = None
    interview_scores: Optional[List[float]] = None
    overall_assessment: Optional[float] = None


class InterviewSession(BaseModel):
    """Interview session record."""
    session_id: str
    candidate_id: int
    job_id: int
    interview_type: str = Field(..., pattern="^(phone|technical|behavioral|final)$")
    
    # Session details
    started_at: datetime
    ended_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    
    # Results
    questions: List[InterviewQuestion] = Field(default_factory=list)
    responses: List[Dict] = Field(default_factory=list)
    evaluations: List[Dict] = Field(default_factory=list)
    
    # Overall assessment
    overall_score: Optional[float] = None
    interviewer_notes: str = Field(default="")
    recommendation: Optional[str] = None


class HiringDecision(BaseModel):
    """Final hiring decision."""
    candidate_id: int
    job_id: int
    decided_at: datetime
    decision: str = Field(..., pattern="^(hire|reject|hold|alternative)$")
    
    # Supporting information
    score_considerations: Dict[str, float] = Field(default_factory=dict)
    interview_feedback: str = Field(default="")
    decision_maker: Optional[str] = None
    notes: str = Field(default="")


# ============================================================================
# Export all schemas
# ============================================================================

__all__ = [
    # Enums
    "QuestionCategory",
    "DifficultyLevel",
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
