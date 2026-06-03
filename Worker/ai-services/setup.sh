#!/bin/bash

# EdTech AI Services Setup Script (macOS/Linux)
# This script sets up the Python virtual environment and installs dependencies

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   EdTech AI Services - Setup Script                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check Python version
echo "📦 Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+ first."
    exit 1
fi

PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python $PYTHON_VERSION found"
echo ""

# Create virtual environment
echo "🔧 Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "⚡ Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip setuptools wheel > /dev/null 2>&1
echo "✓ pip upgraded"
echo ""

# Install dependencies
echo "📦 Installing dependencies from requirements.txt..."
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env created (update with your actual values)"
else
    echo "✓ .env file already exists"
fi
echo ""

# Print next steps
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   Setup Complete! 🎉                                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "1. Activate virtual environment (if not already active):"
echo "   source venv/bin/activate"
echo ""
echo "2. Update .env with your configuration:"
echo "   nano .env"
echo ""
echo "3. Run the application:"
echo "   python app/main.py"
echo ""
echo "4. Access API documentation:"
echo "   http://localhost:8000/docs"
echo ""
