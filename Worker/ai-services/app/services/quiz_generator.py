"""
AI-powered quiz question generator using local models.
"""

import os
import json
import re
import logging
from typing import List, Dict, Optional

try:
    from transformers import T5ForConditionalGeneration, T5Tokenizer
    import torch
except ImportError:
    torch = None
    T5Tokenizer = None
    T5ForConditionalGeneration = None

logger = logging.getLogger(__name__)


class QuizQuestionGenerator:
    """
    AI-powered quiz question generator using local models.
    
    Example:
        generator = QuizQuestionGenerator()
        questions = generator.generate_questions("Python", "medium", num_questions=5)
    """
    
    def __init__(self, use_cloud_llm: bool = False):
        """
        Initialize the quiz question generator.
        
        Args:
            use_cloud_llm: Deprecated. Cloud LLMs are disabled; local generation is always used.
        """
        self.use_cloud_llm = False
        
        # Initialize local T5 model
        self.model_name = "google/flan-t5-large"
        self.tokenizer = None
        self.model = None
        self.device = None
        
        self._load_local_model()
    
    def _load_local_model(self) -> None:
        """Load local T5 model for question generation."""
        if not T5Tokenizer or not T5ForConditionalGeneration:
            logger.error("Transformers library not installed. Install with: pip install transformers torch")
            return
        
        try:
            logger.info(f"Loading T5 model: {self.model_name}")
            
            # Check for GPU availability
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Using device: {self.device}")
            
            self.tokenizer = T5Tokenizer.from_pretrained(self.model_name)
            self.model = T5ForConditionalGeneration.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("✓ T5 model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load T5 model: {e}")
            self.model = None
            self.tokenizer = None
    
    def generate_questions(
        self,
        topic: str,
        difficulty: str,
        num_questions: int = 10,
        context: Optional[str] = None,
        question_type: str = "multiple_choice"
    ) -> List[Dict]:
        """
        Generate quiz questions on a given topic.
        
        Args:
            topic: Topic for quiz questions
            difficulty: Question difficulty (easy, medium, hard, expert)
            num_questions: Number of questions to generate (1-50)
            context: Optional additional context/reading material
            question_type: Type of questions (multiple_choice, true_false, short_answer)
        
        Returns:
            List of generated question dictionaries
        """
        num_questions = max(1, min(50, num_questions))
        
        return self._generate_with_t5(topic, difficulty, num_questions, context, question_type)
    
    def _generate_with_gemini(
        self,
        topic: str,
        difficulty: str,
        num_questions: int,
        context: Optional[str],
        question_type: str
    ) -> List[Dict]:
        """
        Generate questions using Google Gemini API.
        
        Args:
            topic: Topic for questions
            difficulty: Difficulty level
            num_questions: Number of questions
            context: Optional context
            question_type: Type of questions
        
        Returns:
            List of generated questions
        """
        prompt = self._build_gemini_prompt(topic, difficulty, num_questions, context, question_type)
        
        try:
            logger.info(f"Generating {num_questions} {difficulty} questions on '{topic}' with Gemini")
            
            response = self.gemini_model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=4000,
                )
            )
            
            content = response.text
            questions = self._parse_gemini_response(content)
            
            logger.info(f"Successfully generated {len(questions)} questions with Gemini")
            return questions
            
        except Exception as e:
            logger.error(f"Gemini generation failed: {e}")
            # Fallback to T5
            logger.info("Falling back to T5 model")
            return self._generate_with_t5(topic, difficulty, num_questions, context, question_type)
    
    def _build_gemini_prompt(
        self,
        topic: str,
        difficulty: str,
        num_questions: int,
        context: Optional[str],
        question_type: str
    ) -> str:
        """Build prompt for Google Gemini based on question type."""
        
        if question_type == "true_false":
            prompt = f"""Generate {num_questions} {difficulty} level true/false quiz questions on: {topic}

Requirements:
- Each question should be a clear statement that is either TRUE or FALSE
- Questions should test understanding, not just memorization
- Include detailed explanations for the correct answer
- Difficulty level: {difficulty}
{f'- Use this context: {context}' if context else ''}

Return ONLY a valid JSON array (no markdown, no extra text):
[
  {{
    "question": "Statement to evaluate as true or false?",
    "correct_answer": true,
    "explanation": "Why this statement is true/false",
    "difficulty": "{difficulty}",
    "topic": "{topic}",
    "estimated_time": 45
  }}
]

Generate all {num_questions} questions now:"""
        
        else:  # multiple_choice (default)
            prompt = f"""Generate {num_questions} {difficulty} level multiple-choice quiz questions on: {topic}

Requirements:
- Each question should have 4 options (A, B, C, D)
- Only ONE option should be correct
- Include detailed explanations for the correct answer
- Make distractors (wrong answers) plausible but clearly incorrect
- Questions should test understanding, not just memorization
- Difficulty level: {difficulty}
{f'- Use this context: {context}' if context else ''}

Return ONLY a valid JSON array with this exact structure (no markdown, no extra text):
[
  {{
    "question": "Question text here?",
    "options": {{
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    }},
    "correct_answer": "B",
    "explanation": "Detailed explanation of why B is correct and others are wrong",
    "difficulty": "{difficulty}",
    "topic": "{topic}",
    "estimated_time": 60,
    "tags": ["tag1", "tag2"]
  }}
]

Generate all {num_questions} questions now:"""
        
        return prompt
    
    def _parse_gemini_response(self, content: str) -> List[Dict]:
        """
        Parse Gemini's JSON response.
        
        Args:
            content: Response content from Gemini
        
        Returns:
            List of parsed questions
        """
        try:
            # Find JSON array in response
            json_match = re.search(r'\[.*\]', content, re.DOTALL)
            if json_match:
                questions = json.loads(json_match.group())
                logger.info(f"Parsed {len(questions)} questions from Gemini response")
                return questions
            else:
                logger.warning("No JSON array found in Gemini response")
                return []
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response as JSON: {e}")
            logger.debug(f"Response content: {content[:500]}")
            return []
    
    def _generate_with_t5(
        self,
        topic: str,
        difficulty: str,
        num_questions: int,
        context: Optional[str],
        question_type: str
    ) -> List[Dict]:
        """
        Generate questions using local T5 model.
        
        Args:
            topic: Topic for questions
            difficulty: Difficulty level
            num_questions: Number of questions
            context: Optional context
            question_type: Type of questions
        
        Returns:
            List of generated questions
        """
        if not self.model or not self.tokenizer:
            self._load_local_model()
            if not self.model:
                logger.error("T5 model could not be loaded")
                return []
        
        logger.info(f"Generating {num_questions} {difficulty} questions on '{topic}' with T5")
        questions = []
        
        for i in range(num_questions):
            prompt = f"Generate a {difficulty} level {question_type} question about {topic}"
            if context:
                prompt += f" based on: {context[:200]}"
            
            try:
                inputs = self.tokenizer(
                    prompt,
                    return_tensors="pt",
                    max_length=512,
                    truncation=True
                ).to(self.device)
                
                with torch.no_grad():
                    outputs = self.model.generate(
                        inputs.input_ids,
                        max_length=300,
                        num_beams=5,
                        temperature=0.8,
                        top_p=0.9,
                        do_sample=True
                    )
                
                generated_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                question = self._structure_t5_output(generated_text, topic, difficulty, i + 1, question_type)
                questions.append(question)
                
            except Exception as e:
                logger.error(f"Error generating question {i+1} with T5: {e}")
                continue
        
        logger.info(f"Generated {len(questions)} questions with T5")
        return questions
    
    def _structure_t5_output(
        self,
        text: str,
        topic: str,
        difficulty: str,
        question_num: int,
        question_type: str
    ) -> Dict:
        """
        Structure T5 output into proper question format.
        
        Args:
            text: Generated text from T5
            topic: Question topic
            difficulty: Difficulty level
            question_num: Question number
            question_type: Type of question
        
        Returns:
            Structured question dictionary
        """
        
        if question_type == "true_false":
            return {
                "question": f"{text[:200]}",
                "correct_answer": True,
                "explanation": "Generated with local T5 model",
                "difficulty": difficulty,
                "topic": topic,
                "estimated_time": 45,
                "tags": [topic.lower()]
            }
        
        else:  # multiple_choice
            return {
                "question": f"{text[:200]}?",
                "options": {
                    "A": "First generated option",
                    "B": "Second generated option",
                    "C": "Third generated option",
                    "D": "Fourth generated option"
                },
                "correct_answer": "A",
                "explanation": "Generated with local T5 model - manual review recommended",
                "difficulty": difficulty,
                "topic": topic,
                "estimated_time": 60,
                "tags": [topic.lower()]
            }
    
    def generate_single_question(
        self,
        topic: str,
        difficulty: str,
        context: Optional[str] = None,
        question_type: str = "multiple_choice"
    ) -> Dict:
        """
        Generate a single quiz question.
        
        Args:
            topic: Question topic
            difficulty: Difficulty level
            context: Optional context
            question_type: Type of question
        
        Returns:
            Single generated question
        """
        questions = self.generate_questions(topic, difficulty, 1, context, question_type)
        return questions[0] if questions else {}
    
    def batch_generate(
        self,
        topics: List[str],
        difficulty: str,
        questions_per_topic: int = 3
    ) -> Dict[str, List[Dict]]:
        """
        Generate questions for multiple topics at once.
        
        Args:
            topics: List of topics
            difficulty: Difficulty level for all
            questions_per_topic: Questions per topic
        
        Returns:
            Dictionary mapping topic to questions
        """
        logger.info(f"Batch generating {questions_per_topic} questions for {len(topics)} topics")
        results = {}
        
        for topic in topics:
            try:
                questions = self.generate_questions(topic, difficulty, questions_per_topic)
                results[topic] = questions
            except Exception as e:
                logger.error(f"Error generating questions for topic '{topic}': {e}")
                results[topic] = []
        
        return results


# Export the generator
__all__ = ["QuizQuestionGenerator"]
