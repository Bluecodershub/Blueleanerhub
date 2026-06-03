@echo off
REM EdTech AI Services Setup Script (Windows)
REM This script sets up the Python virtual environment and installs dependencies

setlocal enabledelayedexpansion

echo.
echo ====================================================
echo   EdTech AI Services - Setup Script
echo ====================================================
echo.

REM Check Python version
echo Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH.
    echo Please install Python 3.11+ from https://www.python.org
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo OK - Python %PYTHON_VERSION% found
echo.

REM Create virtual environment
echo Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo OK - Virtual environment created
) else (
    echo OK - Virtual environment already exists
)
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Error: Failed to activate virtual environment
    pause
    exit /b 1
)
echo OK - Virtual environment activated
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip setuptools wheel >nul 2>&1
echo OK - pip upgraded
echo.

REM Install dependencies
echo Installing dependencies from requirements.txt...
pip install -r requirements.txt
if errorlevel 1 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)
echo OK - Dependencies installed
echo.

REM Create .env if it doesn't exist
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul
    echo OK - .env created (update with your actual values)
) else (
    echo OK - .env file already exists
)
echo.

REM Print next steps
echo.
echo ====================================================
echo   Setup Complete!
echo ====================================================
echo.
echo Next steps:
echo 1. Activate virtual environment (if not already active):
echo    venv\Scripts\activate.bat
echo.
echo 2. Update .env with your configuration:
echo    notepad .env
echo.
echo 3. Run the application:
echo    python app/main.py
echo.
echo 4. Access API documentation:
echo    http://localhost:8000/docs
echo.
pause
