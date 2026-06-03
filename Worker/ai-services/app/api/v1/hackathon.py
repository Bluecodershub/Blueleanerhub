"""
Hackathon API endpoints for code evaluation, plagiarism detection, and submission ranking.
Provides RESTful interface for hackathon management and grading.
"""

import logging
import statistics as stats_module
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime

from app.schemas import (
    EvaluateCodeRequest,
    CodeEvaluationResponse,
    CheckPlagiarismRequest,
    PlagiarismCheckResponse,
    RankSubmissionsRequest,
    RankSubmissionsResponse,
    SubmissionScore,
    HackathonChallenge,
    HackathonSubmission,
    HackathonLeaderboard,
    HackathonStats,
)
from app.services import CodeQualityEvaluator, PlagiarismDetector, CacheService
from app.core import get_cache

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/api/v1/hackathon", tags=["hackathon"])

# Initialize evaluators
code_evaluator = CodeQualityEvaluator()
plagiarism_detector = PlagiarismDetector(similarity_threshold=0.85)


# ============================================================================
# Dependencies
# ============================================================================

async def get_code_evaluator() -> CodeQualityEvaluator:
    """Dependency for code evaluator."""
    return code_evaluator


async def get_plagiarism_detector() -> PlagiarismDetector:
    """Dependency for plagiarism detector."""
    return plagiarism_detector


# ============================================================================
# Code Evaluation Endpoints
# ============================================================================

@router.post(
    "/evaluate",
    response_model=CodeEvaluationResponse,
    summary="Evaluate code submission",
    description="Evaluate code against test cases with comprehensive scoring"
)
async def evaluate_code(
    request: EvaluateCodeRequest,
    evaluator: CodeQualityEvaluator = Depends(get_code_evaluator),
    cache: CacheService = Depends(get_cache)
) -> CodeEvaluationResponse:
    """
    Evaluate a code submission.
    
    Performs comprehensive evaluation including:
    - Correctness testing (40%)
    - Efficiency analysis (25%)
    - Code quality assessment (20%)
    - Best practices check (15%)
    - Innovation scoring (bonus)
    
    Args:
        request: Code evaluation request with code, language, and test cases
        cache: Cache service for storing results
        evaluator: Code quality evaluator
    
    Returns:
        CodeEvaluationResponse with detailed scores and feedback
    
    Raises:
        HTTPException: If evaluation fails
    """
    try:
        logger.info(f"Evaluating submission {request.submission_id} ({request.language})")
        
        # Check cache first
        cache_key = f"evaluation:{request.submission_id}"
        cached_result = await cache.get(cache_key)
        if cached_result:
            logger.info(f"Using cached evaluation for {request.submission_id}")
            return cached_result
        
        # Evaluate code
        eval_result = evaluator.evaluate_submission(
            code=request.code,
            language=request.language.value,
            test_cases=request.test_cases
        )
        
        if 'error' in eval_result:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Evaluation failed: {eval_result['error']}"
            )
        
        # Build response
        test_results = [
            {
                "test_case_id": idx,
                "test_name": f"Test {idx + 1}",
                "input_data": str(tr.get("input", "")),
                "expected_output": str(tr.get("expected", "")),
                "actual_output": str(tr.get("actual", "")),
                "passed": tr.get("passed", False),
                "execution_time": tr.get("execution_time", 0.0),
                "error_message": tr.get("error", None)
            }
            for idx, tr in enumerate(eval_result.get("test_results", []))
        ]
        
        response = CodeEvaluationResponse(
            submission_id=request.submission_id,
            language=request.language,
            correctness_score=eval_result.get("correctness_score", 0),
            efficiency_score=eval_result.get("efficiency_score", 0),
            code_quality_score=eval_result.get("code_quality_score", 0),
            best_practices_score=eval_result.get("best_practices_score", 0),
            innovation_score=eval_result.get("innovation_score", 0),
            final_score=eval_result.get("final_score", 0),
            test_results=test_results,
            passed_tests=eval_result.get("test_results", []).count(True),
            total_tests=len(eval_result.get("test_results", [])),
            execution_time=eval_result.get("execution_time", None),
            memory_used=eval_result.get("memory_used", None),
            feedback=eval_result.get("feedback", []),
            strengths=eval_result.get("strengths", []),
            improvements=eval_result.get("improvements", [])
        )
        
        # Cache result (1 hour)
        await cache.set(cache_key, response.model_dump(), ttl=3600)
        
        logger.info(f"Submission {request.submission_id} evaluated: {response.final_score:.1f}/100")
        
        return response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Evaluation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Plagiarism Detection Endpoints
# ============================================================================

@router.post(
    "/plagiarism-check",
    response_model=PlagiarismCheckResponse,
    summary="Check for plagiarism",
    description="Detect plagiarism by comparing submission with others"
)
async def check_plagiarism(
    request: CheckPlagiarismRequest,
    detector: PlagiarismDetector = Depends(get_plagiarism_detector),
    cache: CacheService = Depends(get_cache)
) -> PlagiarismCheckResponse:
    """
    Check submission for plagiarism.
    
    Uses multi-level plagiarism detection:
    - Token-based similarity (code line matching)
    - AST-based similarity (structural comparison)
    - Normalized code similarity (variable name abstraction)
    
    Combines all three methods for robust detection.
    
    Args:
        request: Plagiarism check request with code and submissions
        cache: Cache service
        detector: Plagiarism detector service
    
    Returns:
        PlagiarismCheckResponse with detailed similarity analysis
    """
    try:
        logger.info(f"Checking plagiarism for submission {request.submission_id}")
        
        cache_key = f"plagiarism:{request.submission_id}"
        cached_result = await cache.get(cache_key)
        if cached_result:
            logger.info(f"Using cached plagiarism check for submission {request.submission_id}")
            return cached_result
        
        # Prepare submissions dictionary for detector
        submissions_dict = {}
        if request.all_submissions:
            for sub in request.all_submissions:
                submissions_dict[sub.get("submission_id", 0)] = sub.get("code", "")
        
        # Run plagiarism detection
        detection_result = detector.detect_plagiarism(
            submission_id=request.submission_id,
            code=request.code,
            all_submissions=submissions_dict
        )
        
        # Build similar submissions response
        similar_submissions = [
            {
                "submission_id": sim["submission_id"],
                "user_id": next(
                    (s.get("user_id", 0) for s in request.all_submissions 
                     if s.get("submission_id") == sim["submission_id"]), 0
                ),
                "similarity_percentage": sim["similarity"] * 100,
                "matching_lines": int(sim["similarity"] * 1000)  # Placeholder
            }
            for sim in detection_result.get("similar_submissions", [])[:5]  # Top 5
        ]
        
        response = PlagiarismCheckResponse(
            submission_id=request.submission_id,
            is_plagiarized=detection_result.get("is_plagiarized", False),
            confidence=detection_result.get("confidence", 0.0),
            plagiarism_percentage=detection_result.get("confidence", 0.0) * 100,
            similar_submissions=similar_submissions,
            similarity_scores={
                str(k): v for k, v in detection_result.get("similarity_scores", {}).items()
            },
            report=detection_result.get("report", ""),
            flagged_sections=[],
            recommendations=[
                "Review code structure and algorithms",
                "Compare variable naming patterns",
                "Check for identical logic flows"
            ] if detection_result.get("is_plagiarized") else []
        )
        
        # Cache result (24 hours)
        await cache.set(cache_key, response.model_dump(), ttl=86400)
        
        logger.info(
            f"Plagiarism check complete for {request.submission_id}: "
            f"{'PLAGIARISM DETECTED' if response.is_plagiarized else 'ORIGINAL'} "
            f"({response.confidence:.1%} confidence)"
        )
        
        return response
    
    except Exception as e:
        logger.error(f"Plagiarism check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Ranking Endpoints
# ============================================================================

@router.post(
    "/rank-submissions",
    response_model=RankSubmissionsResponse,
    summary="Rank hackathon submissions",
    description="Rank submissions by score and provide leaderboard"
)
async def rank_submissions(
    request: RankSubmissionsRequest,
    cache: CacheService = Depends(get_cache)
) -> RankSubmissionsResponse:
    """
    Rank hackathon submissions.
    
    Processes multiple submissions and generates ranked leaderboard
    with statistical analysis.
    
    Args:
        request: Ranking request with submissions
        cache: Cache service
    
    Returns:
        RankSubmissionsResponse with ranked submissions
    """
    try:
        logger.info(f"Ranking {len(request.submissions)} submissions for hackathon {request.hackathon_id}")
        
        cache_key = f"ranking:hackathon:{request.hackathon_id}"
        cached_result = await cache.get(cache_key)
        if cached_result:
            logger.info(f"Using cached ranking for hackathon {request.hackathon_id}")
            return cached_result
        
        # Calculate scores
        submissions_with_scores = []
        
        default_weights = {
            "correctness": 0.4,
            "efficiency": 0.25,
            "quality": 0.2,
            "practices": 0.15
        }
        
        weights = request.weights or default_weights
        
        for submission in request.submissions:
            # Mock score calculation (TODO: use actual evaluation results)
            user_id = submission.get("user_id", 0)
            submission_id = submission.get("submission_id", 0)
            
            # Get evaluation scores from submission or mock
            correct = submission.get("correctness_score", 85)
            efficiency = submission.get("efficiency_score", 75)
            quality = submission.get("code_quality_score", 80)
            practices = submission.get("best_practices_score", 85)
            
            final_score = (
                correct * weights.get("correctness", 0.4) +
                efficiency * weights.get("efficiency", 0.25) +
                quality * weights.get("quality", 0.2) +
                practices * weights.get("practices", 0.15)
            )
            
            submissions_with_scores.append({
                "submission_id": submission_id,
                "user_id": user_id,
                "username": submission.get("username", f"User {user_id}"),
                "final_score": final_score,
                "breakdown": {
                    "correctness": correct,
                    "efficiency": efficiency,
                    "quality": quality,
                    "practices": practices
                },
                "submitted_at": submission.get("submitted_at", datetime.utcnow()),
                "evaluation_status": submission.get("evaluation_status", "evaluated")
            })
        
        # Sort by score
        submissions_with_scores.sort(key=lambda x: x["final_score"], reverse=True)
        
        # Add ranks
        ranked_submissions = [
            SubmissionScore(
                submission_id=sub["submission_id"],
                user_id=sub["user_id"],
                username=sub.get("username"),
                final_score=sub["final_score"],
                rank=idx + 1,
                breakdown=sub["breakdown"],
                submitted_at=sub.get("submitted_at", datetime.utcnow()),
                evaluation_status=sub.get("evaluation_status", "evaluated")
            )
            for idx, sub in enumerate(submissions_with_scores)
        ]
        
        # Statistics
        scores = [s.final_score for s in ranked_submissions]
        
        statistics = {
            "total_scores": len(scores),
            "average_score": stats_module.mean(scores) if scores else 0.0,
            "highest_score": max(scores) if scores else 0.0,
            "lowest_score": min(scores) if scores else 0.0,
            "median_score": stats_module.median(scores) if scores else 0.0,
            "score_std_dev": stats_module.stdev(scores) if len(scores) > 1 else 0.0
        }
        
        response = RankSubmissionsResponse(
            hackathon_id=request.hackathon_id,
            total_submissions=len(request.submissions),
            ranked_submissions=ranked_submissions,
            statistics=statistics
        )
        
        # Cache result (6 hours - may change as submissions are evaluated)
        await cache.set(cache_key, response.model_dump(), ttl=21600)
        
        logger.info(f"Ranking complete: {len(ranked_submissions)} submissions ranked")
        
        return response
    
    except Exception as e:
        logger.error(f"Ranking error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Batch Evaluation Endpoints
# ============================================================================

@router.post(
    "/evaluate-batch",
    response_model=List[CodeEvaluationResponse],
    summary="Batch evaluate submissions",
    description="Evaluate multiple code submissions in one request"
)
async def batch_evaluate_code(
    requests: List[EvaluateCodeRequest],
    evaluator: CodeQualityEvaluator = Depends(get_code_evaluator),
    cache: CacheService = Depends(get_cache)
) -> List[CodeEvaluationResponse]:
    """
    Evaluate multiple code submissions in batch.
    
    Efficiently evaluates up to 20 submissions per request.
    
    Args:
        requests: List of code evaluation requests (max 20)
        cache: Cache service
        evaluator: Code quality evaluator
    
    Returns:
        List of CodeEvaluationResponse objects
    
    Raises:
        HTTPException: If batch size exceeds 20 or evaluation fails
    """
    try:
        if not requests or len(requests) > 20:
            raise ValueError("Batch size must be between 1 and 20")
        
        logger.info(f"Batch evaluating {len(requests)} submissions")
        
        responses = []
        for request in requests:
            try:
                # Check cache
                cache_key = f"evaluation:{request.submission_id}"
                cached_result = await cache.get(cache_key)
                if cached_result:
                    responses.append(CodeEvaluationResponse(**cached_result))
                    continue
                
                # Evaluate
                eval_result = evaluator.evaluate_submission(
                    code=request.code,
                    language=request.language.value,
                    test_cases=request.test_cases
                )
                
                if 'error' not in eval_result:
                    test_results = [
                        {
                            "test_case_id": idx,
                            "test_name": f"Test {idx + 1}",
                            "input_data": str(tr.get("input", "")),
                            "expected_output": str(tr.get("expected", "")),
                            "actual_output": str(tr.get("actual", "")),
                            "passed": tr.get("passed", False),
                            "execution_time": tr.get("execution_time", 0.0),
                            "error_message": tr.get("error", None)
                        }
                        for idx, tr in enumerate(eval_result.get("test_results", []))
                    ]
                    
                    response = CodeEvaluationResponse(
                        submission_id=request.submission_id,
                        language=request.language,
                        correctness_score=eval_result.get("correctness_score", 0),
                        efficiency_score=eval_result.get("efficiency_score", 0),
                        code_quality_score=eval_result.get("code_quality_score", 0),
                        best_practices_score=eval_result.get("best_practices_score", 0),
                        innovation_score=eval_result.get("innovation_score", 0),
                        final_score=eval_result.get("final_score", 0),
                        test_results=test_results,
                        passed_tests=sum(1 for tr in eval_result.get("test_results", []) if tr.get("passed")),
                        total_tests=len(eval_result.get("test_results", [])),
                        execution_time=eval_result.get("execution_time", None),
                        memory_used=eval_result.get("memory_used", None),
                        feedback=eval_result.get("feedback", []),
                        strengths=eval_result.get("strengths", []),
                        improvements=eval_result.get("improvements", [])
                    )
                    
                    # Cache
                    await cache.set(cache_key, response.model_dump(), ttl=3600)
                    responses.append(response)
                    logger.debug(f"Batch evaluation: {request.submission_id} = {eval_result.get('final_score', 0):.1f}/100")
            
            except Exception as e:
                logger.warning(f"Error evaluating {request.submission_id}: {e}")
                continue
        
        logger.info(f"Batch evaluation complete: {len(responses)}/{len(requests)} evaluated")
        return responses
    
    except ValueError as e:
        logger.error(f"Batch evaluation validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid batch request: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Batch evaluation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Leaderboard Endpoints
# ============================================================================

@router.get(
    "/hackathon/{hackathon_id}/leaderboard",
    response_model=List[HackathonLeaderboard],
    summary="Get hackathon leaderboard",
    description="Retrieve ranked leaderboard for hackathon"
)
async def get_leaderboard(
    hackathon_id: int,
    cache: CacheService = Depends(get_cache)
) -> List[HackathonLeaderboard]:
    """
    Get hackathon leaderboard.
    
    Args:
        hackathon_id: Hackathon identifier
        cache: Cache service
    
    Returns:
        List of leaderboard entries with rankings
    """
    try:
        logger.info(f"Retrieving leaderboard for hackathon {hackathon_id}")
        
        cache_key = f"leaderboard:hackathon:{hackathon_id}"
        cached = await cache.get(cache_key)
        if cached:
            return cached
        
        # Mock leaderboard data (TODO: fetch from database)
        leaderboard = [
            HackathonLeaderboard(
                rank=1,
                user_id=101,
                username="alice",
                total_score=95.5,
                challenges_solved=5,
                submission_count=8,
                best_time=12.5
            ),
            HackathonLeaderboard(
                rank=2,
                user_id=102,
                username="bob",
                total_score=92.0,
                challenges_solved=5,
                submission_count=10,
                best_time=15.3
            ),
        ]
        
        # Cache (1 hour)
        await cache.set(cache_key, [l.model_dump() for l in leaderboard], ttl=3600)
        
        return leaderboard
    
    except Exception as e:
        logger.error(f"Leaderboard retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Stats Endpoints
# ============================================================================

@router.get(
    "/hackathon/{hackathon_id}/stats",
    response_model=HackathonStats,
    summary="Get hackathon statistics",
    description="Retrieve statistics for hackathon"
)
async def get_hackathon_stats(
    hackathon_id: int,
    cache: CacheService = Depends(get_cache)
) -> HackathonStats:
    """
    Get hackathon statistics.
    
    Args:
        hackathon_id: Hackathon identifier
        cache: Cache service
    
    Returns:
        HackathonStats with participation and performance metrics
    """
    try:
        logger.info(f"Retrieving stats for hackathon {hackathon_id}")
        
        cache_key = f"stats:hackathon:{hackathon_id}"
        cached = await cache.get(cache_key)
        if cached:
            return cached
        
        # Mock stats (TODO: calculate from database)
        stats = HackathonStats(
            hackathon_id=hackathon_id,
            total_participants=42,
            total_submissions=156,
            challenges_count=5,
            average_score=78.5,
            highest_score=95.5,
            completed_challenges=183  # Participant-challenge pairs
        )
        
        # Cache (30 minutes)
        await cache.set(cache_key, stats.model_dump(), ttl=1800)
        
        return stats
    
    except Exception as e:
        logger.error(f"Stats retrieval error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


# ============================================================================
# Health Check
# ============================================================================

@router.get(
    "/health",
    summary="Hackathon service health check",
    description="Check if hackathon service is operational"
)
async def health_check() -> dict:
    """
    Health check endpoint.
    
    Returns:
        Status and timestamp
    """
    return {
        "status": "healthy",
        "service": "hackathon",
        "timestamp": datetime.utcnow().isoformat()
    }


__all__ = ["router"]
