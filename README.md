# 📊 Metron - Plateforme Intelligente de Produits Structurés

Outil d'aide à la décision combinant modélisation financière et IA pour évaluer la juste valeur des produits structurés, détecter les opportunités d'arbitrage et personnaliser les recommandations selon le profil de risque. Intègre un **module éducatif interactif** (tutoriels, simulateurs, visualisations) pour rendre ces instruments accessibles.

## 🏗️ Architecture

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Auth)
- **Pricing**: NumPy, SciPy, QuantLib
- **Data**: yfinance

## 🚀 Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📅 Roadmap

- [x] Week 1: Architecture setup - Frontend, Accounts infrastructure, Database implementation
- [x] Week 2: Pricing Engine - Reverse Convertible, Autocall, Warrant/Turbo, Capital Guaranteed
- [x] Week 3: Educational content - Courses, Tutorials, Glossary, Quiz
- [x] Week 4: Polish + Demo

## 👥 Team

6 students - 4 Finance, 1 Embedded Systems, 1 Data/AI

## 📝 License

MIT
