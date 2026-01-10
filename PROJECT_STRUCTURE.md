# 📁 Metron Project Structure

```
metron/
│
├── 📄 README.md                           # Project overview and main documentation
├── 📄 .gitignore                          # Files to ignore in Git
│
├── 📂 .github/                            # GitHub configuration
│   └── workflows/                         # CI/CD pipelines
│       ├── backend-ci.yml                 # Backend tests automation
│       └── frontend-ci.yml                # Frontend tests automation
│
├── 📂 backend/                            # FastAPI Backend
│   │
│   ├── 📄 requirements.txt                # Python dependencies
│   ├── 📄 .env.example                    # Environment variables template
│   ├── 🔧 setup.sh                        # Setup script (Mac/Linux)
│   ├── 🔧 setup.bat                       # Setup script (Windows)
│   │
│   ├── 📂 app/                            # Main application
│   │   ├── 📄 __init__.py
│   │   ├── 📄 main.py                     # FastAPI app entry point
│   │   ├── 📄 config.py                   # Configuration & settings
│   │   ├── 📄 database.py                 # Supabase client
│   │   │
│   │   └── 📂 api/                        # API routes
│   │       ├── 📄 __init__.py
│   │       ├── 📄 pricing.py              # Structured products pricing
│   │       ├── 📄 market_data.py          # Stock market data (yfinance)
│   │       └── 📄 simulations.py          # Save/load simulations
│   │
│   └── 📂 tests/                          # Test suite
│       ├── 📄 __init__.py
│       └── 📄 test_api.py                 # API endpoint tests
│
├── 📂 frontend/                           # React Frontend (to be created)
│   └── (Will be setup in Day 3-4)
│
└── 📂 docs/                               # Documentation
    ├── 📄 QUICKSTART.md                   # Quick start guide
    ├── 📄 SUPABASE_SETUP.md               # Database setup
    ├── 📄 GIT_SETUP.md                    # Version control guide
    ├── 📄 COMMANDS.md                     # Command reference
    └── 📄 DAY1_SUMMARY.md                 # Today's progress

```

## 📊 File Purposes

### Root Level
- **README.md**: Project description, tech stack, quick start
- **.gitignore**: Excludes venv, cache, secrets from Git

### Backend Structure

#### Core Application (`backend/app/`)
- **main.py**: 
  - FastAPI app initialization
  - CORS middleware
  - Router registration
  - Health check endpoints

- **config.py**:
  - Environment variables management
  - Supabase credentials
  - CORS origins
  - App settings

- **database.py**:
  - Supabase client singleton
  - Database connection management

#### API Routes (`backend/app/api/`)
- **pricing.py**:
  - ✅ Reverse Convertible pricing (Black-Scholes)
  - Greeks calculation (Delta, Gamma, Vega, Theta)
  - Fair value computation
  - 🔜 Autocall pricing (Monte Carlo)

- **market_data.py**:
  - Stock quotes (real-time from yfinance)
  - Historical price data
  - Volatility calculation
  - Trending stocks

- **simulations.py**:
  - Save user simulations to Supabase
  - Retrieve simulation history
  - Delete simulations
  - User-specific data isolation

#### Testing (`backend/tests/`)
- **test_api.py**:
  - Health check tests
  - Pricing endpoint tests
  - Market data tests
  - Automated CI/CD testing

### Documentation (`docs/`)
- **QUICKSTART.md**: Step-by-step setup instructions
- **SUPABASE_SETUP.md**: Database configuration guide
- **GIT_SETUP.md**: Git workflow and collaboration
- **COMMANDS.md**: Command reference cheat sheet
- **DAY1_SUMMARY.md**: Progress tracking and next steps

### CI/CD (`.github/workflows/`)
- **backend-ci.yml**: 
  - Runs on push to backend/
  - Python 3.11 testing
  - Dependencies caching
  - Linting with flake8

- **frontend-ci.yml**:
  - Ready for React integration
  - Node.js 18.x, 20.x testing
  - Build verification

## 🎯 Key Files to Know

### Most Important Files:
1. **backend/app/main.py** - Start here to understand the app
2. **backend/app/api/pricing.py** - Core pricing logic
3. **backend/.env** - Your secrets (create from .env.example)
4. **docs/QUICKSTART.md** - Your first read

### Configuration Files:
- **backend/requirements.txt** - Python dependencies
- **backend/.env.example** - Template for environment variables
- **.gitignore** - Files excluded from Git

### Automation:
- **backend/setup.sh** - One-command setup (Mac/Linux)
- **backend/setup.bat** - One-command setup (Windows)
- **.github/workflows/** - Automated testing

## 📈 File Counts

- **Python files**: 10 (8 app + 2 tests)
- **Documentation**: 5 markdown files
- **Configuration**: 5 files
- **Total**: ~20 files (excluding frontend)

## 🔜 Coming Soon

### Week 2 Additions:
```
backend/
├── app/
│   ├── api/
│   │   └── auth.py              # User authentication
│   └── models/
│       ├── products.py          # Product data models
│       └── users.py             # User data models
```

### Week 3 Additions:
```
backend/
└── app/
    ├── pricing/
    │   ├── black_scholes.py     # Refactored BS model
    │   ├── monte_carlo.py       # MC simulation
    │   └── autocall.py          # Autocall pricing
    └── utils/
        ├── validators.py        # Input validation
        └── calculations.py      # Shared math functions
```

## 🎓 Where to Start

1. **New to the project?** → Read `README.md`
2. **Want to setup?** → Follow `docs/QUICKSTART.md`
3. **Need Supabase help?** → Read `docs/SUPABASE_SETUP.md`
4. **Forgot a command?** → Check `docs/COMMANDS.md`
5. **Want to understand code?** → Start with `backend/app/main.py`

## 📝 Notes

- All Python code uses **type hints** for clarity
- API uses **Pydantic models** for validation
- Tests use **pytest** framework
- Documentation uses **Markdown**
- CI/CD uses **GitHub Actions**

---

**Current Status**: ✅ Backend foundation complete
**Next Step**: Get it running locally! 🚀
