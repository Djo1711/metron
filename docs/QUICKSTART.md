# 🚀 Quick Start Guide

## Prerequisites

- Python 3.11+
- Git
- Code editor (VS Code recommended)
- Supabase account (free)

## 📥 Step 1: Clone & Setup

```bash
# Clone your repository
git clone <your-repo-url>
cd metron

# Create backend virtual environment
cd backend
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Mac/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## 🗄️ Step 2: Setup Supabase

Follow the detailed guide: [docs/SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

Quick version:
1. Create project on [supabase.com](https://supabase.com)
2. Get API keys from Settings → API
3. Copy `.env.example` to `.env`
4. Paste your keys in `.env`
5. Run SQL schema from docs/SUPABASE_SETUP.md

## ⚙️ Step 3: Configure Environment

```bash
# In backend/ directory
cp .env.example .env

# Edit .env with your values:
# SUPABASE_URL=https://xxxxx.supabase.co
# SUPABASE_KEY=eyJhbGci...
# SUPABASE_SERVICE_KEY=eyJhbGci...
```

## ▶️ Step 4: Run Backend

```bash
# Make sure you're in backend/ and venv is activated
uvicorn app.main:app --reload

# Should see:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete.
```

## ✅ Step 5: Test API

Open browser to:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

Try the interactive API docs!

## 🧪 Step 6: Run Tests

```bash
# In backend/ directory with venv activated
pytest tests/ -v

# Should see all tests passing ✅
```

## 📝 Common Commands

```bash
# Start backend server
uvicorn app.main:app --reload

# Run tests
pytest

# Run tests with coverage
pytest --cov=app tests/

# Format code (optional)
pip install black
black app/

# Lint code (optional)
pip install flake8
flake8 app/
```

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Make sure venv is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

### Supabase connection errors
```bash
# Check your .env file has correct keys
cat .env  # Mac/Linux
type .env  # Windows

# Test connection
python -c "from app.database import get_supabase; print(get_supabase())"
```

### Port 8000 already in use
```bash
# Use different port
uvicorn app.main:app --reload --port 8001
```

## 🎯 Next Steps

- ✅ Backend running
- ✅ Supabase connected
- ✅ Tests passing
- → Start building features! 💪

## 📚 Useful Links

- **API Documentation**: http://localhost:8000/docs
- **Supabase Dashboard**: https://app.supabase.com
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Supabase Python Docs**: https://supabase.com/docs/reference/python
