#!/usr/bin/env python3
"""
Training Data Preparation Pipeline
Prepares collected quiz and hackathon data for AI model training
Includes data cleaning, augmentation, formatting, and export utilities
"""

import os
import json
import asyncio
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from typing import List, Dict, Any, Tuple
from datetime import datetime
import random
import re
from collections import Counter, defaultdict

logger = logging.getLogger(__name__)

class TrainingDataPreparer:
    def __init__(self):
        # Database configuration
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_NAME', 'edtech_platform'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'password'),
            'port': os.getenv('DB_PORT', 5432)
        }
        
        # Training data parameters
        self.train_split = 0.8
        self.validation_split = 0.1
        self.test_split = 0.1
        
        # Data augmentation techniques
        self.augmentation_methods = [
            'paraphrase_questions',
            'generate_variations',
            'add_distractors',
            'create_difficulty_variations'
        ]
        
        # Export formats
        self.export_formats = ['jsonl', 'parquet', 'csv', 'tfrecord']

    def get_db_connection(self):
        """Get database connection"""
        return psycopg2.connect(**self.db_config)

    def load_quiz_data(self) -> pd.DataFrame:
        """Load quiz questions from database"""
        conn = self.get_db_connection()
        
        query = """
            SELECT 
                id, question_text, question_type, topic, category, difficulty_level,
                correct_answer, wrong_answers, explanation, tags, source,
                language, estimated_time_seconds, training_weight, validation_split,
                created_at, is_active
            FROM quiz_questions
            WHERE is_active = true
            ORDER BY created_at DESC
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        logger.info(f"Loaded {len(df)} quiz questions")
        return df

    def load_hackathon_data(self) -> pd.DataFrame:
        """Load hackathon questions from database"""
        conn = self.get_db_connection()
        
        query = """
            SELECT 
                id, title, description, problem_statement, category, difficulty_level,
                tech_stack, requirements, evaluation_criteria, estimated_hours,
                max_team_size, sample_solution, test_cases, resources, tags,
                source, language, training_weight, validation_split,
                created_at, is_active
            FROM hackathon_questions
            WHERE is_active = true
            ORDER BY created_at DESC
        """
        
        df = pd.read_sql_query(query, conn)
        conn.close()
        
        logger.info(f"Loaded {len(df)} hackathon questions")
        return df

    def clean_data(self, df: pd.DataFrame, data_type: str) -> pd.DataFrame:
        """Clean and preprocess data"""
        logger.info(f"Cleaning {data_type} data...")
        
        # Remove duplicates based on question text
        if data_type == 'quiz':
            df = df.drop_duplicates(subset=['question_text'], keep='first')
        else:
            df = df.drop_duplicates(subset=['title', 'description'], keep='first')
        
        # Clean text fields
        text_columns = ['question_text', 'explanation'] if data_type == 'quiz' else ['title', 'description', 'problem_statement']
        
        for col in text_columns:
            if col in df.columns:
                df[col] = df[col].str.strip()
                df[col] = df[col].str.replace(r'\s+', ' ', regex=True)  # Remove extra whitespace
                df[col] = df[col].str.replace(r'[^\w\s\?\!\.\,\:\;\(\)\-\'\"\/]', '', regex=True)  # Remove special chars
        
        # Standardize categories and topics
        df['category'] = df['category'].str.lower().str.replace(' ', '_')
        if 'topic' in df.columns:
            df['topic'] = df['topic'].str.lower().str.replace(' ', '_')
        
        # Parse JSON fields
        json_columns = ['tags', 'wrong_answers'] if data_type == 'quiz' else ['tech_stack', 'requirements', 'evaluation_criteria', 'test_cases', 'resources', 'tags']
        
        for col in json_columns:
            if col in df.columns:
                df[col] = df[col].apply(self.safe_json_parse)
        
        # Validate required fields
        required_fields = ['question_text', 'category', 'difficulty_level'] if data_type == 'quiz' else ['title', 'description', 'category', 'difficulty_level']
        
        for field in required_fields:
            df = df[df[field].notna() & (df[field] != '')]
        
        logger.info(f"Cleaned data: {len(df)} records remaining")
        return df

    def safe_json_parse(self, value):
        """Safely parse JSON strings"""
        if pd.isna(value) or value is None:
            return []
        try:
            if isinstance(value, str):
                return json.loads(value)
            return value
        except:
            return []

    def balance_dataset(self, df: pd.DataFrame, column: str) -> pd.DataFrame:
        """Balance dataset by specified column"""
        logger.info(f"Balancing dataset by {column}")
        
        # Count samples per class
        class_counts = df[column].value_counts()
        min_samples = class_counts.min()
        
        # Sample equal number from each class
        balanced_dfs = []
        for class_value in class_counts.index:
            class_df = df[df[column] == class_value]
            if len(class_df) > min_samples:
                class_df = class_df.sample(n=min_samples, random_state=42)
            balanced_dfs.append(class_df)
        
        balanced_df = pd.concat(balanced_dfs, ignore_index=True)
        logger.info(f"Balanced dataset: {len(balanced_df)} records")
        
        return balanced_df

    def augment_quiz_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Augment quiz data with variations"""
        logger.info("Augmenting quiz data...")
        
        augmented_rows = []
        
        for _, row in df.iterrows():
            # Original row
            augmented_rows.append(row.to_dict())
            
            # Create variations for high-value questions
            if row['training_weight'] > 0.8:
                # Paraphrase question (simulate variation)
                paraphrased = row.copy()
                paraphrased['question_text'] = self.paraphrase_question(row['question_text'])
                paraphrased['source'] = f"{row['source']}_paraphrased"
                paraphrased['training_weight'] = row['training_weight'] * 0.8
                augmented_rows.append(paraphrased.to_dict())
                
                # Create difficulty variation
                if row['difficulty_level'] == 'intermediate':
                    # Create easier version
                    easier = row.copy()
                    easier['difficulty_level'] = 'beginner'
                    easier['estimated_time_seconds'] = int(row['estimated_time_seconds'] * 0.7)
                    easier['source'] = f"{row['source']}_easier"
                    easier['training_weight'] = row['training_weight'] * 0.7
                    augmented_rows.append(easier.to_dict())
                    
                    # Create harder version
                    harder = row.copy()
                    harder['difficulty_level'] = 'advanced'
                    harder['estimated_time_seconds'] = int(row['estimated_time_seconds'] * 1.5)
                    harder['source'] = f"{row['source']}_harder"
                    harder['training_weight'] = row['training_weight'] * 0.9
                    augmented_rows.append(harder.to_dict())
        
        augmented_df = pd.DataFrame(augmented_rows)
        logger.info(f"Augmented quiz data: {len(augmented_df)} records (from {len(df)})")
        
        return augmented_df

    def paraphrase_question(self, question_text: str) -> str:
        """Simple paraphrasing by replacing common words"""
        replacements = {
            'What is': 'What does',
            'How do': 'How can',
            'Which of': 'Which among',
            'function': 'method',
            'algorithm': 'technique',
            'implement': 'create',
            'find': 'determine',
            'calculate': 'compute'
        }
        
        paraphrased = question_text
        for original, replacement in replacements.items():
            if original in paraphrased:
                paraphrased = paraphrased.replace(original, replacement)
                break
        
        return paraphrased

    def augment_hackathon_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Augment hackathon data with variations"""
        logger.info("Augmenting hackathon data...")
        
        augmented_rows = []
        
        for _, row in df.iterrows():
            # Original row
            augmented_rows.append(row.to_dict())
            
            # Create team size variations
            if row['max_team_size'] == 4:
                # Solo version
                solo = row.copy()
                solo['max_team_size'] = 1
                solo['estimated_hours'] = int(row['estimated_hours'] * 1.5)
                solo['title'] = f"Solo: {row['title']}"
                solo['source'] = f"{row['source']}_solo"
                augmented_rows.append(solo.to_dict())
                
                # Large team version
                team = row.copy()
                team['max_team_size'] = 6
                team['estimated_hours'] = int(row['estimated_hours'] * 0.8)
                team['title'] = f"Team Challenge: {row['title']}"
                team['source'] = f"{row['source']}_team"
                augmented_rows.append(team.to_dict())
        
        augmented_df = pd.DataFrame(augmented_rows)
        logger.info(f"Augmented hackathon data: {len(augmented_df)} records (from {len(df)})")
        
        return augmented_df

    def create_training_splits(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Create training, validation, and test splits"""
        logger.info("Creating training splits...")
        
        # Use existing validation_split column if available
        if 'validation_split' in df.columns:
            train_df = df[df['validation_split'] == 'train'].copy()
            val_df = df[df['validation_split'] == 'validation'].copy()
            test_df = df[df['validation_split'] == 'test'].copy()
        else:
            # Create new splits
            train_df, temp_df = train_test_split(
                df, test_size=(self.validation_split + self.test_split), 
                random_state=42, stratify=df['category']
            )
            
            val_df, test_df = train_test_split(
                temp_df, test_size=(self.test_split / (self.validation_split + self.test_split)),
                random_state=42, stratify=temp_df['category']
            )
        
        logger.info(f"Training splits - Train: {len(train_df)}, Validation: {len(val_df)}, Test: {len(test_df)}")
        
        return train_df, val_df, test_df

    def format_for_training(self, df: pd.DataFrame, data_type: str) -> List[Dict[str, Any]]:
        """Format data for AI model training"""
        formatted_data = []
        
        for _, row in df.iterrows():
            if data_type == 'quiz':
                formatted_row = {
                    'input': {
                        'question': row['question_text'],
                        'type': row['question_type'],
                        'topic': row['topic'],
                        'category': row['category'],
                        'difficulty': row['difficulty_level']
                    },
                    'output': {
                        'answer': row['correct_answer'],
                        'explanation': row.get('explanation', ''),
                        'options': row.get('wrong_answers', [])
                    },
                    'metadata': {
                        'source': row['source'],
                        'tags': row.get('tags', []),
                        'estimated_time': row['estimated_time_seconds'],
                        'weight': row['training_weight']
                    }
                }
            else:  # hackathon
                formatted_row = {
                    'input': {
                        'title': row['title'],
                        'description': row['description'],
                        'problem': row['problem_statement'],
                        'category': row['category'],
                        'difficulty': row['difficulty_level']
                    },
                    'output': {
                        'tech_stack': row.get('tech_stack', []),
                        'requirements': row.get('requirements', []),
                        'solution_approach': row.get('sample_solution', ''),
                        'evaluation': row.get('evaluation_criteria', {})
                    },
                    'metadata': {
                        'source': row['source'],
                        'tags': row.get('tags', []),
                        'estimated_hours': row['estimated_hours'],
                        'team_size': row['max_team_size'],
                        'weight': row['training_weight']
                    }
                }
            
            formatted_data.append(formatted_row)
        
        return formatted_data

    def export_training_data(self, train_data: List[Dict], val_data: List[Dict], test_data: List[Dict], 
                           export_dir: str, dataset_name: str, data_type: str):
        """Export training data in multiple formats"""
        logger.info(f"Exporting {data_type} training data...")
        
        # Create export directory
        os.makedirs(export_dir, exist_ok=True)
        
        # Export as JSONL (for transformers)
        for split_name, split_data in [('train', train_data), ('validation', val_data), ('test', test_data)]:
            jsonl_path = os.path.join(export_dir, f"{dataset_name}_{data_type}_{split_name}.jsonl")
            with open(jsonl_path, 'w', encoding='utf-8') as f:
                for item in split_data:
                    f.write(json.dumps(item, ensure_ascii=False) + '\n')
        
        # Export as Parquet (for efficient storage)
        for split_name, split_data in [('train', train_data), ('validation', val_data), ('test', test_data)]:
            df = pd.json_normalize(split_data)
            parquet_path = os.path.join(export_dir, f"{dataset_name}_{data_type}_{split_name}.parquet")
            df.to_parquet(parquet_path, index=False)
        
        # Export metadata
        metadata = {
            'dataset_name': dataset_name,
            'data_type': data_type,
            'created_at': datetime.now().isoformat(),
            'splits': {
                'train': len(train_data),
                'validation': len(val_data),
                'test': len(test_data),
                'total': len(train_data) + len(val_data) + len(test_data)
            },
            'schema': {
                'input_fields': list(train_data[0]['input'].keys()) if train_data else [],
                'output_fields': list(train_data[0]['output'].keys()) if train_data else [],
                'metadata_fields': list(train_data[0]['metadata'].keys()) if train_data else []
            }
        }
        
        metadata_path = os.path.join(export_dir, f"{dataset_name}_{data_type}_metadata.json")
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Exported {data_type} data to {export_dir}")

    def generate_dataset_statistics(self, df: pd.DataFrame, data_type: str) -> Dict[str, Any]:
        """Generate comprehensive dataset statistics"""
        stats = {
            'total_records': len(df),
            'data_type': data_type,
            'categories': df['category'].value_counts().to_dict(),
            'difficulty_levels': df['difficulty_level'].value_counts().to_dict(),
            'sources': df['source'].value_counts().to_dict(),
            'validation_splits': df['validation_split'].value_counts().to_dict() if 'validation_split' in df.columns else {},
        }
        
        if data_type == 'quiz':
            stats['question_types'] = df['question_type'].value_counts().to_dict()
            stats['topics'] = df['topic'].value_counts().to_dict()
            stats['avg_estimated_time'] = df['estimated_time_seconds'].mean()
        else:
            stats['avg_estimated_hours'] = df['estimated_hours'].mean()
            stats['avg_team_size'] = df['max_team_size'].mean()
        
        return stats

    async def process_all_training_data(self):
        """Process all training data end-to-end"""
        logger.info("Starting comprehensive training data processing...")
        
        results = {}
        export_dir = "../data/processed_training_data"
        dataset_name = f"edtech_training_{datetime.now().strftime('%Y%m%d')}"
        
        # Process quiz data
        logger.info("Processing quiz data...")
        quiz_df = self.load_quiz_data()
        
        if not quiz_df.empty:
            quiz_df = self.clean_data(quiz_df, 'quiz')
            quiz_df = self.augment_quiz_data(quiz_df)
            quiz_df = self.balance_dataset(quiz_df, 'category')
            
            train_quiz, val_quiz, test_quiz = self.create_training_splits(quiz_df)
            
            # Format for training
            train_quiz_formatted = self.format_for_training(train_quiz, 'quiz')
            val_quiz_formatted = self.format_for_training(val_quiz, 'quiz')
            test_quiz_formatted = self.format_for_training(test_quiz, 'quiz')
            
            # Export
            self.export_training_data(train_quiz_formatted, val_quiz_formatted, test_quiz_formatted,
                                    export_dir, dataset_name, 'quiz')
            
            results['quiz'] = self.generate_dataset_statistics(quiz_df, 'quiz')
        
        # Process hackathon data
        logger.info("Processing hackathon data...")
        hackathon_df = self.load_hackathon_data()
        
        if not hackathon_df.empty:
            hackathon_df = self.clean_data(hackathon_df, 'hackathon')
            hackathon_df = self.augment_hackathon_data(hackathon_df)
            hackathon_df = self.balance_dataset(hackathon_df, 'category')
            
            train_hack, val_hack, test_hack = self.create_training_splits(hackathon_df)
            
            # Format for training
            train_hack_formatted = self.format_for_training(train_hack, 'hackathon')
            val_hack_formatted = self.format_for_training(val_hack, 'hackathon')
            test_hack_formatted = self.format_for_training(test_hack, 'hackathon')
            
            # Export
            self.export_training_data(train_hack_formatted, val_hack_formatted, test_hack_formatted,
                                    export_dir, dataset_name, 'hackathon')
            
            results['hackathon'] = self.generate_dataset_statistics(hackathon_df, 'hackathon')
        
        # Generate combined statistics
        total_records = results.get('quiz', {}).get('total_records', 0) + results.get('hackathon', {}).get('total_records', 0)
        
        logger.info(f"Training data processing completed!")
        logger.info(f"Total processed records: {total_records}")
        logger.info(f"Quiz records: {results.get('quiz', {}).get('total_records', 0)}")
        logger.info(f"Hackathon records: {results.get('hackathon', {}).get('total_records', 0)}")
        logger.info(f"Export directory: {export_dir}")
        
        return {
            'dataset_name': dataset_name,
            'export_directory': export_dir,
            'statistics': results,
            'total_records': total_records,
            'processing_completed_at': datetime.now().isoformat()
        }

async def main():
    """Main execution function"""
    preparer = TrainingDataPreparer()
    results = await preparer.process_all_training_data()
    
    # Save processing results
    results_path = "../data/processing_results.json"
    os.makedirs(os.path.dirname(results_path), exist_ok=True)
    with open(results_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    logger.info(f"Processing results saved to {results_path}")

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    asyncio.run(main())
