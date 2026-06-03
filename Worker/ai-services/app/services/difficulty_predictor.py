"""
Machine learning-based difficulty predictor for quiz questions.
Uses TF-IDF vectorization and Gradient Boosting Classification.
"""

import numpy as np
import logging
from typing import Dict, List, Tuple, Optional

try:
    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.feature_extraction.text import TfidfVectorizer
    import joblib
except ImportError:
    GradientBoostingClassifier = None
    TfidfVectorizer = None
    joblib = None

import re

logger = logging.getLogger(__name__)


class DifficultyPredictor:
    """
    Machine learning model to predict question difficulty levels.
    
    Uses technical term detection, text complexity analysis, and gradient boosting
    classification to predict if a question is easy, medium, hard, or expert level.
    
    Example:
        predictor = DifficultyPredictor()
        difficulty, confidence, probabilities = predictor.predict(
            "What is the time complexity of binary search?",
            ["O(log n)", "O(n)", "O(n²)", "O(1)"]
        )
    """
    
    def __init__(self):
        """Initialize the difficulty predictor with vectorizer and classifier."""
        if not TfidfVectorizer or not GradientBoostingClassifier:
            logger.error("scikit-learn not installed. Install with: pip install scikit-learn")
            return
        
        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 3),
            stop_words='english',
            lowercase=True,
            min_df=1,
            max_df=0.95
        )
        
        self.classifier = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.1,
            max_depth=5,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            verbose=0
        )
        
        self.technical_terms = self._load_technical_terms()
        self.is_trained = False
        self.feature_names = []
    
    def _load_technical_terms(self) -> set:
        """
        Load comprehensive technical terms database.
        Used to detect technical density in questions.
        
        Returns:
            Set of technical terms across multiple domains
        """
        return {
            # Programming concepts
            'algorithm', 'complexity', 'recursion', 'iteration', 'polymorphism',
            'inheritance', 'encapsulation', 'abstraction', 'interface', 'lambda',
            'closure', 'decorator', 'generator', 'iterator', 'exception',
            
            # Data Structures
            'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'node',
            'hash table', 'heap', 'trie', 'binary search', 'hashtable',
            'adjacency', 'traversal', 'inorder', 'preorder', 'postorder',
            
            # Databases
            'normalization', 'transaction', 'acid', 'indexing', 'join',
            'foreign key', 'primary key', 'query optimization', 'schema',
            'denormalization', 'sharding', 'replication', 'consistency',
            
            # Machine Learning / AI
            'neural network', 'gradient descent', 'backpropagation',
            'overfitting', 'regularization', 'cross-validation', 'loss function',
            'activation function', 'convolution', 'embedding', 'attention',
            
            # Systems & Architecture
            'concurrency', 'multithreading', 'deadlock', 'cache', 'race condition',
            'distributed system', 'microservices', 'load balancing', 'failover',
            'scalability', 'latency', 'throughput', 'bandwidth',
            
            # Web/APIs
            'rest', 'api', 'http', 'websocket', 'authentication', 'authorization',
            'encryption', 'ssl', 'cors', 'middleware', 'routing',
            
            # Design Patterns
            'singleton', 'factory', 'observer', 'strategy', 'adapter',
            'decorator', 'proxy', 'facade', 'state', 'builder',
        }
    
    def extract_features(
        self,
        question_text: str,
        options: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """
        Extract features from question for ML prediction.
        
        Features include:
        - Text complexity (word count, word length, sentences)
        - Technical content (term count, density)
        - Code/formula presence
        - Question type (what, how, why, design, optimize, analyze)
        - Option characteristics
        
        Args:
            question_text: The question text
            options: List of answer options
        
        Returns:
            Dictionary of extracted features
        """
        features = {}
        
        # Text complexity features
        words = question_text.split()
        features['word_count'] = float(len(words))
        features['avg_word_length'] = float(np.mean([len(w) for w in words])) if words else 0.0
        
        # Sentence analysis
        sentences = re.split(r'[.!?]+', question_text)
        features['sentence_count'] = float(len([s for s in sentences if s.strip()]))
        features['avg_sentence_length'] = (
            float(features['word_count'] / features['sentence_count'])
            if features['sentence_count'] > 0 else 0.0
        )
        
        # Technical features
        features['technical_term_count'] = float(self._count_technical_terms(question_text))
        features['technical_density'] = (
            float(features['technical_term_count'] / len(words))
            if words else 0.0
        )
        
        # Code-related features
        features['has_code'] = float(1 if '```' in question_text or 'code' in question_text.lower() else 0)
        features['has_formula'] = float(
            1 if any(c in question_text for c in ['∑', '∫', '√', '^', '≤', '≥']) else 0
        )
        features['has_pseudocode'] = float(1 if 'pseudocode' in question_text.lower() else 0)
        
        # Question type features
        question_lower = question_text.lower()
        features['is_what_question'] = float(1 if question_lower.startswith('what') else 0)
        features['is_how_question'] = float(1 if question_lower.startswith('how') else 0)
        features['is_why_question'] = float(1 if question_lower.startswith('why') else 0)
        features['is_design_question'] = float(1 if 'design' in question_lower else 0)
        features['is_optimize_question'] = float(1 if 'optimize' in question_lower else 0)
        features['is_analyze_question'] = float(1 if 'analyze' in question_lower else 0)
        features['is_compare_question'] = float(1 if 'compare' in question_lower else 0)
        features['is_implement_question'] = float(1 if 'implement' in question_lower else 0)
        
        # Option complexity
        if options:
            option_lengths = [len(opt) for opt in options]
            features['avg_option_length'] = float(np.mean(option_lengths))
            features['num_options'] = float(len(options))
            features['option_length_variance'] = float(np.var(option_lengths))
            features['max_option_length'] = float(max(option_lengths))
            features['min_option_length'] = float(min(option_lengths))
        else:
            features['avg_option_length'] = 0.0
            features['num_options'] = 0.0
            features['option_length_variance'] = 0.0
            features['max_option_length'] = 0.0
            features['min_option_length'] = 0.0
        
        # Special keywords indicating difficulty
        advanced_keywords = {
            'edge case': 2, 'algorithm': 2, 'optimize': 1.5,
            'design': 1.5, 'architecture': 2, 'scalability': 2,
            'concurrency': 2, 'distributed': 2, 'fault tolerance': 2
        }
        
        keyword_score = 0.0
        for keyword, weight in advanced_keywords.items():
            if keyword in question_lower:
                keyword_score += weight
        
        features['advanced_keyword_score'] = float(keyword_score)
        
        return features
    
    def _count_technical_terms(self, text: str) -> int:
        """
        Count technical terms in text.
        
        Args:
            text: Text to analyze
        
        Returns:
            Number of technical terms found
        """
        text_lower = text.lower()
        count = 0
        for term in self.technical_terms:
            # Use word boundary matching for accuracy
            if re.search(r'\b' + re.escape(term) + r'\b', text_lower):
                count += 1
        return count
    
    def train(
        self,
        questions_data: List[Dict],
        test_size: float = 0.2
    ) -> Dict:
        """
        Train the difficulty predictor model.
        
        Args:
            questions_data: List of dicts with 'question', 'options', 'difficulty'
            test_size: Proportion to use for validation
        
        Returns:
            Training metrics including accuracy
            
        Example:
            metrics = predictor.train([
                {
                    'question': 'What is 2+2?',
                    'options': ['3', '4', '5', '6'],
                    'difficulty': 'easy'
                },
                ...
            ])
        """
        if not self.classifier or not self.vectorizer:
            logger.error("Classifier not initialized")
            return {'error': 'Classifier not initialized'}
        
        try:
            logger.info(f"Training difficulty predictor with {len(questions_data)} samples")
            
            X_features = []
            y_labels = []
            
            for idx, item in enumerate(questions_data):
                try:
                    features = self.extract_features(
                        item.get('question', ''),
                        item.get('options', [])
                    )
                    X_features.append(list(features.values()))
                    y_labels.append(item.get('difficulty', 'medium'))
                except Exception as e:
                    logger.warning(f"Error processing sample {idx}: {e}")
                    continue
            
            if not X_features:
                logger.error("No valid training data")
                return {'error': 'No valid training data'}
            
            X = np.array(X_features)
            y = np.array(y_labels)
            
            # Train model
            self.classifier.fit(X, y)
            self.is_trained = True
            self.feature_names = list(self.extract_features("").keys())
            
            # Calculate accuracy
            train_accuracy = float(self.classifier.score(X, y))
            
            logger.info(f"Training complete. Accuracy: {train_accuracy:.2%}")
            
            return {
                'accuracy': train_accuracy,
                'samples_trained': len(X_features),
                'unique_difficulties': len(set(y)),
                'features_count': len(X_features[0]) if X_features else 0
            }
        
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return {'error': str(e)}
    
    def predict(
        self,
        question_text: str,
        options: Optional[List[str]] = None
    ) -> Tuple[str, float, Dict[str, float]]:
        """
        Predict difficulty of a question.
        
        Args:
            question_text: The question text
            options: Answer options for the question
        
        Returns:
            Tuple of (difficulty, confidence, probabilities_dict)
            - difficulty: Predicted difficulty level (easy, medium, hard, expert)
            - confidence: Confidence score (0-1)
            - probabilities_dict: Probability for each difficulty level
        
        Example:
            difficulty, confidence, probs = predictor.predict(
                "Design a distributed cache system",
                ["Option A", "Option B", "Option C", "Option D"]
            )
            # Output: ("hard", 0.87, {"easy": 0.05, "medium": 0.08, "hard": 0.87, "expert": 0.0})
        """
        if not self.is_trained:
            logger.warning("Model not trained, returning default probabilities")
            return "medium", 0.5, {
                "easy": 0.25,
                "medium": 0.5,
                "hard": 0.15,
                "expert": 0.1
            }
        
        try:
            features = self.extract_features(question_text, options or [])
            X = np.array([list(features.values())])
            
            # Predict
            predicted_difficulty = self.classifier.predict(X)[0]
            probabilities = self.classifier.predict_proba(X)[0]
            
            # Get class labels
            classes = self.classifier.classes_
            prob_dict = {
                str(classes[i]): float(probabilities[i])
                for i in range(len(classes))
            }
            
            confidence = float(max(probabilities))
            
            logger.debug(f"Predicted difficulty: {predicted_difficulty} (confidence: {confidence:.2%})")
            
            return str(predicted_difficulty), confidence, prob_dict
        
        except Exception as e:
            logger.error(f"Prediction failed: {e}")
            return "medium", 0.0, {}
    
    def save_model(self, path: str) -> bool:
        """
        Save trained model to disk.
        
        Args:
            path: File path to save model
        
        Returns:
            True if successful
        """
        if not joblib:
            logger.error("joblib not installed")
            return False
        
        try:
            joblib.dump({
                'classifier': self.classifier,
                'vectorizer': self.vectorizer,
                'is_trained': self.is_trained,
                'technical_terms': self.technical_terms,
                'feature_names': self.feature_names
            }, path)
            logger.info(f"Model saved to {path}")
            return True
        except Exception as e:
            logger.error(f"Failed to save model: {e}")
            return False
    
    def load_model(self, path: str) -> bool:
        """
        Load trained model from disk.
        
        Args:
            path: File path to load model from
        
        Returns:
            True if successful
        """
        if not joblib:
            logger.error("joblib not installed")
            return False
        
        try:
            data = joblib.load(path)
            self.classifier = data.get('classifier')
            self.vectorizer = data.get('vectorizer')
            self.is_trained = data.get('is_trained', False)
            self.technical_terms = data.get('technical_terms', self._load_technical_terms())
            self.feature_names = data.get('feature_names', [])
            logger.info(f"Model loaded from {path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False


__all__ = ["DifficultyPredictor"]
