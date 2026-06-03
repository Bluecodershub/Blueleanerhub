"""
Interview and recruitment API endpoints.
Provides resume screening, interview question generation, response evaluation, and candidate ranking.
"""

import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.schemas import (
    ScreenResumeRequest,
    ScreenResumeResponse,
    GenerateInterviewQuestionsRequest,
    GenerateInterviewQuestionsResponse,
    InterviewQuestion,
    EvaluateResponseRequest,
    EvaluateResponseResponse,
    RankCandidatesRequest,
    RankCandidatesResponse,
    RankedCandidate,
    CandidateProfile,
)
from app.core import CacheService, get_redis
from app.services import InterviewResponseEvaluator

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/interview", tags=["interview"])

# Dependency functions
def get_cache_service() -> CacheService:
    """Dependency for cache service."""
    redis_client = get_redis()
    return CacheService(redis_client)

# Initialize response evaluator
response_evaluator = InterviewResponseEvaluator()


# ============================================================================
# Dependencies
# ============================================================================

async def get_response_evaluator() -> InterviewResponseEvaluator:
    """Dependency for interview response evaluator."""
    return response_evaluator

# ============================================================================
# Resume Screening Endpoints
# ============================================================================

@router.post(
    "/screen-resume",
    response_model=ScreenResumeResponse,
    summary="Screen resume for job match",
    description="Evaluate resume against job requirements and skills"
)
async def screen_resume(
    request: ScreenResumeRequest,
    cache: CacheService = Depends(get_cache_service)
) -> ScreenResumeResponse:
    """
    Screen resume against job requirements.
    
    Analyzes resume for:
    - Required vs. nice-to-have skills match
    - Experience level assessment
    - Education level detection
    - Skill gap analysis
    - Strengths and weaknesses
    
    Args:
        request: Resume screening request
        cache: Cache service
    
    Returns:
        ScreenResumeResponse with match scores and analysis
    
    Raises:
        HTTPException: If screening fails
    """
    try:
        logger.info(f"Screening resume for application {request.application_id}")
        
        cache_key = f"resume_screen:{request.application_id}"
        cached = await cache.get(cache_key)
        if cached:
            logger.info(f"Using cached screening for application {request.application_id}")
            return cached
        
        # Extract text if url provided
        resume_text = request.resume_text or "Resume text not provided"
        
        # Mock skill extraction and matching
        extracted_skills = []
        skill_match_percentage = 0.0
        matched_required = 0
        
        # Simple keyword matching for demo
        if resume_text:
            resume_lower = resume_text.lower()
            
            # Extract skills
            for skill in request.required_skills:
                if skill.lower() in resume_lower:
                    extracted_skills.append(skill)
                    matched_required += 1
            
            # Check nice-to-have skills
            if request.nice_to_have_skills:
                for skill in request.nice_to_have_skills:
                    if skill.lower() in resume_lower and skill not in extracted_skills:
                        extracted_skills.append(skill)
            
            skill_match_percentage = (
                (matched_required / len(request.required_skills) * 100)
                if request.required_skills else 0.0
            )
        
        # Mock experience detection
        experience_years = request.min_experience_years or 0
        for year_range in ["10+", "5-10", "3-5", "1-3", "0-1"]:
            if year_range in resume_text:
                try:
                    years = int(year_range.split("-")[0])
                    experience_years = max(experience_years, years)
                except:
                    pass
        
        # Mock education detection
        education_level = None
        for edu in ["phd", "master", "bachelor", "diploma", "certification", "high_school"]:
            if edu in resume_text.lower():
                education_level = edu.upper()
                break
        
        # Generate recommendation
        strengths = []
        gaps = []
        red_flags = []
        
        if matched_required >= len(request.required_skills) * 0.8:
            strengths.append("Strong skill match with job requirements")
        else:
            gaps.append(f"Missing {len(request.required_skills) - matched_required} required skills")
        
        if experience_years >= (request.min_experience_years or 0):
            strengths.append(f"Meets experience requirement ({experience_years}+ years)")
        else:
            gaps.append(f"Below experience requirement ({experience_years} vs {request.min_experience_years} required)")
        
        # Determine recommendation
        should_proceed = skill_match_percentage >= 70 and experience_years >= (request.min_experience_years or 0)
        
        recommendation = (
            "Strong candidate - recommend for technical interview"
            if should_proceed
            else "Review gaps before proceeding to next stage"
        )
        
        response = ScreenResumeResponse(
            application_id=request.application_id,
            match_score=skill_match_percentage,
            skill_match_percentage=skill_match_percentage,
            extracted_skills=extracted_skills,
            experience_years=experience_years,
            education_level=education_level,
            certifications=["Certification example"] if "certified" in resume_text.lower() else [],
            strengths=strengths,
            gaps=gaps,
            red_flags=red_flags,
            recommendation=recommendation,
            should_proceed=should_proceed,
            confidence=max(0.5, skill_match_percentage / 100.0),
            detailed_feedback=f"Matched {matched_required}/{len(request.required_skills)} required skills"
        )
        
        # Cache (24 hours)
        await cache.set(cache_key, response.model_dump(), ttl=86400)
        
        logger.info(f"Resume screening complete for application {request.application_id}: {response.match_score:.1f}%")
        
        return response
    
    except Exception as e:
        logger.error(f"Resume screening error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Interview Question Generation
# ============================================================================

@router.post(
    "/generate-questions",
    response_model=GenerateInterviewQuestionsResponse,
    summary="Generate interview questions",
    description="Generate customized interview questions for candidate"
)
async def generate_interview_questions(
    request: GenerateInterviewQuestionsRequest,
    cache: CacheService = Depends(get_cache_service)
) -> GenerateInterviewQuestionsResponse:
    """
    Generate interview questions for a candidate.
    
    Generates questions based on:
    - Job role and required skills
    - Candidate profile and experience level
    - Mix of technical, behavioral, and situational questions
    - Company culture alignment
    
    Args:
        request: Question generation request
        cache: Cache service
    
    Returns:
        GenerateInterviewQuestionsResponse with interview questions
    """
    try:
        logger.info(f"Generating {request.num_questions} interview questions for {request.job_role}")
        
        cache_key = f"interview_questions:{request.job_role}:{request.experience_level}"
        cached = await cache.get(cache_key)
        if cached:
            logger.info(f"Using cached questions for {request.job_role}")
            return cached
        
        questions = []
        
        # Mock question generation
        question_templates = [
            {
                "question": f"What is your experience with {request.required_skills[0] if request.required_skills else 'software development'}?",
                "category": "technical",
                "difficulty": "easy"
            },
            {
                "question": f"Describe your most challenging project involving {request.required_skills[0] if request.required_skills else 'programming'}.",
                "category": "behavioral",
                "difficulty": "medium"
            },
            {
                "question": f"How would you design a system to handle {request.required_skills[0] if request.required_skills else 'large-scale data'} efficiently?",
                "category": "problem_solving",
                "difficulty": "hard"
            },
            {
                "question": "Tell us about a time you had to work with a difficult team member. How did you handle it?",
                "category": "behavioral",
                "difficulty": "medium"
            },
            {
                "question": f"What are your future goals regarding {request.job_role}?",
                "category": "situational",
                "difficulty": "easy"
            },
        ]
        
        # Select questions
        for idx, template in enumerate(question_templates[:request.num_questions]):
            question = InterviewQuestion(
                question_id=idx + 1,
                question=template["question"],
                category=template["category"],
                difficulty=template["difficulty"],
                expected_answer_points=[
                    "Specific experience and achievements",
                    "Demonstrated problem-solving ability",
                    "Communication clarity"
                ],
                evaluation_criteria=[
                    "Relevance to job role",
                    "Technical accuracy",
                    "Communication quality",
                    "Confidence level"
                ],
                estimated_time_minutes=5,
                assessment_focus=f"Assessing {template['category']} skills"
            )
            questions.append(question)
        
        # Calculate session duration
        session_duration = sum(q.estimated_time_minutes for q in questions) + 10  # +10 for intro/outro
        
        # Category distribution
        from collections import Counter
        categories = Counter(q.category for q in questions)
        
        response = GenerateInterviewQuestionsResponse(
            interview_id=f"interview_{request.job_role}_{datetime.utcnow().timestamp()}",
            questions=questions,
            total_questions=len(questions),
            session_duration_minutes=session_duration,
            category_distribution=dict(categories),
            difficulty_distribution={
                "easy": sum(1 for q in questions if q.difficulty == "easy"),
                "medium": sum(1 for q in questions if q.difficulty == "medium"),
                "hard": sum(1 for q in questions if q.difficulty == "hard"),
                "expert": sum(1 for q in questions if q.difficulty == "expert"),
            },
            interviewer_notes=f"Interview for {request.job_role} position. Focus on {', '.join(request.required_skills[:2] if request.required_skills else ['technical skills'])}."
        )
        
        # Cache (24 hours)
        await cache.set(cache_key, response.model_dump(), ttl=86400)
        
        logger.info(f"Generated {len(questions)} interview questions")
        
        return response
    
    except Exception as e:
        logger.error(f"Question generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Response Evaluation
# ============================================================================

@router.post(
    "/evaluate-response",
    response_model=EvaluateResponseResponse,
    summary="Evaluate interview response",
    description="Evaluate candidate's response to interview question"
)
async def evaluate_response(
    request: EvaluateResponseRequest,
    evaluator: InterviewResponseEvaluator = Depends(get_response_evaluator),
    cache: CacheService = Depends(get_cache_service)
) -> EvaluateResponseResponse:
    """
    Evaluate a candidate's interview response using AI analysis.
    
    Evaluates based on:
    - Relevance to the question
    - Completeness of answer
    - Technical accuracy
    - Communication quality
    - Confidence level
    
    Args:
        request: Response evaluation request
        evaluator: Interview response evaluator dependency
        cache: Cache service
    
    Returns:
        EvaluateResponseResponse with detailed scoring and feedback
    """
    try:
        logger.info(f"Evaluating response to question {request.question_id}")
        
        cache_key = f"response_eval:{request.question_id}:{hash(request.candidate_answer)}"
        cached = await cache.get(cache_key)
        if cached:
            logger.info(f"Using cached evaluation for question {request.question_id}")
            return EvaluateResponseResponse(**cached)
        
        # Perform real response evaluation
        evaluation_result = evaluator.evaluate_response(
            question=request.question,
            candidate_answer=request.candidate_answer,
            expected_answer=request.expected_answer,
            difficulty_level=request.difficulty_level or "medium"
        )
        
        # Determine answer quality based on overall score
        overall_score = evaluation_result['overall_score']
        if overall_score >= 85:
            answer_quality = "excellent"
        elif overall_score >= 70:
            answer_quality = "good"
        elif overall_score >= 55:
            answer_quality = "average"
        elif overall_score >= 40:
            answer_quality = "below_average"
        else:
            answer_quality = "poor"
        
        # Identify strengths
        strengths = []
        if evaluation_result['relevance_score'] >= 75:
            strengths.append("Directly addresses the question")
        if evaluation_result['technical_accuracy'] >= 75:
            strengths.append("Strong technical understanding")
        if evaluation_result['communication_quality'] >= 75:
            strengths.append("Clear and well-structured")
        if evaluation_result['confidence_level'] >= 75:
            strengths.append("Confident delivery")
        
        response = EvaluateResponseResponse(
            question_id=request.question_id,
            relevance_score=evaluation_result['relevance_score'],
            completeness_score=evaluation_result['completeness_score'],
            technical_accuracy=evaluation_result['technical_accuracy'],
            communication_quality=evaluation_result['communication_quality'],
            confidence_level=evaluation_result['confidence_level'],
            overall_score=round(overall_score, 1),
            feedback=evaluation_result['feedback'],
            improvement_suggestions=evaluation_result['improvement_suggestions'],
            strengths_identified=strengths if strengths else ["Solid response"],
            answer_quality=answer_quality,
            red_flags=evaluation_result.get('assessment_details', {}).get('confidence', {}).get('hedge_examples', [])
        )
        
        # Cache result for 24 hours
        await cache.set(cache_key, response.model_dump(mode='json'), ttl=86400)
        
        logger.info(
            f"Response evaluation complete: {response.overall_score:.1f}/100 "
            f"(relevance: {response.relevance_score:.1f}, "
            f"technical: {response.technical_accuracy:.1f}, "
            f"communication: {response.communication_quality:.1f})"
        )
        
        return response
    
    except ValueError as e:
        logger.error(f"Response evaluation validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid response: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Response evaluation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Candidate Ranking
# ============================================================================

@router.post(
    "/rank-candidates",
    response_model=RankCandidatesResponse,
    summary="Rank job candidates",
    description="Rank candidates by comprehensive assessment scores"
)
async def rank_candidates(
    request: RankCandidatesRequest,
    cache: CacheService = Depends(get_cache_service)
) -> RankCandidatesResponse:
    """
    Rank job candidates.
    
    Ranks candidates based on:
    - Resume screening score
    - Interview performance
    - Technical skills assessment
    - Soft skills evaluation
    - Cultural fit
    
    Args:
        request: Ranking request with candidates
        cache: Cache service
    
    Returns:
        RankCandidatesResponse with ranked candidates
    """
    try:
        logger.info(f"Ranking {len(request.candidates)} candidates for job {request.job_id}")
        
        cache_key = f"candidate_ranking:job:{request.job_id}"
        cached = await cache.get(cache_key)
        if cached:
            logger.info(f"Using cached ranking for job {request.job_id}")
            return cached
        
        ranked_candidates = []
        
        # Default weights
        default_weights = {
            "resume": 0.30,
            "interview": 0.50,
            "fit": 0.20
        }
        
        weights = request.weights or default_weights
        
        # Score candidates
        for idx, candidate in enumerate(request.candidates):
            candidate_id = candidate.get("candidate_id", idx)
            user_id = candidate.get("user_id", idx)
            name = candidate.get("name", f"Candidate {idx + 1}")
            
            # Get scores (mock or from assessment_results)
            resume_score = candidate.get("resume_score", 75.0)
            interview_score = candidate.get("interview_score", 80.0)
            technical_score = candidate.get("technical_score", 85.0)
            soft_skills_score = candidate.get("soft_skills_score", 80.0)
            cultural_fit_score = candidate.get("cultural_fit_score", 75.0)
            
            # Weighted final score
            final_score = (
                resume_score * weights.get("resume", 0.3) +
                interview_score * weights.get("interview", 0.5) +
                cultural_fit_score * weights.get("fit", 0.2)
            )
            
            # Hire probability based on min_hire_score
            min_hire = request.min_hire_score or 70.0
            hire_probability = min(1.0, (final_score - 50) / (min_hire - 50)) if final_score >= 50 else 0.0
            should_hire = final_score >= min_hire
            
            ranked_candidates.append({
                "candidate_id": candidate_id,
                "user_id": user_id,
                "name": name,
                "final_score": final_score,
                "hire_probability": hire_probability,
                "resume_score": resume_score,
                "interview_score": interview_score,
                "technical_score": technical_score,
                "soft_skills_score": soft_skills_score,
                "cultural_fit_score": cultural_fit_score,
                "should_hire": should_hire,
                "feedback": candidate.get("feedback", [])
            })
        
        # Sort by score
        ranked_candidates.sort(key=lambda x: x["final_score"], reverse=True)
        
        # Build response
        ranked = []
        for rank, candidate in enumerate(ranked_candidates):
            ranked_candidate = RankedCandidate(
                candidate_id=candidate["candidate_id"],
                user_id=candidate.get("user_id"),
                name=candidate.get("name"),
                rank=rank + 1,
                hire_probability=candidate["hire_probability"],
                comprehensive_score=candidate["final_score"],
                resume_score=candidate.get("resume_score"),
                interview_score=candidate.get("interview_score"),
                technical_score=candidate.get("technical_score"),
                soft_skills_score=candidate.get("soft_skills_score"),
                cultural_fit_score=candidate.get("cultural_fit_score"),
                recommendation="Strong hire" if candidate["should_hire"] else "Consider carefully",
                strengths=[
                    "Technical expertise",
                    "Communication skills"
                ],
                weaknesses=[] if candidate["should_hire"] else ["Gap in required skills"],
                should_hire=candidate["should_hire"],
                confidence=candidate["hire_probability"]
            )
            ranked.append(ranked_candidate)
        
        recommended_count = sum(1 for c in ranked if c.should_hire)
        
        response = RankCandidatesResponse(
            job_id=request.job_id,
            total_candidates=len(request.candidates),
            rankings=ranked,
            recommended_count=recommended_count,
            ranking_summary=f"{recommended_count}/{len(request.candidates)} candidates recommended for hire"
        )
        
        # Cache (6 hours)
        await cache.set(cache_key, response.model_dump(), ttl=21600)
        
        logger.info(f"Ranking complete: {len(ranked)} candidates ranked, {recommended_count} recommended")
        
        return response
    
    except Exception as e:
        logger.error(f"Candidate ranking error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Candidate Profile Endpoints
# ============================================================================

@router.get(
    "/candidate/{candidate_id}/profile",
    response_model=CandidateProfile,
    summary="Get candidate profile",
    description="Retrieve complete candidate profile and assessment history"
)
async def get_candidate_profile(
    candidate_id: int,
    cache: CacheService = Depends(get_cache_service)
) -> CandidateProfile:
    """
    Get candidate profile.
    
    Args:
        candidate_id: Candidate identifier
        cache: Cache service
    
    Returns:
        Complete candidate profile
    """
    try:
        logger.info(f"Retrieving profile for candidate {candidate_id}")
        
        cache_key = f"candidate_profile:{candidate_id}"
        cached = await cache.get(cache_key)
        if cached:
            return cached
        
        # Mock profile (TODO: fetch from database)
        profile = CandidateProfile(
            candidate_id=candidate_id,
            name="John Doe",
            email="john@example.com",
            phone="+1-555-0100",
            current_role="Senior Software Engineer",
            years_of_experience=7,
            previous_roles=["Software Engineer", "Junior Developer"],
            technical_skills=["Python", "JavaScript", "AWS", "Docker"],
            soft_skills=["Communication", "Leadership", "Problem Solving"],
            certifications=["AWS Solutions Architect"],
            education_level="BACHELOR",
            degree_field="Computer Science",
            university="MIT",
            resume_score=85.0,
            interview_scores=[88.0, 92.0, 85.0],
            overall_assessment=88.0
        )
        
        # Cache (24 hours)
        await cache.set(cache_key, profile.model_dump(), ttl=86400)
        
        return profile
    
    except Exception as e:
        logger.error(f"Profile retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Health Check
# ============================================================================

@router.get(
    "/health",
    summary="Interview service health check",
    description="Check if interview service is operational"
)
async def health_check() -> dict:
    """
    Health check endpoint.
    
    Returns:
        Status and timestamp
    """
    return {
        "status": "healthy",
        "service": "interview",
        "timestamp": datetime.utcnow().isoformat()
    }


__all__ = ["router"]
