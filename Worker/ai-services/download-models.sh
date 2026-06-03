#!/bin/bash

# EdTech AI Services - Model & Data Download Script (macOS/Linux)
# Downloads required ML models and data after requirements.txt installation

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   EdTech AI Services - Model Download                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if virtual environment is activated
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  Virtual environment is not activated!"
    echo "Please activate it first:"
    echo "  source venv/bin/activate"
    exit 1
fi

echo "✓ Virtual environment is active"
echo ""

# Check if requirements are installed
echo "📦 Verifying requirements.txt installation..."
if ! python -c "import fastapi" 2>/dev/null; then
    echo "Installing requirements.txt..."
    pip install -r requirements.txt
fi
echo "✓ Requirements verified"
echo ""

# Download spaCy model
echo "📥 Downloading spaCy English model (en_core_web_lg)..."
echo "   This may take a few minutes..."
python -m spacy download en_core_web_lg
echo "✓ spaCy model downloaded"
echo ""

# Download NLTK data
echo "📥 Downloading NLTK data..."
python << 'EOF'
import nltk
import ssl

# Handle SSL certificate issues on some systems
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
        print("✓")
    except Exception as e:
        print(f"⚠️  ({e})")

print()
EOF

echo "✓ NLTK data downloaded"
echo ""

# Verify installations
echo "🔍 Verifying installations..."
python << 'EOF'
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
        print(f"  ✓ {display_name:<20} {version}")
    except ImportError:
        print(f"  ✗ {display_name:<20} NOT INSTALLED")
        all_ok = False

print("-" * 50)

if all_ok:
    print("✓ All packages installed successfully")
else:
    print("⚠️  Some packages are missing")
    sys.exit(1)
EOF

echo ""

# Final status
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   Setup Complete! ✅                                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "You're ready to run the AI services!"
echo ""
echo "Next steps:"
echo "1. Make sure .env is configured with your API keys:"
echo "   nano .env"
echo ""
echo "2. Run the application:"
echo "   python app/main.py"
echo ""
echo "3. Access the API:"
echo "   http://localhost:8000/docs"
echo ""
