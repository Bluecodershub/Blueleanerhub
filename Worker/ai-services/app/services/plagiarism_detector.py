"""
Multi-level plagiarism detection system.
Uses token-based, AST-based, and normalized code comparison.
"""

import ast
import difflib
import logging
from typing import Dict, List, Optional, Tuple

try:
    import numpy as np
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError:
    np = None
    cosine_similarity = None

logger = logging.getLogger(__name__)


class PlagiarismDetector:
    """
    Comprehensive multi-level plagiarism detection system.
    
    Detects plagiarism through three independent methods:
    1. Token-based similarity (sequence matching)
    2. AST-based similarity (structural comparison)
    3. Normalized code similarity (variable name abstraction)
    
    Combines scores using weighted average for robust detection.
    
    Example:
        detector = PlagiarismDetector(threshold=0.85)
        result = detector.detect_plagiarism(
            submission_id=1,
            code="def quicksort(arr):\n    ...",
            all_submissions={
                2: "def sort_array(arr):\n    ...",
                3: "def merge_sort(arr):\n    ..."
            }
        )
    """
    
    def __init__(self, similarity_threshold: float = 0.85):
        """
        Initialize plagiarism detector.
        
        Args:
            similarity_threshold: Similarity score needed to flag plagiarism (0-1)
        """
        self.similarity_threshold = max(0.0, min(1.0, similarity_threshold))
        logger.info(f"PlagiarismDetector initialized with threshold: {self.similarity_threshold:.2%}")
    
    def detect_plagiarism(
        self,
        submission_id: int,
        code: str,
        all_submissions: Dict[int, str]
    ) -> Dict:
        """
        Comprehensive plagiarism detection across multiple similarity metrics.
        
        Args:
            submission_id: ID of submission being checked
            code: Source code of submission
            all_submissions: Dictionary of all other submissions {id: code}
        
        Returns:
            Dictionary with:
            - is_plagiarized: bool - Whether plagiarism detected
            - confidence: float - Confidence score (0-1)
            - similar_submissions: list - Submissions similar above threshold
            - similarity_scores: dict - All similarity scores
            - report: str - Human-readable report
        """
        results = {
            'is_plagiarized': False,
            'confidence': 0.0,
            'similar_submissions': [],
            'similarity_scores': {},
            'report': '',
            'detection_methods_used': []
        }
        
        try:
            logger.info(
                f"Detecting plagiarism for submission {submission_id} "
                f"against {len(all_submissions)} other submissions"
            )
            
            # Skip if no other submissions
            if not all_submissions or all(sid == submission_id for sid in all_submissions):
                results['report'] = "No other submissions to compare against."
                return results
            
            # Level 1: Token-based similarity
            logger.debug("Running token-based similarity analysis...")
            token_similarities = self._token_similarity(code, all_submissions)
            results['detection_methods_used'].append('TOKEN_BASED')
            
            # Level 2: AST-based similarity
            logger.debug("Running AST-based similarity analysis...")
            ast_similarities = self._ast_similarity(code, all_submissions)
            results['detection_methods_used'].append('AST_BASED')
            
            # Level 3: Normalized code similarity
            logger.debug("Running normalized similarity analysis...")
            normalized_similarities = self._normalized_similarity(code, all_submissions)
            results['detection_methods_used'].append('NORMALIZED')
            
            # Combine scores using weighted average
            max_confidence = 0.0
            
            for sub_id, other_code in all_submissions.items():
                if sub_id == submission_id:
                    continue
                
                # Weighted combination (0.3 + 0.4 + 0.3 = 1.0)
                combined_score = (
                    0.3 * token_similarities.get(sub_id, 0.0) +
                    0.4 * ast_similarities.get(sub_id, 0.0) +
                    0.3 * normalized_similarities.get(sub_id, 0.0)
                )
                
                results['similarity_scores'][str(sub_id)] = float(combined_score)
                
                # Flag if similarity exceeds threshold
                if combined_score > self.similarity_threshold:
                    results['similar_submissions'].append({
                        'submission_id': sub_id,
                        'similarity': float(combined_score),
                        'token_similarity': float(token_similarities.get(sub_id, 0.0)),
                        'ast_similarity': float(ast_similarities.get(sub_id, 0.0)),
                        'normalized_similarity': float(normalized_similarities.get(sub_id, 0.0)),
                        'flagged_reason': 'Similarity exceeds threshold'
                    })
                    results['is_plagiarized'] = True
                    max_confidence = max(max_confidence, combined_score)
            
            # Sort by similarity (descending)
            results['similar_submissions'].sort(key=lambda x: x['similarity'], reverse=True)
            
            # Calculate overall confidence
            if results['similar_submissions']:
                results['confidence'] = max_confidence
            
            # Generate report
            results['report'] = self._generate_report(results)
            
            outcome = "PLAGIARISM DETECTED" if results['is_plagiarized'] else "ORIGINAL"
            logger.info(
                f"Plagiarism detection complete for submission {submission_id}: {outcome} "
                f"(confidence: {results['confidence']:.1%})"
            )
        
        except Exception as e:
            logger.error(f"Plagiarism detection error: {e}")
            results['error'] = str(e)
        
        return results
    
    def _token_similarity(self, code1: str, all_submissions: Dict[int, str]) -> Dict[int, float]:
        """
        Calculate token-based similarity using sequence matching.
        
        Tokenizes code by lines and compares token sequences.
        Effective for detecting textually similar code.
        
        Args:
            code1: Reference code
            all_submissions: Other submissions to compare
        
        Returns:
            Dictionary of {submission_id: similarity_score}
        """
        similarities = {}
        
        try:
            # Tokenize reference code
            tokens1 = self._tokenize_code(code1)
            
            for sub_id, code2 in all_submissions.items():
                try:
                    tokens2 = self._tokenize_code(code2)
                    
                    # Calculate sequence similarity
                    matcher = difflib.SequenceMatcher(None, tokens1, tokens2)
                    similarity = matcher.ratio()
                    
                    similarities[sub_id] = float(similarity)
                
                except Exception as e:
                    logger.warning(f"Error comparing with submission {sub_id}: {e}")
                    similarities[sub_id] = 0.0
        
        except Exception as e:
            logger.error(f"Token similarity calculation error: {e}")
            similarities = {sub_id: 0.0 for sub_id in all_submissions.keys()}
        
        return similarities
    
    def _tokenize_code(self, code: str) -> List[str]:
        """
        Tokenize code by lines, removing comments and empty lines.
        
        Args:
            code: Source code
        
        Returns:
            List of non-empty code lines (without comments)
        """
        lines = code.split('\n')
        cleaned = []
        
        for line in lines:
            # Remove comments (Python syntax)
            if '#' in line:
                line = line[:line.index('#')]
            
            # Remove shell-style comments
            if line.strip().startswith('//') or line.strip().startswith('/*'):
                continue
            
            stripped = line.strip()
            if stripped and not stripped.startswith('/*'):
                cleaned.append(stripped)
        
        return cleaned
    
    def _ast_similarity(self, code1: str, all_submissions: Dict[int, str]) -> Dict[int, float]:
        """
        Calculate AST-based structural similarity.
        
        Parses code into Abstract Syntax Trees and compares structure.
        Effective for detecting functionally similar code.
        
        Args:
            code1: Reference code
            all_submissions: Other submissions to compare
        
        Returns:
            Dictionary of {submission_id: similarity_score}
        """
        similarities = {}
        
        try:
            tree1 = ast.parse(code1)
            ast_str1 = ast.dump(tree1)
            
            for sub_id, code2 in all_submissions.items():
                try:
                    tree2 = ast.parse(code2)
                    ast_str2 = ast.dump(tree2)
                    
                    # Compare AST structures
                    matcher = difflib.SequenceMatcher(None, ast_str1, ast_str2)
                    similarity = matcher.ratio()
                    
                    similarities[sub_id] = float(similarity)
                
                except SyntaxError as e:
                    logger.warning(f"Syntax error in submission {sub_id}: {e}")
                    similarities[sub_id] = 0.0
                except Exception as e:
                    logger.warning(f"AST comparison error for submission {sub_id}: {e}")
                    similarities[sub_id] = 0.0
        
        except SyntaxError as e:
            logger.warning(f"Syntax error in reference code: {e}")
            return {sub_id: 0.0 for sub_id in all_submissions.keys()}
        except Exception as e:
            logger.error(f"AST similarity calculation error: {e}")
            return {sub_id: 0.0 for sub_id in all_submissions.keys()}
        
        return similarities
    
    def _normalized_similarity(self, code1: str, all_submissions: Dict[int, str]) -> Dict[int, float]:
        """
        Calculate similarity after code normalization.
        
        Normalizes variable names and normalizes code structure
        to detect functionally equivalent implementations.
        
        Args:
            code1: Reference code
            all_submissions: Other submissions to compare
        
        Returns:
            Dictionary of {submission_id: similarity_score}
        """
        similarities = {}
        
        try:
            normalized1 = self._normalize_code(code1)
            
            for sub_id, code2 in all_submissions.items():
                try:
                    normalized2 = self._normalize_code(code2)
                    
                    matcher = difflib.SequenceMatcher(None, normalized1, normalized2)
                    similarity = matcher.ratio()
                    
                    similarities[sub_id] = float(similarity)
                
                except Exception as e:
                    logger.warning(f"Normalization error for submission {sub_id}: {e}")
                    similarities[sub_id] = 0.0
        
        except Exception as e:
            logger.error(f"Normalized similarity calculation error: {e}")
            return {sub_id: 0.0 for sub_id in all_submissions.keys()}
        
        return similarities
    
    def _normalize_code(self, code: str) -> str:
        """
        Normalize code by replacing identifiers with generic placeholders.
        
        This makes the comparison more robust to simple renaming/obfuscation.
        
        Args:
            code: Source code
        
        Returns:
            Normalized code string
        """
        try:
            tree = ast.parse(code)
            
            # Map variable names to generic placeholders
            var_map = {}
            var_counter = [0]
            
            class VariableNormalizer(ast.NodeTransformer):
                """Normalize variable names in AST."""
                
                def visit_Name(self, node):
                    """Replace Name nodes with normalized versions."""
                    if node.id not in var_map:
                        var_map[node.id] = f'var{var_counter[0]}'
                        var_counter[0] += 1
                    node.id = var_map[node.id]
                    self.generic_visit(node)
                    return node
                
                def visit_arg(self, node):
                    """Replace function argument names."""
                    if node.arg not in var_map:
                        var_map[node.arg] = f'var{var_counter[0]}'
                        var_counter[0] += 1
                    node.arg = var_map[node.arg]
                    self.generic_visit(node)
                    return node
            
            # Apply normalization
            normalizer = VariableNormalizer()
            normalized_tree = normalizer.visit(tree)
            
            # Convert back to code
            try:
                return ast.unparse(normalized_tree)
            except AttributeError:
                # Fallback for older Python versions
                return ast.dump(normalized_tree)
        
        except SyntaxError as e:
            logger.warning(f"Syntax error during normalization: {e}")
            return code
        except Exception as e:
            logger.warning(f"Normalization error: {e}")
            return code
    
    def _generate_report(self, results: Dict) -> str:
        """
        Generate human-readable plagiarism detection report.
        
        Args:
            results: Detection results dictionary
        
        Returns:
            Formatted report string
        """
        if not results['is_plagiarized']:
            return "✓ No plagiarism detected. Code appears to be original."
        
        report_lines = [
            f"⚠️ PLAGIARISM DETECTED (Confidence: {results['confidence']:.1%})",
            "",
            f"Found {len(results['similar_submissions'])} similar submission(s):",
            ""
        ]
        
        # Add top 5 similar submissions
        for idx, similar in enumerate(results['similar_submissions'][:5], 1):
            report_lines.append(
                f"{idx}. Submission #{similar['submission_id']}: "
                f"{similar['similarity']:.1%} similar"
            )
            report_lines.append(
                f"   Token similarity:      {similar['token_similarity']:.1%}"
            )
            report_lines.append(
                f"   AST similarity:        {similar['ast_similarity']:.1%}"
            )
            report_lines.append(
                f"   Normalized similarity: {similar['normalized_similarity']:.1%}"
            )
            report_lines.append("")
        
        if len(results['similar_submissions']) > 5:
            report_lines.append(
                f"... and {len(results['similar_submissions']) - 5} more"
            )
        
        return "\n".join(report_lines)
    
    def set_threshold(self, threshold: float) -> None:
        """
        Set similarity threshold for plagiarism detection.
        
        Args:
            threshold: Threshold value (0-1)
        """
        self.similarity_threshold = max(0.0, min(1.0, threshold))
        logger.info(f"Plagiarism threshold updated to {self.similarity_threshold:.2%}")
    
    def batch_detect(
        self,
        submissions: Dict[int, str]
    ) -> Dict[int, Dict]:
        """
        Detect plagiarism across all submissions.
        
        Performs pairwise comparison across all submissions.
        
        Args:
            submissions: Dictionary of {submission_id: code}
        
        Returns:
            Dictionary mapping submission_id to detection results
        """
        results = {}
        
        logger.info(f"Running batch plagiarism detection on {len(submissions)} submissions")
        
        for submission_id, code in submissions.items():
            other_submissions = {
                sid: c for sid, c in submissions.items()
                if sid != submission_id
            }
            
            results[submission_id] = self.detect_plagiarism(
                submission_id,
                code,
                other_submissions
            )
        
        logger.info(f"Batch detection complete")
        
        return results


__all__ = ["PlagiarismDetector"]
