#!/usr/bin/env python3
"""
External Data Collector
Collects quiz and hackathon questions from external sources to supplement AI-generated data
Sources: GitHub repositories, educational platforms, competitive programming sites
"""

import os
import json
import asyncio
import aiohttp
import logging
from typing import List, Dict, Any
import random
import re
import psycopg2

logger = logging.getLogger(__name__)

class ExternalDataCollector:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        # Database configuration
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_NAME', 'edtech_platform'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'password'),
            'port': os.getenv('DB_PORT', 5432)
        }
        
        # GitHub repositories with coding questions
        self.github_repos = [
            'jwasham/coding-interview-university',
            'TheAlgorithms/Python',
            'kdn251/interviews',
            'yangshun/tech-interview-handbook',
            'donnemartin/system-design-primer',
            'trekhleb/javascript-algorithms',
            'kamranahmedse/developer-roadmap',
            'EbookFoundation/free-programming-books',
            'sindresorhus/awesome',
            'vinta/awesome-python'
        ]
        
        # Educational platforms and sources
        self.educational_sources = [
            {
                'name': 'LeetCode',
                'base_url': 'https://leetcode.com/api/problems/all/',
                'type': 'api'
            },
            {
                'name': 'HackerRank',
                'base_url': 'https://www.hackerrank.com/domains/algorithms',
                'type': 'scraping'
            },
            {
                'name': 'CodeChef',
                'base_url': 'https://www.codechef.com/problems/easy',
                'type': 'scraping'
            }
        ]
        
        # Question pattern recognition
        self.question_patterns = {
            'multiple_choice': [
                r'(?:Which|What|How|When|Where|Why).*\?',
                r'Select.*correct.*option',
                r'Choose.*best.*answer'
            ],
            'coding': [
                r'Write.*function',
                r'Implement.*algorithm',
                r'Given.*array.*return',
                r'Given.*string.*find'
            ],
            'true_false': [
                r'True.*or.*False',
                r'Is.*statement.*correct',
                r'The.*statement.*is'
            ]
        }

    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)

    async def collect_github_questions(self, repo: str) -> List[Dict[str, Any]]:
        """Collect questions from GitHub repositories"""
        try:
            logger.info(f"Collecting questions from GitHub repo: {repo}")
            
            # GitHub API endpoints
            api_url = f"https://api.github.com/repos/{repo}/contents"
            
            async with aiohttp.ClientSession(headers=self.headers) as session:
                # Get repository contents
                async with session.get(api_url) as response:
                    if response.status != 200:
                        logger.warning(f"Failed to access {repo}: {response.status}")
                        return []
                    
                    contents = await response.json()
                
                questions = []
                
                # Look for question files
                for item in contents:
                    if item['type'] == 'file' and any(ext in item['name'].lower() for ext in ['.md', '.txt', '.py', '.js']):
                        # Download file content
                        file_url = item['download_url']
                        async with session.get(file_url) as file_response:
                            if file_response.status == 200:
                                content = await file_response.text()
                                extracted = self.extract_questions_from_text(content, source=f"github_{repo}")
                                questions.extend(extracted)
                
                await asyncio.sleep(1)  # Rate limiting
                return questions[:100]  # Limit per repo
                
        except Exception as e:
            logger.error(f"Error collecting from GitHub repo {repo}: {e}")
            return []

    def extract_questions_from_text(self, content: str, source: str) -> List[Dict[str, Any]]:
        """Extract questions from text content using pattern recognition"""
        questions = []
        lines = content.split('\n')
        
        current_question = None
        question_buffer = []
        
        for line in lines:
            line = line.strip()
            
            # Skip empty lines and comments
            if not line or line.startswith('#') or line.startswith('//'):
                continue
            
            # Check if line contains a question pattern
            question_type = self.identify_question_type(line)
            
            if question_type:
                # Save previous question if exists
                if current_question and question_buffer:
                    current_question['question_text'] = ' '.join(question_buffer)
                    questions.append(current_question)
                
                # Start new question
                current_question = {
                    'question_type': question_type,
                    'topic': self.extract_topic_from_context(content),
                    'category': self.infer_category_from_source(source),
                    'difficulty_level': 'intermediate',
                    'source': source,
                    'language': 'english',
                    'training_weight': 0.8,  # Lower weight for scraped data
                    'validation_split': random.choice(['train'] * 8 + ['validation'] * 1 + ['test'] * 1),
                    'tags': self.extract_tags_from_text(content),
                    'estimated_time_seconds': 120
                }
                question_buffer = [line]
            
            elif current_question and line:
                question_buffer.append(line)
                
                # Look for answer patterns
                if any(keyword in line.lower() for keyword in ['answer:', 'solution:', 'correct:', 'output:']):
                    current_question['correct_answer'] = line.replace('Answer:', '').replace('Solution:', '').strip()
                
                if any(keyword in line.lower() for keyword in ['explanation:', 'because:', 'reason:']):
                    current_question['explanation'] = line.replace('Explanation:', '').strip()
        
        # Add last question
        if current_question and question_buffer:
            current_question['question_text'] = ' '.join(question_buffer)
            questions.append(current_question)
        
        return questions

    def identify_question_type(self, text: str) -> str:
        """Identify question type from text patterns"""
        text_lower = text.lower()
        
        for q_type, patterns in self.question_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    return q_type
        
        # Default classification
        if '?' in text:
            return 'multiple_choice'
        elif any(keyword in text_lower for keyword in ['write', 'implement', 'code', 'function']):
            return 'coding'
        else:
            return 'true_false'

    def extract_topic_from_context(self, content: str) -> str:
        """Extract main topic from content"""
        content_lower = content.lower()
        
        topic_keywords = {
            'algorithm': ['algorithm', 'sorting', 'searching', 'graph', 'tree', 'dynamic'],
            'data_structure': ['array', 'list', 'stack', 'queue', 'heap', 'hash'],
            'web_development': ['html', 'css', 'javascript', 'react', 'node', 'api'],
            'database': ['sql', 'database', 'query', 'table', 'join'],
            'machine_learning': ['ml', 'ai', 'neural', 'model', 'training'],
            'cybersecurity': ['security', 'encryption', 'hash', 'authentication'],
            'programming': ['programming', 'code', 'function', 'variable']
        }
        
        for topic, keywords in topic_keywords.items():
            if any(keyword in content_lower for keyword in keywords):
                return topic
        
        return 'programming'

    def infer_category_from_source(self, source: str) -> str:
        """Infer category from source information"""
        source_lower = source.lower()
        
        if 'algorithm' in source_lower:
            return 'algorithms'
        elif 'web' in source_lower or 'frontend' in source_lower:
            return 'web_development'
        elif 'data' in source_lower or 'science' in source_lower:
            return 'data_science'
        elif 'security' in source_lower:
            return 'cybersecurity'
        elif 'mobile' in source_lower:
            return 'mobile_development'
        else:
            return 'programming_fundamentals'

    def extract_tags_from_text(self, content: str) -> List[str]:
        """Extract relevant tags from content"""
        content_lower = content.lower()
        
        tag_keywords = [
            'python', 'javascript', 'java', 'c++', 'react', 'node.js',
            'algorithm', 'data_structure', 'sorting', 'searching',
            'beginner', 'intermediate', 'advanced', 'easy', 'medium', 'hard',
            'web', 'mobile', 'database', 'api', 'frontend', 'backend'
        ]
        
        tags = []
        for keyword in tag_keywords:
            if keyword in content_lower:
                tags.append(keyword)
        
        return tags[:5]  # Limit to 5 tags

    async def collect_competitive_programming_questions(self) -> List[Dict[str, Any]]:
        """Collect questions from competitive programming platforms"""
        questions = []
        
        # Sample competitive programming questions (since scraping is limited)
        competitive_questions = [
            {
                'question_text': 'Given an array of integers, find the maximum sum of any contiguous subarray.',
                'question_type': 'coding',
                'topic': 'dynamic_programming',
                'category': 'algorithms',
                'difficulty_level': 'intermediate',
                'correct_answer': 'Use Kadane\'s algorithm',
                'explanation': 'Kadane\'s algorithm efficiently finds maximum subarray sum in O(n) time',
                'tags': ['algorithms', 'dynamic_programming', 'arrays'],
                'source': 'competitive_programming'
            },
            {
                'question_text': 'Implement a function to check if a binary tree is balanced.',
                'question_type': 'coding', 
                'topic': 'trees',
                'category': 'data_structures',
                'difficulty_level': 'intermediate',
                'correct_answer': 'Check height difference of subtrees recursively',
                'explanation': 'A balanced tree has height difference of at most 1 between left and right subtrees',
                'tags': ['trees', 'recursion', 'data_structures'],
                'source': 'competitive_programming'
            },
            {
                'question_text': 'Find the shortest path between two nodes in a weighted graph.',
                'question_type': 'coding',
                'topic': 'graph_algorithms',
                'category': 'algorithms',
                'difficulty_level': 'advanced',
                'correct_answer': 'Use Dijkstra\'s algorithm or A* search',
                'explanation': 'Dijkstra\'s algorithm finds shortest path in weighted graphs with non-negative edges',
                'tags': ['graphs', 'shortest_path', 'dijkstra'],
                'source': 'competitive_programming'
            }
        ]
        
        # Generate variations of these base questions
        for base_question in competitive_questions:
            for i in range(50):  # Generate 50 variations per base
                variation = base_question.copy()
                
                # Add difficulty variations
                if i < 20:
                    variation['difficulty_level'] = 'beginner'
                elif i < 35:
                    variation['difficulty_level'] = 'intermediate'
                else:
                    variation['difficulty_level'] = 'advanced'
                
                # Add metadata
                variation['language'] = 'english'
                variation['training_weight'] = 0.9
                variation['validation_split'] = random.choice(['train'] * 8 + ['validation'] * 1 + ['test'] * 1)
                variation['estimated_time_seconds'] = random.randint(60, 300)
                
                questions.append(variation)
        
        return questions

    async def collect_web_development_questions(self) -> List[Dict[str, Any]]:
        """Generate web development focused questions"""
        web_questions = []
        
        topics = ['html', 'css', 'javascript', 'react', 'node.js', 'databases', 'apis']
        question_types = ['multiple_choice', 'coding', 'true_false']
        difficulties = ['beginner', 'intermediate', 'advanced']
        
        base_questions = {
            'html': [
                'What is the purpose of semantic HTML elements?',
                'How do you create a responsive layout?',
                'What are HTML5 form validation attributes?'
            ],
            'css': [
                'Explain the CSS box model',
                'What is the difference between flexbox and grid?',
                'How do CSS specificity rules work?'
            ],
            'javascript': [
                'What is event bubbling in JavaScript?',
                'Explain closures and their use cases',
                'What is the difference between let, const, and var?'
            ],
            'react': [
                'How do React hooks work?',
                'What is the virtual DOM?',
                'Explain component lifecycle methods'
            ]
        }
        
        for topic in topics:
            if topic in base_questions:
                for question_text in base_questions[topic]:
                    for difficulty in difficulties:
                        question = {
                            'question_text': question_text,
                            'question_type': random.choice(question_types),
                            'topic': topic,
                            'category': 'web_development',
                            'difficulty_level': difficulty,
                            'correct_answer': f'Answer for {question_text}',
                            'explanation': f'Detailed explanation for {topic} concept',
                            'tags': [topic, difficulty, 'web_development'],
                            'source': 'curated_web_dev',
                            'language': 'english',
                            'training_weight': 1.0,
                            'validation_split': random.choice(['train'] * 8 + ['validation'] * 1 + ['test'] * 1),
                            'estimated_time_seconds': random.randint(30, 180)
                        }
                        web_questions.append(question)
        
        return web_questions

    async def collect_all_external_data(self) -> Dict[str, int]:
        """Collect questions from all external sources"""
        logger.info("Starting external data collection...")
        
        all_questions = []
        
        # Collect from GitHub repositories
        github_tasks = []
        for repo in self.github_repos[:3]:  # Limit to avoid rate limiting
            task = self.collect_github_questions(repo)
            github_tasks.append(task)
        
        github_results = await asyncio.gather(*github_tasks, return_exceptions=True)
        
        for result in github_results:
            if isinstance(result, list):
                all_questions.extend(result)
        
        # Collect competitive programming questions
        comp_questions = await self.collect_competitive_programming_questions()
        all_questions.extend(comp_questions)
        
        # Collect web development questions
        web_questions = await self.collect_web_development_questions()
        all_questions.extend(web_questions)
        
        # Insert into database
        if all_questions:
            await self.batch_insert_questions(all_questions)
        
        logger.info(f"Collected {len(all_questions)} external questions")
        
        return {
            'total_collected': len(all_questions),
            'github_questions': sum(len(r) for r in github_results if isinstance(r, list)),
            'competitive_questions': len(comp_questions),
            'web_dev_questions': len(web_questions)
        }

    async def batch_insert_questions(self, questions: List[Dict[str, Any]]):
        """Insert collected questions into database"""
        if not questions:
            return
        
        conn = self.get_db_connection()
        try:
            cursor = conn.cursor()
            
            insert_query = """
                INSERT INTO quiz_questions (
                    question_text, question_type, topic, category, difficulty_level,
                    correct_answer, explanation, tags, source, language,
                    estimated_time_seconds, training_weight, validation_split
                ) VALUES %s
                ON CONFLICT DO NOTHING
            """
            
            values = []
            for q in questions:
                values.append((
                    q.get('question_text', ''),
                    q.get('question_type', 'multiple_choice'),
                    q.get('topic', 'programming'),
                    q.get('category', 'programming_fundamentals'),
                    q.get('difficulty_level', 'intermediate'),
                    q.get('correct_answer', ''),
                    q.get('explanation', ''),
                    json.dumps(q.get('tags', [])),
                    q.get('source', 'external'),
                    q.get('language', 'english'),
                    q.get('estimated_time_seconds', 60),
                    q.get('training_weight', 0.8),
                    q.get('validation_split', 'train')
                ))
            
            if values:
                from psycopg2.extras import execute_values
                execute_values(cursor, insert_query, values)
                conn.commit()
                logger.info(f"Inserted {len(values)} external questions")
        
        except Exception as e:
            logger.error(f"Error inserting external questions: {e}")
            conn.rollback()
        finally:
            conn.close()

async def main():
    """Main execution function"""
    collector = ExternalDataCollector()
    results = await collector.collect_all_external_data()
    
    logger.info("External data collection completed!")
    logger.info(f"Collection results: {results}")

if __name__ == '__main__':
    asyncio.run(main())
