# EdTech AI Services - Quick Start Guide

## 📋 Prerequisites

- Python 3.11 or later
- 8GB+ RAM (16GB+ recommended for model downloads)
- 20GB+ free disk space (for ML models and datasets)
- Internet connection (for downloading models)

## 🚀 Complete Setup (One-Time)

### Option 1: Automated Setup (Recommended)

**macOS/Linux:**
```bash
cd ai-services
bash setup.sh              # Creates venv and installs dependencies
source venv/bin/activate   # Activate virtual environment
bash download-models.sh    # Download ML models and NLTK data
```

**Windows:**
```bash
cd ai-services
setup.bat                  # Creates venv and installs dependencies
download-models.bat        # Download ML models and NLTK data
```

### Option 2: Manual Setup

**1. Create Virtual Environment:**
```bash
# macOS/Linux
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

**2. Install Dependencies:**
```bash
pip install -r requirements.txt
```

**3. Download Models & Data:**
```bash
# spaCy English model (~50MB)
python -m spacy download en_core_web_lg

# NLTK data (~100MB)
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

**4. Configure Environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

## ▶️ Running the Service

### Development Mode

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Run the application
python app/main.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access the API:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

### Docker Deployment

```bash
# Build image
docker build -t edtech-ai:latest .

# Run container
docker run -p 8000:8000 \
  -e GEMINI_API_KEY=YOUR_GEMINI_API_KEY \
  -e DATABASE_URL=postgresql://... \
  edtech-ai:latest

# Or using docker-compose
docker-compose up ai-services
```

## 🔧 Configuration

Edit `.env` with your settings:

```env
# API Configuration
PORT=8000
DEBUG=True

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=edtech_db
DATABASE_URL=postgresql://user:password@localhost:5432/edtech_db

# Cache
REDIS_URL=redis://localhost:6379

# AI APIs
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_quiz.py -v
```

## 📊 API Endpoints

### Quiz AI
- `POST /api/v1/quiz/generate` - AI-generated quiz questions
- `POST /api/v1/quiz/evaluate` - Evaluate student answers

### Hackathon AI
- `POST /api/v1/hackathon/analyze-code` - Code analysis
- `POST /api/v1/hackathon/suggest-improvements` - Code suggestions

### Interview AI
- `POST /api/v1/interview/analyze-response` - Response analysis
- `POST /api/v1/interview/generate-questions` - Question generation

### Analytics
- `GET /api/v1/analytics/user-skills` - Skill assessment
- `GET /api/v1/analytics/recommendations` - Learning recommendations

## 🛠️ Troubleshooting

### Virtual Environment Issues
```bash
# Recreate venv if corrupted
rm -rf venv                 # macOS/Linux
python3 -m venv venv

# Windows
rmdir /s venv
python -m venv venv
```

### Port Already in Use
```bash
# Change port
python app/main.py --port 8001

# Or kill existing process
lsof -i :8000              # macOS/Linux
netstat -ano | find ":8000" # Windows
```

### Model Download Failures
```bash
# Manually download spaCy model
python -m spacy download en_core_web_lg --upgrade

# Check NLTK data path
python -c "import nltk; print(nltk.data.path)"
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U user -d edtech_db -h localhost

# Test Redis connection
redis-cli -h localhost ping
```

## 📦 Dependencies Summary

**Major Components:**
- **FastAPI** - Web framework
- **Pydantic** - Data validation
- **SQLAlchemy** - ORM
- **PyTorch** - Deep learning
- **TensorFlow** - ML framework
- **Transformers** - NLP models
- **spaCy** - NLP processing
- **scikit-learn** - ML algorithms
- **Celery** - Task queue

**Total:** 72 packages (see requirements.txt)

## 📚 Documentation

- [README.md](./README.md) - Detailed documentation
- [../docs/](../docs/) - Project documentation
- API Docs: http://localhost:8000/docs

## 🆘 Getting Help

1. Check the troubleshooting section above
2. Review application logs
3. Check database connections
4. Verify API keys in .env
5. Review endpoint documentation at `/docs`

## 🔄 Update Dependencies

```bash
# Update all packages
pip install --upgrade -r requirements.txt

# Check for outdated packages
pip list --outdated
```

## 🚀 Production Deployment

See [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production setup.

Key points:
- Use proper SECRET_KEY (not default)
- Configure DEBUG=False
- Set up proper database
- Use Redis for caching
- Configure CORS origins properly
- Set up monitoring and logging

---

**Ready to go!** 🎉

Your AI services are configured and ready to process quiz generation, code analysis, interview evaluation, and learning analytics!
