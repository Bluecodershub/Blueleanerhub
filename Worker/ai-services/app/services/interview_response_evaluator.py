"""
Interview response evaluation and scoring system.
Evaluates candidate answers across multiple dimensions: relevance, completeness,
technical accuracy, communication quality, and confidence level.
"""

import re
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)


class InterviewResponseEvaluator:
    """
    Comprehensive interview response evaluation system.
    
    Evaluates candidate answers across 5 dimensions:
    1. **Relevance** (25%): How well answer addresses the question
    2. **Completeness** (25%): How thoroughly the answer covers expected points
    3. **Technical Accuracy** (30%): Technical depth and correctness
    4. **Communication Quality** (10%): Clarity, structure, and presentation
    5. **Confidence Level** (10%): Conviction and absence of hedging
    
    Provides detailed scoring, feedback, and improvement suggestions.
    
    Example:
        evaluator = InterviewResponseEvaluator()
        result = evaluator.evaluate_response(
            question="Explain how you would design a microservices architecture",
            candidate_answer="I would start by identifying service boundaries...",
            expected_answer="Key points: identify boundaries, API contracts, data consistency..."
        )
        # Returns: { overall_score, relevance_score, completeness_score, ... }
    """
    
    def __init__(self):
        """Initialize evaluator with linguistic markers."""
        # Words that indicate hesitation or lack of confidence
        self.filler_words = {
            'um', 'uh', 'like', 'you know', 'sort of', 'kind of',
            'actually', 'basically', 'literally', 'i mean', 'well'
        }
        
        # Words that indicate hedging or uncertainty
        self.hedge_words = {
            'maybe', 'probably', 'i think', 'i guess', 'possibly',
            'perhaps', 'might', 'could be', 'seems', 'appears'
        }
        
        # Stop words for keyword extraction
        self.stop_words = {
            'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
            'of', 'to', 'in', 'for', 'with', 'as', 'by', 'from', 'have', 'has',
            'are', 'be', 'been', 'being', 'was', 'were', 'do', 'does', 'did',
            'will', 'would', 'should', 'could', 'can', 'if', 'this', 'that',
            'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        }
        
        # Technical indicators for accuracy assessment
        self.technical_indicators = {
            'algorithm', 'complexity', 'data structure', 'optimization',
            'performance', 'scalability', 'efficiency', 'implementation',
            'architecture', 'pattern', 'design', 'trade-off', 'tradeoff',
            'latency', 'throughput', 'consistency', 'availability',
            'database', 'query', 'index', 'cache', 'load balancing'
        }
        
        logger.info("InterviewResponseEvaluator initialized")
    
    def evaluate_response(
        self,
        question: str,
        candidate_answer: str,
        expected_answer: Optional[str] = None,
        difficulty_level: str = "medium"
    ) -> Dict:
        """
        Evaluate a candidate's interview response comprehensively.
        
        Scores answer across 5 dimensions and provides detailed feedback.
        
        Args:
            question: Interview question asked
            candidate_answer: Candidate's response text
            expected_answer: Reference/expected answer for comparison (optional)
            difficulty_level: Question difficulty (easy, medium, hard, expert)
        
        Returns:
            Dictionary containing:
            - relevance_score: 0-100, how well answer addresses question
            - completeness_score: 0-100, coverage of expected points
            - technical_accuracy: 0-100, technical depth and correctness
            - communication_quality: 0-100, clarity and structure
            - confidence_level: 0-100, conviction and decisiveness
            - overall_score: Weighted average (0-100)
            - feedback: Human-readable summary
            - improvement_suggestions: List of actionable suggestions
            - assessment_details: Detailed analysis for each dimension
        
        Raises:
            ValueError: If question or answer is empty
        """
        try:
            if not question or not question.strip():
                raise ValueError("Question cannot be empty")
            if not candidate_answer or not candidate_answer.strip():
                raise ValueError("Candidate answer cannot be empty")
            
            logger.debug(f"Evaluating response for question: {question[:50]}...")
            
            # Initialize scores dictionary
            scores = {
                'relevance_score': 0.0,
                'completeness_score': 0.0,
                'technical_accuracy': 0.0,
                'communication_quality': 0.0,
                'confidence_level': 0.0,
                'overall_score': 0.0,
                'feedback': '',
                'improvement_suggestions': [],
                'assessment_details': {}
            }
            
            # 1. Evaluate Relevance (25% weight)
            scores['relevance_score'], relevance_detail = self._check_relevance(question, candidate_answer)
            scores['assessment_details']['relevance'] = relevance_detail
            
            # 2. Evaluate Completeness (25% weight)
            if expected_answer:
                scores['completeness_score'], completeness_detail = self._check_completeness(
                    candidate_answer,
                    expected_answer
                )
            else:
                scores['completeness_score'], completeness_detail = self._estimate_completeness(
                    candidate_answer,
                    difficulty_level
                )
            scores['assessment_details']['completeness'] = completeness_detail
            
            # 3. Evaluate Technical Accuracy (30% weight)
            scores['technical_accuracy'], technical_detail = self._assess_technical_accuracy(
                candidate_answer,
                difficulty_level
            )
            scores['assessment_details']['technical'] = technical_detail
            
            # 4. Evaluate Communication Quality (10% weight)
            scores['communication_quality'], communication_detail = self._evaluate_communication(
                candidate_answer
            )
            scores['assessment_details']['communication'] = communication_detail
            
            # 5. Evaluate Confidence Level (10% weight)
            scores['confidence_level'], confidence_detail = self._analyze_confidence(
                candidate_answer
            )
            scores['assessment_details']['confidence'] = confidence_detail
            
            # Calculate weighted overall score
            weights = {
                'relevance_score': 0.25,
                'completeness_score': 0.25,
                'technical_accuracy': 0.30,
                'communication_quality': 0.10,
                'confidence_level': 0.10
            }
            
            scores['overall_score'] = sum(scores[k] * weights[k] for k in weights)
            
            # Generate feedback and suggestions
            scores['feedback'] = self._generate_feedback(scores)
            scores['improvement_suggestions'] = self._generate_suggestions(scores)
            
            logger.info(f"Response evaluation complete: {scores['overall_score']:.1f}% overall")
            return scores
        
        except Exception as e:
            logger.error(f"Response evaluation error: {e}")
            raise
    
    def _check_relevance(self, question: str, answer: str) -> tuple:
        """
        Check if answer is relevant to question.
        
        Extracts keywords from both and measures overlap.
        
        Args:
            question: Interview question
            answer: Candidate answer
        
        Returns:
            Tuple of (relevance_score, detail_dict)
        """
        question_keywords = set(self._extract_keywords(question))
        answer_keywords = set(self._extract_keywords(answer))
        
        if not question_keywords:
            return 70.0, {'keywords_matched': 0, 'keywords_expected': 0}
        
        overlap = len(question_keywords & answer_keywords)
        relevance = (overlap / len(question_keywords)) * 100.0
        relevance_score = min(100.0, relevance)
        
        detail = {
            'keywords_matched': overlap,
            'keywords_expected': len(question_keywords),
            'match_percentage': round(relevance_score, 1),
            'matched_keywords': sorted(list(question_keywords & answer_keywords))[:10]
        }
        
        return relevance_score, detail
    
    def _extract_keywords(self, text: str) -> List[str]:
        """
        Extract important keywords from text.
        
        Removes stop words and short terms, keeps meaningful vocabulary.
        
        Args:
            text: Input text
        
        Returns:
            List of extracted keywords
        """
        # Extract words and convert to lowercase
        words = re.findall(r'\b\w+\b', text.lower())
        
        # Filter: remove stop words and keep words > 3 characters
        keywords = [
            w for w in words
            if w not in self.stop_words and len(w) > 3
        ]
        
        return keywords
    
    def _check_completeness(self, answer: str, expected_answer: str) -> tuple:
        """
        Check completeness against expected answer.
        
        Compares answer coverage against reference points.
        
        Args:
            answer: Candidate answer
            expected_answer: Reference/expected answer
        
        Returns:
            Tuple of (completeness_score, detail_dict)
        """
        expected_points = set(self._extract_keywords(expected_answer))
        answer_points = set(self._extract_keywords(answer))
        
        if not expected_points:
            return 70.0, {'points_covered': 0, 'points_expected': 0}
        
        covered = len(expected_points & answer_points)
        completeness = (covered / len(expected_points)) * 100.0
        completeness_score = min(100.0, completeness)
        
        detail = {
            'points_covered': covered,
            'points_expected': len(expected_points),
            'coverage_percentage': round(completeness_score, 1),
            'covered_points': sorted(list(expected_points & answer_points))[:10],
            'missing_points': sorted(list(expected_points - answer_points))[:5]
        }
        
        return completeness_score, detail
    
    def _estimate_completeness(self, answer: str, difficulty_level: str) -> tuple:
        """
        Estimate completeness based on answer characteristics.
        
        Used when no expected answer is provided.
        
        Args:
            answer: Candidate answer
            difficulty_level: Question difficulty level
        
        Returns:
            Tuple of (completeness_score, detail_dict)
        """
        word_count = len(answer.split())
        sentence_count = len(re.split(r'[.!?]+', answer.strip()))
        
        # Expected length varies by difficulty
        length_thresholds = {
            'easy': (15, 30, 50, 80),      # min, short, medium, long
            'medium': (30, 60, 100, 150),
            'hard': (50, 100, 150, 200),
            'expert': (100, 150, 250, 350)
        }
        
        thresholds = length_thresholds.get(difficulty_level, length_thresholds['medium'])
        
        if word_count < thresholds[0]:
            completeness_score = 30.0
        elif word_count < thresholds[1]:
            completeness_score = 55.0
        elif word_count < thresholds[2]:
            completeness_score = 75.0
        elif word_count < thresholds[3]:
            completeness_score = 90.0
        else:
            completeness_score = 95.0
        
        detail = {
            'word_count': word_count,
            'sentence_count': sentence_count,
            'avg_sentence_length': round(word_count / max(1, sentence_count), 1),
            'depth_indicator': 'Concise' if word_count < thresholds[1] else
                              'Moderate' if word_count < thresholds[2] else
                              'Comprehensive'
        }
        
        return completeness_score, detail
    
    def _assess_technical_accuracy(self, answer: str, difficulty_level: str) -> tuple:
        """
        Assess technical accuracy and depth.
        
        Evaluates technical terminology and concept understanding.
        
        Args:
            answer: Candidate answer
            difficulty_level: Question difficulty level
        
        Returns:
            Tuple of (technical_accuracy_score, detail_dict)
        """
        answer_lower = answer.lower()
        
        # Count technical indicators
        tech_count = sum(
            1 for indicator in self.technical_indicators
            if indicator in answer_lower
        )
        
        # Adjusted scoring based on difficulty
        if difficulty_level == 'easy':
            if tech_count >= 1:
                accuracy_score = 75.0
            else:
                accuracy_score = 50.0
        elif difficulty_level == 'medium':
            if tech_count >= 3:
                accuracy_score = 85.0
            elif tech_count >= 2:
                accuracy_score = 70.0
            else:
                accuracy_score = 50.0
        elif difficulty_level == 'hard':
            if tech_count >= 4:
                accuracy_score = 90.0
            elif tech_count >= 3:
                accuracy_score = 75.0
            elif tech_count >= 2:
                accuracy_score = 60.0
            else:
                accuracy_score = 40.0
        else:  # expert
            if tech_count >= 5:
                accuracy_score = 95.0
            elif tech_count >= 4:
                accuracy_score = 80.0
            elif tech_count >= 3:
                accuracy_score = 65.0
            else:
                accuracy_score = 45.0
        
        # Bonus for specific patterns
        if re.search(r'\b(trade[- ]off|scalability|optimization)\b', answer_lower):
            accuracy_score = min(100.0, accuracy_score + 5)
        
        if re.search(r'\b(performance|complexity|analysis)\b', answer_lower):
            accuracy_score = min(100.0, accuracy_score + 3)
        
        detail = {
            'technical_terms_found': tech_count,
            'difficulty_adjusted': True,
            'specific_patterns_found': list(set(
                [ind for ind in self.technical_indicators if ind in answer_lower]
            ))[:5]
        }
        
        return accuracy_score, detail
    
    def _evaluate_communication(self, answer: str) -> tuple:
        """
        Evaluate communication quality.
        
        Assesses clarity, structure, sentence construction, and presentation.
        
        Args:
            answer: Candidate answer
        
        Returns:
            Tuple of (communication_score, detail_dict)
        """
        score = 100.0
        details = {}
        
        # Analyze sentence structure
        sentences = [s.strip() for s in re.split(r'[.!?]+', answer) if s.strip()]
        details['sentence_count'] = len(sentences)
        
        if sentences:
            sentence_lengths = [len(s.split()) for s in sentences]
            avg_length = sum(sentence_lengths) / len(sentences)
            details['avg_sentence_length'] = round(avg_length, 1)
            
            # Penalize if too long or too short
            if avg_length > 40:
                score -= 15  # Run-on sentences
                details['sentence_quality'] = 'Too long/complex'
            elif avg_length < 5:
                score -= 10  # Fragments
                details['sentence_quality'] = 'Too short/fragmented'
            else:
                details['sentence_quality'] = 'Good'
        
        # Check for punctuation
        if not re.search(r'[.!?]', answer):
            score -= 10
            details['punctuation'] = 'Missing'
        else:
            details['punctuation'] = 'Present'
        
        # Check for paragraph structure (longer answers)
        if len(answer.split()) > 100:
            if '\n' not in answer:
                score -= 5  # Consider deducting for lack of structure
                details['structure'] = 'Linear/unstructured'
            else:
                details['structure'] = 'Organized'
        else:
            details['structure'] = 'Concise'
        
        # Check for clarity markers (transitions, connectors)
        clarity_markers = ['first', 'second', 'next', 'finally', 'therefore', 'thus']
        marker_count = sum(1 for m in clarity_markers if m in answer.lower())
        details['clarity_markers'] = marker_count
        
        if marker_count >= 2:
            score += 5  # Bonus for good organization
        
        return max(0.0, min(100.0, score)), details
    
    def _analyze_confidence(self, answer: str) -> tuple:
        """
        Analyze confidence level from response text.
        
        Detects filler words, hedging language, and confidence indicators.
        
        Args:
            answer: Candidate answer
        
        Returns:
            Tuple of (confidence_score, detail_dict)
        """
        confidence_score = 100.0
        answer_lower = answer.lower()
        
        # Count filler words (hesitation indicators)
        filler_count = 0
        found_fillers = []
        for filler in self.filler_words:
            count = len(re.findall(r'\b' + re.escape(filler) + r'\b', answer_lower))
            filler_count += count
            if count > 0:
                found_fillers.append(f"{filler} ({count}x)")
        
        confidence_score -= min(30, filler_count * 3)  # Penalize fillers
        
        # Count hedging language (uncertainty indicators)
        hedge_count = 0
        found_hedges = []
        for hedge in self.hedge_words:
            count = len(re.findall(r'\b' + re.escape(hedge) + r'\b', answer_lower))
            hedge_count += count
            if count > 0:
                found_hedges.append(f"{hedge} ({count}x)")
        
        confidence_score -= min(20, hedge_count * 2)  # Penalize hedges
        
        # Boost for decisive language
        decisive_words = ['will', 'must', 'always', 'certainly', 'definitely']
        decisive_count = sum(
            len(re.findall(r'\b' + re.escape(w) + r'\b', answer_lower))
            for w in decisive_words
        )
        if decisive_count >= 2:
            confidence_score = min(100.0, confidence_score + 10)
        
        # Boost for personal accountability (I, we)
        if re.search(r'\b(i would|i will|i can|we can)\b', answer_lower):
            confidence_score = min(100.0, confidence_score + 5)
        
        detail = {
            'filler_words_found': filler_count,
            'filler_examples': found_fillers[:3],
            'hedge_words_found': hedge_count,
            'hedge_examples': found_hedges[:3],
            'decisiveness_indicators': decisive_count,
            'confidence_level': 'High' if confidence_score >= 75 else
                               'Medium' if confidence_score >= 50 else
                               'Low'
        }
        
        return max(0.0, min(100.0, confidence_score)), detail
    
    def _generate_feedback(self, scores: Dict) -> str:
        """
        Generate overall feedback summary.
        
        Args:
            scores: Evaluation scores dictionary
        
        Returns:
            Human-readable feedback string
        """
        feedback_parts = []
        overall = scores['overall_score']
        
        # Overall assessment
        if overall >= 85:
            feedback_parts.append("Excellent response - strong understanding demonstrated.")
        elif overall >= 70:
            feedback_parts.append("Good response with solid understanding.")
        elif overall >= 55:
            feedback_parts.append("Adequate response, but improvement needed.")
        else:
            feedback_parts.append("Response needs significant improvement to meet requirements.")
        
        # Specific dimension feedback
        if scores['relevance_score'] < 70:
            feedback_parts.append("Address the question more directly to improve relevance.")
        
        if scores['completeness_score'] < 70:
            feedback_parts.append("Expand your answer to cover more aspects comprehensively.")
        
        if scores['technical_accuracy'] < 60:
            feedback_parts.append("Include more technical depth and specific examples.")
        
        if scores['communication_quality'] < 60:
            feedback_parts.append("Improve answer structure with clearer organization and transitions.")
        
        if scores['confidence_level'] < 50:
            feedback_parts.append("Eliminate filler words and speak with more conviction.")
        
        return " ".join(feedback_parts)
    
    def _generate_suggestions(self, scores: Dict) -> List[str]:
        """
        Generate actionable improvement suggestions.
        
        Args:
            scores: Evaluation scores dictionary
        
        Returns:
            List of improvement suggestions
        """
        suggestions = []
        
        if scores['relevance_score'] < 75:
            suggestions.append("Directly reference key terms from the question in your answer")
        
        if scores['completeness_score'] < 75:
            suggestions.append("Provide concrete examples and elaborate on main points")
        
        if scores['technical_accuracy'] < 70:
            suggestions.append("Use technical terminology appropriate to the topic")
        
        if scores['technical_accuracy'] < 70:
            suggestions.append("Explain concepts with depth rather than surface-level answers")
        
        if scores['communication_quality'] < 70:
            suggestions.append("Use clear transitions: 'First...', 'Next...', 'Finally...'")
        
        if scores['communication_quality'] < 70:
            suggestions.append("Use short, clear sentences rather than long complex ones")
        
        if scores['confidence_level'] < 70:
            suggestions.append("Avoid filler words like 'um', 'like', 'basically'")
        
        if scores['confidence_level'] < 70:
            suggestions.append("Replace hedging language ('I think', 'maybe') with confident statements")
        
        return suggestions[:5]  # Return top 5


__all__ = ["InterviewResponseEvaluator"]
