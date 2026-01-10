@echo off
REM 🚀 Script d'automatisation Git pour Metron (Windows)
REM Usage: git-setup.bat <URL-DE-TON-REPO>

echo 🚀 Metron Git Setup Automation (Windows)
echo ================================
echo.

REM Check if URL is provided
if "%1"=="" (
    echo ❌ Erreur: URL du repository manquante
    echo.
    echo Usage: git-setup.bat ^<URL-DE-TON-REPO^>
    echo.
    echo Exemples:
    echo   git-setup.bat https://github.com/username/metron.git
    echo   git-setup.bat git@github.com:username/metron.git
    exit /b 1
)

set REPO_URL=%1

echo 🔍 Vérification de l'environnement...
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git n'est pas installé
    echo Installe Git d'abord: https://git-scm.com/downloads
    exit /b 1
)

echo ✅ Git est installé
git --version

REM Check if we're in metron directory
if not exist "README.md" (
    echo ❌ Ce script doit être exécuté depuis le dossier metron\
    exit /b 1
)
if not exist "backend" (
    echo ❌ Ce script doit être exécuté depuis le dossier metron\
    exit /b 1
)

echo ✅ Dossier metron détecté
echo.

echo 📦 Initialisation Git...
echo.

REM Initialize git if not already done
if not exist ".git" (
    git init
    echo ✅ Git initialisé
) else (
    echo ⚠️  Git déjà initialisé
)

echo.
echo 🔗 Configuration du remote...
echo.

REM Remove origin if exists
git remote remove origin 2>nul

REM Add remote
git remote add origin %REPO_URL%
echo ✅ Remote 'origin' configuré
echo.

REM Verify remote
echo Remote configuré:
git remote -v
echo.

echo 📝 Création du commit initial...
echo.

REM Add all files
git add .
echo ✅ Fichiers ajoutés

REM Create commit
git commit -m "feat: initial FastAPI backend setup with Supabase integration" -m "- Complete FastAPI architecture" -m "- Reverse Convertible pricing (Black-Scholes)" -m "- Market data integration (yfinance)" -m "- Supabase database connection" -m "- CI/CD pipelines (GitHub Actions)" -m "- Comprehensive documentation"

echo ✅ Commit créé
echo.

echo 🌿 Configuration des branches...
echo.

REM Rename to main if on master
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if "%CURRENT_BRANCH%"=="master" (
    git branch -M main
    echo ✅ Branche renommée en 'main'
)

echo.
echo 🚀 Push vers le repository distant...
echo.
echo ⚠️  Tu vas peut-être devoir entrer tes identifiants Git
echo.

REM Push to main
git push -u origin main
if errorlevel 1 (
    echo ❌ Erreur lors du push
    echo.
    echo Solutions possibles:
    echo 1. Vérifie tes identifiants Git
    echo 2. Vérifie que l'URL du repo est correcte
    echo 3. Vérifie que tu as les permissions sur le repo
    echo.
    echo Pour réessayer manuellement:
    echo   git push -u origin main
    exit /b 1
)

echo ✅ Code pushé sur la branche 'main'
echo.

echo 🌿 Création de la branche develop...
echo.

REM Create and push develop branch
git checkout -b develop
git push -u origin develop
echo ✅ Branche 'develop' créée et pushée

REM Go back to main
git checkout main

echo.
echo ================================
echo ✅ SETUP GIT TERMINÉ !
echo.
echo 📊 Résumé:
echo   - Repository: %REPO_URL%
echo   - Branches: main, develop
echo   - Commits: 1 (initial setup)
echo.
echo 🎯 Prochaines étapes:
echo   1. Va sur GitHub/GitLab et vérifie que tout est là
echo   2. Configure Supabase (voir docs\SUPABASE_SETUP.md)
echo   3. Lance le backend (voir docs\QUICKSTART.md)
echo   4. Partage le repo avec ton équipe
echo.
echo Bon dev ! 🚀
echo.
pause
