#!/bin/bash

# 🚀 Script d'automatisation Git pour Metron
# Usage: ./git-setup.sh <URL-DE-TON-REPO>

echo "🚀 Metron Git Setup Automation"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if URL is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erreur: URL du repository manquante${NC}"
    echo ""
    echo "Usage: ./git-setup.sh <URL-DE-TON-REPO>"
    echo ""
    echo "Exemples:"
    echo "  ./git-setup.sh https://github.com/username/metron.git"
    echo "  ./git-setup.sh git@github.com:username/metron.git"
    exit 1
fi

REPO_URL=$1

echo ""
echo "${YELLOW}🔍 Vérification de l'environnement...${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git n'est pas installé${NC}"
    echo "Installe Git d'abord: https://git-scm.com/downloads"
    exit 1
fi

echo -e "${GREEN}✅ Git est installé ($(git --version))${NC}"

# Check if we're in metron directory
if [ ! -f "README.md" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Ce script doit être exécuté depuis le dossier metron/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dossier metron détecté${NC}"

echo ""
echo "${YELLOW}📦 Initialisation Git...${NC}"

# Initialize git if not already done
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✅ Git initialisé${NC}"
else
    echo -e "${YELLOW}⚠️  Git déjà initialisé${NC}"
fi

echo ""
echo "${YELLOW}🔗 Configuration du remote...${NC}"

# Remove origin if exists
git remote remove origin 2>/dev/null

# Add remote
git remote add origin "$REPO_URL"
echo -e "${GREEN}✅ Remote 'origin' configuré${NC}"

# Verify remote
echo ""
echo "Remote configuré:"
git remote -v

echo ""
echo "${YELLOW}📝 Création du commit initial...${NC}"

# Add all files
git add .
echo -e "${GREEN}✅ Fichiers ajoutés${NC}"

# Create commit
git commit -m "feat: initial FastAPI backend setup with Supabase integration

- Complete FastAPI architecture
- Reverse Convertible pricing (Black-Scholes)
- Market data integration (yfinance)
- Supabase database connection
- CI/CD pipelines (GitHub Actions)
- Comprehensive documentation"

echo -e "${GREEN}✅ Commit créé${NC}"

echo ""
echo "${YELLOW}🌿 Configuration des branches...${NC}"

# Rename to main if on master
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" = "master" ]; then
    git branch -M main
    echo -e "${GREEN}✅ Branche renommée en 'main'${NC}"
fi

echo ""
echo "${YELLOW}🚀 Push vers le repository distant...${NC}"
echo ""
echo -e "${YELLOW}⚠️  Tu vas peut-être devoir entrer tes identifiants Git${NC}"
echo ""

# Push to main
if git push -u origin main; then
    echo -e "${GREEN}✅ Code pushé sur la branche 'main'${NC}"
else
    echo -e "${RED}❌ Erreur lors du push${NC}"
    echo ""
    echo "Solutions possibles:"
    echo "1. Vérifie tes identifiants Git"
    echo "2. Vérifie que l'URL du repo est correcte"
    echo "3. Vérifie que tu as les permissions sur le repo"
    echo ""
    echo "Pour réessayer manuellement:"
    echo "  git push -u origin main"
    exit 1
fi

echo ""
echo "${YELLOW}🌿 Création de la branche develop...${NC}"

# Create and push develop branch
git checkout -b develop
git push -u origin develop
echo -e "${GREEN}✅ Branche 'develop' créée et pushée${NC}"

# Go back to main
git checkout main

echo ""
echo "================================"
echo -e "${GREEN}✅ SETUP GIT TERMINÉ !${NC}"
echo ""
echo "📊 Résumé:"
echo "  - Repository: $REPO_URL"
echo "  - Branches: main, develop"
echo "  - Commits: 1 (initial setup)"
echo ""
echo "🎯 Prochaines étapes:"
echo "  1. Va sur GitHub/GitLab et vérifie que tout est là"
echo "  2. Configure Supabase (voir docs/SUPABASE_SETUP.md)"
echo "  3. Lance le backend (voir docs/QUICKSTART.md)"
echo "  4. Partage le repo avec ton équipe"
echo ""
echo -e "${GREEN}Bon dev ! 🚀${NC}"
