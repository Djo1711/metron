@echo off
echo 🚀 Metron Backend Setup Script
echo ================================

REM Check if we're in the right directory
if not exist "requirements.txt" (
    echo ❌ Error: Please run this script from the backend\ directory
    exit /b 1
)

echo.
echo Step 1: Creating virtual environment...
python -m venv venv
echo ✅ Virtual environment created

echo.
echo Step 2: Activating virtual environment...
call venv\Scripts\activate
echo ✅ Virtual environment activated

echo.
echo Step 3: Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt
echo ✅ Dependencies installed

echo.
echo Step 4: Setting up environment file...
if not exist ".env" (
    copy .env.example .env
    echo ✅ .env file created
    echo ⚠️  Please edit .env and add your Supabase credentials
) else (
    echo ⚠️  .env already exists, skipping...
)

echo.
echo ================================
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit backend\.env with your Supabase credentials
echo 2. Run: venv\Scripts\activate
echo 3. Run: uvicorn app.main:app --reload
echo 4. Visit: http://localhost:8000/docs
echo.
pause
