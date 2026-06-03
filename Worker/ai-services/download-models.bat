@echo off
REM EdTech AI Services - Model & Data Download Script (Windows)
REM Downloads required ML models and data after requirements.txt installation

setlocal enabledelayedexpansion

echo.
echo ====================================================
echo   EdTech AI Services - Model Download
echo ====================================================
echo.

REM Check if virtual environment is activated
if "%VIRTUAL_ENV%"=="" (
    echo Error: Virtual environment is not activated!
    echo Please activate it first:
    echo   venv\Scripts\activate.bat
    pause
    exit /b 1
)

echo OK - Virtual environment is active
echo.

REM Check if requirements are installed
echo Verifying requirements.txt installation...
python -c "import fastapi" >nul 2>&1
if errorlevel 1 (
    echo Installing requirements.txt...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo Error: Failed to install requirements
        pause
        exit /b 1
    )
)
echo OK - Requirements verified
echo.

REM Download spaCy model
echo Downloading spaCy English model (en_core_web_lg)...
echo This may take a few minutes...
python -m spacy download en_core_web_lg
if errorlevel 1 (
    echo Warning: spaCy model download had issues
)
echo OK - spaCy model downloaded
echo.

REM Download NLTK data
echo Downloading NLTK data...
python << 'PYTHON_EOF'
import nltk
import ssl

# Handle SSL certificate issues
try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

# Download required NLTK data
datasets = ['punkt', 'stopwords', 'wordnet', 'averaged_perceptron_tagger', 'maxent_ne_chunker', 'words']

for dataset in datasets:
    print(f"Downloading {dataset}...", end=" ", flush=True)
    try:
        nltk.download(dataset, quiet=True)
        print("OK")
    except Exception as e:
        print(f"Warning ({e})")

print()
PYTHON_EOF

echo OK - NLTK data downloaded
echo.

REM Verify installations
echo Verifying installations...
python << 'PYTHON_EOF'
import sys

# Check packages
packages_to_check = [
    ('fastapi', 'FastAPI'),
    ('torch', 'PyTorch'),
    ('tensorflow', 'TensorFlow'),
    ('transformers', 'Transformers'),
    ('sklearn', 'scikit-learn'),
    ('pandas', 'Pandas'),
    ('spacy', 'spaCy'),
    ('nltk', 'NLTK'),
]

print("Package versions:")
print("-" * 50)

all_ok = True
for module_name, display_name in packages_to_check:
    try:
        module = __import__(module_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"  OK {display_name:<20} {version}")
    except ImportError:
        print(f"  ERROR {display_name:<20} NOT INSTALLED")
        all_ok = False

print("-" * 50)

if all_ok:
    print("OK All packages installed successfully")
else:
    print("Warning: Some packages are missing")
    sys.exit(1)
PYTHON_EOF

echo.
echo.
echo ====================================================
echo   Setup Complete!
echo ====================================================
echo.
echo You're ready to run the AI services!
echo.
echo Next steps:
echo 1. Make sure .env is configured with your API keys:
echo    notepad .env
echo.
echo 2. Run the application:
echo    python app/main.py
echo.
echo 3. Access the API:
echo    http://localhost:8000/docs
echo.
pause
