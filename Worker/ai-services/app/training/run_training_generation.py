#!/usr/bin/env python3
"""
Master Training Data Generator
Orchestrates the complete process of generating 10,000+ quiz and hackathon questions
Combines AI generation, external collection, and data preparation for model training
"""

import os
import asyncio
import logging
import json
from datetime import datetime
import sys
import argparse

# Add the app directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from generate_training_data import TrainingDataGenerator
from collect_external_data import ExternalDataCollector  
from prepare_training_data import TrainingDataPreparer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('master_training_generation.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MasterTrainingDataGenerator:
    def __init__(self):
        self.ai_generator = TrainingDataGenerator()
        self.external_collector = ExternalDataCollector()
        self.data_preparer = TrainingDataPreparer()
        
        self.target_counts = {
            'total_target': 10000,
            'ai_generated_target': 7000,
            'external_collected_target': 3000,
            'quiz_questions': 8000,
            'hackathon_questions': 2000
        }

    async def run_complete_pipeline(self, skip_generation=False, skip_collection=False, skip_preparation=False):
        """Run the complete training data generation pipeline"""
        logger.info("=" * 80)
        logger.info("MASTER TRAINING DATA GENERATION PIPELINE")
        logger.info("=" * 80)
        logger.info(f"Target: {self.target_counts['total_target']:,} total questions")
        logger.info(f"AI Generated: {self.target_counts['ai_generated_target']:,}")
        logger.info(f"External Collection: {self.target_counts['external_collected_target']:,}")
        logger.info("=" * 80)
        
        start_time = datetime.now()
        results = {}
        
        # Phase 1: AI Generation
        if not skip_generation:
            logger.info("\n🤖 PHASE 1: AI-GENERATED QUESTIONS")
            logger.info("-" * 50)
            try:
                generation_results = await self.ai_generator.generate_all_questions()
                results['ai_generation'] = generation_results
                logger.info("✅ AI generation completed successfully")
            except Exception as e:
                logger.error(f"❌ AI generation failed: {e}")
                results['ai_generation'] = {'error': str(e)}
        
        # Phase 2: External Collection
        if not skip_collection:
            logger.info("\n🌐 PHASE 2: EXTERNAL DATA COLLECTION")
            logger.info("-" * 50)
            try:
                collection_results = await self.external_collector.collect_all_external_data()
                results['external_collection'] = collection_results
                logger.info("✅ External collection completed successfully")
            except Exception as e:
                logger.error(f"❌ External collection failed: {e}")
                results['external_collection'] = {'error': str(e)}
        
        # Phase 3: Data Preparation
        if not skip_preparation:
            logger.info("\n🔧 PHASE 3: TRAINING DATA PREPARATION")
            logger.info("-" * 50)
            try:
                preparation_results = await self.data_preparer.process_all_training_data()
                results['data_preparation'] = preparation_results
                logger.info("✅ Data preparation completed successfully")
            except Exception as e:
                logger.error(f"❌ Data preparation failed: {e}")
                results['data_preparation'] = {'error': str(e)}
        
        # Phase 4: Final Validation and Summary
        logger.info("\n📊 PHASE 4: FINAL VALIDATION & SUMMARY")
        logger.info("-" * 50)
        
        final_stats = await self.generate_final_summary()
        results['final_summary'] = final_stats
        
        end_time = datetime.now()
        total_duration = end_time - start_time
        
        # Generate comprehensive report
        report = self.generate_completion_report(results, total_duration)
        
        # Save results
        results_path = "../data/master_generation_results.json"
        os.makedirs(os.path.dirname(results_path), exist_ok=True)
        with open(results_path, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        
        logger.info(f"✅ Complete pipeline finished in {total_duration}")
        logger.info(f"📄 Full results saved to: {results_path}")
        
        return results, report

    async def generate_final_summary(self):
        """Generate final summary statistics"""
        try:
            conn = self.ai_generator.get_db_connection()
            cursor = conn.cursor()
            
            # Get quiz question counts
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_count,
                    COUNT(CASE WHEN source LIKE 'gemini%' THEN 1 END) as ai_generated,
                    COUNT(CASE WHEN source NOT LIKE 'gemini%' THEN 1 END) as external_collected,
                    COUNT(CASE WHEN validation_split = 'train' THEN 1 END) as train_split,
                    COUNT(CASE WHEN validation_split = 'validation' THEN 1 END) as validation_split,
                    COUNT(CASE WHEN validation_split = 'test' THEN 1 END) as test_split
                FROM quiz_questions 
                WHERE is_active = true
            """)
            quiz_stats = cursor.fetchone()
            
            # Get hackathon question counts
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_count,
                    COUNT(CASE WHEN source LIKE 'gemini%' THEN 1 END) as ai_generated,
                    COUNT(CASE WHEN source NOT LIKE 'gemini%' THEN 1 END) as external_collected,
                    COUNT(CASE WHEN validation_split = 'train' THEN 1 END) as train_split,
                    COUNT(CASE WHEN validation_split = 'validation' THEN 1 END) as validation_split,
                    COUNT(CASE WHEN validation_split = 'test' THEN 1 END) as test_split
                FROM hackathon_questions
                WHERE is_active = true
            """)
            hackathon_stats = cursor.fetchone()
            
            # Get category distribution for quiz questions
            cursor.execute("""
                SELECT category, COUNT(*) as count
                FROM quiz_questions
                WHERE is_active = true
                GROUP BY category
                ORDER BY count DESC
            """)
            quiz_categories = dict(cursor.fetchall())
            
            # Get difficulty distribution
            cursor.execute("""
                SELECT difficulty_level, COUNT(*) as count
                FROM quiz_questions
                WHERE is_active = true
                GROUP BY difficulty_level
                ORDER BY count DESC
            """)
            quiz_difficulties = dict(cursor.fetchall())
            
            conn.close()
            
            total_questions = quiz_stats[0] + hackathon_stats[0]
            
            summary = {
                'total_questions': total_questions,
                'target_achieved': total_questions >= self.target_counts['total_target'],
                'achievement_percentage': (total_questions / self.target_counts['total_target']) * 100,
                'quiz_questions': {
                    'total': quiz_stats[0],
                    'ai_generated': quiz_stats[1],
                    'external_collected': quiz_stats[2],
                    'train_split': quiz_stats[3],
                    'validation_split': quiz_stats[4],
                    'test_split': quiz_stats[5],
                    'categories': quiz_categories,
                    'difficulties': quiz_difficulties
                },
                'hackathon_questions': {
                    'total': hackathon_stats[0],
                    'ai_generated': hackathon_stats[1],
                    'external_collected': hackathon_stats[2],
                    'train_split': hackathon_stats[3],
                    'validation_split': hackathon_stats[4],
                    'test_split': hackathon_stats[5]
                }
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error generating final summary: {e}")
            return {'error': str(e)}

    def generate_completion_report(self, results: dict, duration) -> str:
        """Generate a comprehensive completion report"""
        final_stats = results.get('final_summary', {})
        
        report = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                        TRAINING DATA GENERATION COMPLETE                     ║  
╚══════════════════════════════════════════════════════════════════════════════╝

🎯 TARGET ACHIEVEMENT:
   • Target Questions: {self.target_counts['total_target']:,}
   • Generated Questions: {final_stats.get('total_questions', 0):,}
   • Achievement Rate: {final_stats.get('achievement_percentage', 0):.1f}%
   • Status: {'✅ TARGET MET' if final_stats.get('target_achieved', False) else '⚠️ PARTIAL COMPLETION'}

📊 QUESTION BREAKDOWN:
   Quiz Questions:
   • Total: {final_stats.get('quiz_questions', {}).get('total', 0):,}
   • AI Generated: {final_stats.get('quiz_questions', {}).get('ai_generated', 0):,}
   • External Sources: {final_stats.get('quiz_questions', {}).get('external_collected', 0):,}
   
   Hackathon Questions:
   • Total: {final_stats.get('hackathon_questions', {}).get('total', 0):,}
   • AI Generated: {final_stats.get('hackathon_questions', {}).get('ai_generated', 0):,}
   • External Sources: {final_stats.get('hackathon_questions', {}).get('external_collected', 0):,}

🔄 DATA SPLITS:
   • Training Set: {final_stats.get('quiz_questions', {}).get('train_split', 0) + final_stats.get('hackathon_questions', {}).get('train_split', 0):,} (80%)
   • Validation Set: {final_stats.get('quiz_questions', {}).get('validation_split', 0) + final_stats.get('hackathon_questions', {}).get('validation_split', 0):,} (10%)
   • Test Set: {final_stats.get('quiz_questions', {}).get('test_split', 0) + final_stats.get('hackathon_questions', {}).get('test_split', 0):,} (10%)

📈 TOP CATEGORIES:
"""
        
        # Add top categories
        categories = final_stats.get('quiz_questions', {}).get('categories', {})
        for i, (category, count) in enumerate(sorted(categories.items(), key=lambda x: x[1], reverse=True)[:5]):
            report += f"   {i+1}. {category.replace('_', ' ').title()}: {count:,} questions\n"
        
        report += f"""
⚡ DIFFICULTY DISTRIBUTION:
"""
        
        # Add difficulty distribution
        difficulties = final_stats.get('quiz_questions', {}).get('difficulties', {})
        for difficulty, count in difficulties.items():
            report += f"   • {difficulty.title()}: {count:,} questions\n"
        
        report += f"""
⏱️  PROCESSING TIME: {duration}

🚀 NEXT STEPS:
   1. Review exported training data in ../data/processed_training_data/
   2. Run model training pipelines with prepared datasets
   3. Validate AI model performance on test sets  
   4. Deploy trained models to production environment

📁 OUTPUT FILES:
   • Training datasets: ../data/processed_training_data/
   • Generation logs: master_training_generation.log
   • Results summary: ../data/master_generation_results.json

═══════════════════════════════════════════════════════════════════════════════
🎉 CONGRATULATIONS! Your AI training dataset is ready for model training! 🎉
═══════════════════════════════════════════════════════════════════════════════
"""
        
        return report

    async def quick_generate(self, count: int):
        """Quickly generate a specified number of questions for testing"""
        logger.info(f"Quick generation of {count} questions...")
        
        # Adjust target counts for quick generation
        original_configs = self.ai_generator.question_configs.copy()
        
        # Scale down targets proportionally
        scale_factor = count / sum(config.target_count for config in original_configs)
        
        for config in self.ai_generator.question_configs:
            config.target_count = max(1, int(config.target_count * scale_factor))
        
        try:
            results = await self.ai_generator.generate_all_questions()
            logger.info(f"Quick generation completed: {results}")
            return results
        finally:
            # Restore original configs
            self.ai_generator.question_configs = original_configs

async def main():
    """Main execution with command line arguments"""
    parser = argparse.ArgumentParser(description='Master Training Data Generator')
    parser.add_argument('--skip-generation', action='store_true', help='Skip AI generation phase')
    parser.add_argument('--skip-collection', action='store_true', help='Skip external collection phase')  
    parser.add_argument('--skip-preparation', action='store_true', help='Skip data preparation phase')
    parser.add_argument('--quick', type=int, help='Quick generation with specified count')
    
    args = parser.parse_args()
    
    generator = MasterTrainingDataGenerator()
    
    try:
        if args.quick:
            results = await generator.quick_generate(args.quick)
        else:
            results, report = await generator.run_complete_pipeline(
                skip_generation=args.skip_generation,
                skip_collection=args.skip_collection, 
                skip_preparation=args.skip_preparation
            )
            
            # Print final report
            print(report)
        
        logger.info("Master training data generation completed successfully! 🎉")
        
    except Exception as e:
        logger.error(f"Master generation failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
