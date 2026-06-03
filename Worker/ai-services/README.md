# EdTech AI Services Setup Guide

This guide walks you through setting up and running the AI services component of the EdTech platform.

## Prerequisites

- Python 3.11+
- pip (Python package manager)
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)
- MongoDB 7+ (or use Docker)

## Local Development Setup

### 1. Create Python Virtual Environment

Navigate to the `ai-services` directory:

```bash
cd ai-services
```

Create a virtual environment:

```bash
# On macOS/Linux
python3 -m venv venv

# On Windows
python -m venv venv
```

### 2. Activate Virtual Environment

```bash
# On macOS/Linux
source venv/bin/activate

# On Windows
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt when activated.

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Set database connection strings
- Add Google Gemini API key
- Configure Redis and MongoDB connections

### 5. Run the Service

```bash
# Development mode with auto-reload
python app/main.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Docker Setup

### Build and Run with Docker Compose

From the root directory:

```bash
docker-compose up ai-services
```

This uses the `Dockerfile` in the ai-services directory and automatically sets up all dependencies.

### Build Custom Image

```bash
docker build -t edtech-ai-services:latest .
```

## Project Structure

```
ai-services/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── quiz.py         # Quiz AI endpoints
│   │       ├── hackathon.py    # Hackathon AI endpoints
│   │       ├── interview.py    # Interview AI endpoints
│   │       └── analytics.py    # Analytics AI endpoints
│   ├── core/
│   │   ├── config.py           # Configuration management
│   │   ├── logging.py          # Logging setup
│   │   └── security.py         # Security utilities
│   ├── models/
│   │   ├── quiz/               # Quiz-related models
│   │   ├── hackathon/          # Hackathon-related models
│   │   ├── interview/          # Interview-related models
│   │   └── analytics/          # Analytics models
│   ├── services/               # Business logic services
│   ├── utils/                  # Utility functions
│   └── main.py                 # Application entry point
├── data/
│   ├── processed/              # Processed datasets
│   └── raw/                    # Raw datasets
├── tests/                      # Test suite
├── Dockerfile                  # Production Docker image
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## Key Dependencies

- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **SQLAlchemy**: ORM for database operations
- **Pydantic**: Data validation and serialization
- **Transformers**: Hugging Face NLP models
- **Scikit-learn**: Machine learning library
- **Google Gemini**: Advanced AI model integrations
- **Redis**: Caching and job queue
- **MongoDB**: Document storage for logs

## API Endpoints

### Quiz AI
- `POST /api/v1/quiz/generate` - Generate quiz questions using AI
- `POST /api/v1/quiz/evaluate` - Evaluate quiz answers

### Hackathon AI
- `POST /api/v1/hackathon/analyze-code` - Analyze submitted code
- `POST /api/v1/hackathon/suggest-improvements` - Get code improvement suggestions

### Interview AI
- `POST /api/v1/interview/analyze-response` - Analyze interview responses
- `POST /api/v1/interview/generate-questions` - Generate interview questions

### Analytics
- `GET /api/v1/analytics/user-skills` - Get user skill assessments
- `GET /api/v1/analytics/learning-recommendations` - Get personalized recommendations

### Health Check
- `GET /health` - Service health status

## Environment Variables

Key environment variables to configure:

```env
# API Configuration
PORT=8000
DEBUG=True

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/edtech_db
MONGODB_URI=mongodb://localhost:27017/edtech_logs

# Cache
REDIS_URL=redis://localhost:6379

# AI APIs
GEMINI_API_KEY=YOUR_GEMINI_API_KEY

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## Testing

Run the test suite:

```bash
pytest

# With coverage
pytest --cov=app tests/

# Specific test file
pytest tests/test_quiz.py -v
```

## Troubleshooting

### Virtual Environment Not Activating
- On Windows, enable script execution: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- On macOS/Linux, ensure the script is executable: `chmod +x venv/bin/activate`

### Import Errors
- Ensure virtual environment is activated: `pip list` should show installed packages
- Reinstall dependencies: `pip install --upgrade -r requirements.txt`

### Database Connection Issues
- Verify PostgreSQL/MongoDB are running
- Check connection string in `.env`
- Test connection: `psql -U user -d edtech_db -h localhost`

### Port Already in Use
- Change port: `uvicorn app.main:app --port 8001`
- Or kill process: `lsof -i :8000` (macOS/Linux) or `netstat -ano | findstr :8000` (Windows)

## Production Deployment

See [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production setup instructions.

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pytest`
4. Submit a pull request

## License

MIT License - See LICENSE file for details
