#!/usr/bin/env python3
"""
Quick Demo: AI Training Data Generation
Generates a sample of 50 questions to demonstrate the system capabilities
"""

import os
import asyncio
import sys
import logging
from pathlib import Path

# Add the parent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.training.run_training_generation import MasterTrainingDataGenerator

# Configure basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def run_demo():
    """Run a quick demo of the training data generation system"""
    
    print("🧠 AI Training Data Generation - Quick Demo")
    print("=" * 60)
    print("This demo will generate 50 sample questions to showcase the system.")
    print("For full 10,000+ question generation, use the complete pipeline.")
    print("=" * 60)
    
    # Check environment
    gemini_key = os.getenv('GEMINI_API_KEY', '')
    if not gemini_key:
        print("❌ Error: GEMINI_API_KEY not found in environment")
        print("Please set: export GEMINI_API_KEY=your_actual_api_key_here")
        return False
    
    print(f"✅ Gemini API Key: {gemini_key[:20]}...")
    
    # Check database connection
    db_config = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'edtech_platform'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'password'),
        'port': os.getenv('DB_PORT', '5432')
    }
    
    print(f"✅ Database: {db_config['user']}@{db_config['host']}:{db_config['port']}/{db_config['database']}")
    
    try:
        # Initialize generator
        generator = MasterTrainingDataGenerator()
        
        print("\n🚀 Starting demo generation...")
        print("Generating 50 sample questions across multiple categories...")
        
        # Run quick generation
        results = await generator.quick_generate(50)
        
        print("\n📊 Demo Results:")
        print(f"✅ Quiz Questions Generated: {results.get('quiz_questions', 0)}")
        print(f"✅ Hackathon Questions Generated: {results.get('hackathon_questions', 0)}")
        print(f"✅ Total Questions: {results.get('total', 0)}")
        print(f"⏱️ Generation Time: {results.get('duration', 'N/A')}")
        
        print("\n🔍 Sample Questions Generated:")
        
        # Try to fetch some sample questions from database
        try:
            import psycopg2
            from psycopg2.extras import RealDictCursor
            
            conn = psycopg2.connect(**{**db_config, 'port': int(db_config['port'])})
            cursor = conn.cursor(cursor_factory=RealDictCursor)
            
            # Get sample quiz questions
            cursor.execute("""
                SELECT question_text, category, difficulty_level, question_type
                FROM quiz_questions 
                WHERE source LIKE 'gemini%'
                ORDER BY created_at DESC
                LIMIT 3
            """)
            
            sample_questions = cursor.fetchall()
            
            for i, q in enumerate(sample_questions, 1):
                print(f"\n{i}. [{q['category'].replace('_', ' ').title()}] - {q['difficulty_level'].title()}")
                print(f"   Type: {q['question_type']}")
                print(f"   Q: {q['question_text'][:100]}...")
            
            # Get category distribution
            cursor.execute("""
                SELECT category, COUNT(*) as count
                FROM quiz_questions
                WHERE source LIKE 'gemini%'
                GROUP BY category
                ORDER BY count DESC
                LIMIT 5
            """)
            
            categories = cursor.fetchall()
            print(f"\n📈 Top Categories Generated:")
            for cat in categories:
                print(f"   • {cat['category'].replace('_', ' ').title()}: {cat['count']} questions")
            
            conn.close()
            
        except Exception as e:
            logger.warning(f"Could not fetch sample questions: {e}")
        
        print("\n🎉 Demo completed successfully!")
        print("\nNext Steps:")
        print("1. Review the generated questions in your database")
        print("2. Run full generation: python -m app.training.run_training_generation")
        print("3. Check exported training data in: data/processed_training_data/")
        print("4. Use the training data for AI model development")
        
        return True
        
    except Exception as e:
        logger.error(f"Demo failed: {e}")
        print(f"\n❌ Demo failed with error: {e}")
        print("\nTroubleshooting:")
        print("1. Ensure database is running and accessible")
        print("2. Verify GEMINI_API_KEY is valid")
        print("3. Check database migration has been applied")
        print("4. Review logs for detailed error information")
        
        return False

def main():
    """Main execution function"""
    print("Starting AI Training Data Generation Demo...")
    
    # Check if we're in the right directory
    if not os.path.exists('app/training'):
        print("❌ Error: Please run this script from the ai-services directory")
        print("Usage: cd ai-services && python demo_training_generation.py")
        return
    
    # Run the demo
    try:
        result = asyncio.run(run_demo())
        if result:
            print("\n✅ Demo completed successfully!")
        else:
            print("\n❌ Demo failed. Please check the error messages above.")
            
    except KeyboardInterrupt:
        print("\n⏹️ Demo interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        logger.exception("Demo crashed")

if __name__ == '__main__':
    main()