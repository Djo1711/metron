# ⚡ Quick Command Reference

## 🚀 Initial Setup (Do Once)

```bash
# Navigate to project
cd metron/backend

# Mac/Linux - Run setup script
chmod +x setup.sh
./setup.sh

# Windows - Run setup script
setup.bat

# OR Manual setup:
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Supabase credentials
```

## 🏃 Daily Development

```bash
# Start backend server
cd backend
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
uvicorn app.main:app --reload

# Server runs at: http://localhost:8000
# API Docs at: http://localhost:8000/docs
```

## 🧪 Testing

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_api.py

# Run with coverage
pytest --cov=app tests/

# Watch mode (re-run on changes)
pip install pytest-watch
ptw
```

## 📦 Package Management

```bash
# Install new package
pip install package-name

# Save to requirements.txt
pip freeze > requirements.txt

# Update all packages (be careful!)
pip install --upgrade -r requirements.txt
```

## 🔍 Code Quality

```bash
# Format code with Black
pip install black
black app/

# Lint with flake8
pip install flake8
flake8 app/

# Type checking with mypy
pip install mypy
mypy app/
```

## 🗄️ Supabase Commands

```bash
# Test Supabase connection
python -c "from app.database import get_supabase; print(get_supabase())"

# Run SQL from file (example)
# Use Supabase dashboard SQL editor instead
```

## 🔄 Git Workflow

```bash
# Initial setup
git remote add origin <your-repo-url>
git add .
git commit -m "Initial commit"
git push -u origin main

# Daily workflow
git checkout develop
git pull
git checkout -b feature/your-feature
# ... make changes ...
git add .
git commit -m "feat: your description"
git push -u origin feature/your-feature

# Common commands
git status
git log --oneline
git branch -a
git checkout branch-name
```

## 🐳 Docker (Optional - for later)

```bash
# Build image
docker build -t metron-backend .

# Run container
docker run -p 8000:8000 metron-backend

# Docker Compose
docker-compose up -d
docker-compose down
```

## 🌐 API Testing (curl)

```bash
# Health check
curl http://localhost:8000/health

# Get stock quote
curl http://localhost:8000/api/market/quote/AAPL

# Price Reverse Convertible
curl -X POST http://localhost:8000/api/pricing/reverse-convertible \
  -H "Content-Type: application/json" \
  -d '{
    "ticker": "AAPL",
    "principal": 10000,
    "coupon_rate": 8.0,
    "barrier_level": 60,
    "maturity_years": 1,
    "spot_price": 150,
    "volatility": 0.25,
    "risk_free_rate": 0.04
  }'
```

## 🎯 API Testing (HTTPie - Prettier)

```bash
# Install HTTPie
pip install httpx[cli]

# Health check
http :8000/health

# Get stock quote
http :8000/api/market/quote/AAPL

# Price Reverse Convertible
http POST :8000/api/pricing/reverse-convertible \
  ticker=AAPL \
  principal:=10000 \
  coupon_rate:=8.0 \
  barrier_level:=60 \
  maturity_years:=1 \
  spot_price:=150 \
  volatility:=0.25 \
  risk_free_rate:=0.04
```

## 📊 Database

```bash
# Python shell to interact with DB
python
>>> from app.database import get_supabase
>>> supabase = get_supabase()
>>> result = supabase.table('simulations').select('*').execute()
>>> print(result.data)
```

## 🔧 Troubleshooting

```bash
# Kill process on port 8000 (if stuck)
# Mac/Linux:
lsof -ti:8000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Clear Python cache
find . -type d -name __pycache__ -exec rm -r {} +  # Mac/Linux
for /d /r . %d in (__pycache__) do @if exist "%d" rd /s /q "%d"  # Windows

# Reset venv
deactivate
rm -rf venv  # Mac/Linux
rmdir /s venv  # Windows
python -m venv venv
# ... activate and reinstall
```

## 📁 Project Structure Navigation

```bash
# Quick navigation
cd backend              # Backend code
cd backend/app         # Application code
cd backend/tests       # Tests
cd docs                # Documentation
cd .github/workflows   # CI/CD

# Find files
find . -name "*.py"    # All Python files
find . -name "test_*"  # All test files
```

## 🎓 Useful Python One-Liners

```bash
# Check Python version
python --version

# List installed packages
pip list

# Create requirements from current env
pip freeze > requirements.txt

# Show package info
pip show fastapi

# Interactive Python shell
python
# OR better:
pip install ipython
ipython
```

## 🚀 Production (Later)

```bash
# Run with Gunicorn (production server)
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Environment-specific
uvicorn app.main:app --host 0.0.0.0 --port 8000  # Public access
```

## 📌 Keyboard Shortcuts in Terminal

```
Ctrl + C        Stop running server
Ctrl + D        Exit Python shell
Ctrl + L        Clear terminal
Ctrl + R        Search command history
Tab             Auto-complete
```

## 🎯 Quick Health Checks

```bash
# Is backend running?
curl http://localhost:8000/health

# Can I connect to Supabase?
python -c "from app.database import get_supabase; get_supabase()"

# Are tests passing?
pytest --tb=short

# Is git clean?
git status
```

---

**💡 Pro Tip**: Save this file as a bookmark and refer to it often!

**🔖 Useful Aliases** (add to `~/.bashrc` or `~/.zshrc`):
```bash
alias mrun="uvicorn app.main:app --reload"
alias mtest="pytest -v"
alias mfmt="black app/"
alias mcheck="flake8 app/ && pytest"
```
