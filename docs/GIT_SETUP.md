# 🔗 Git Setup Guide

## Connect to Your Existing Repository

You already have an empty Git repository. Here's how to connect this project to it:

### Step 1: Initialize Local Git (if not done)

```bash
cd metron
git init
```

### Step 2: Add Your Remote Repository

Replace `<your-repo-url>` with your actual Git repository URL:

```bash
git remote add origin <your-repo-url>

# Example:
# git remote add origin https://github.com/username/metron.git
# OR
# git remote add origin git@github.com:username/metron.git
```

### Step 3: Create Initial Commit

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: FastAPI + Supabase setup"
```

### Step 4: Push to Remote

```bash
# Push to main branch
git push -u origin main

# Or if your default branch is 'master':
# git push -u origin master
```

## Branch Strategy

We recommend using this branching model:

```
main (production-ready)
  ├── develop (integration branch)
  │   ├── feature/pricing-reverse-convertible
  │   ├── feature/market-data
  │   └── feature/simulations
```

### Create Develop Branch

```bash
git checkout -b develop
git push -u origin develop
```

### Create Feature Branches

```bash
# Example: Working on pricing module
git checkout develop
git checkout -b feature/pricing-reverse-convertible

# Make changes...
git add .
git commit -m "Add reverse convertible pricing logic"

# Push feature branch
git push -u origin feature/pricing-reverse-convertible

# Create Pull Request on GitHub/GitLab
```

## Daily Workflow

```bash
# Start your day - get latest changes
git checkout develop
git pull

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit frequently
git add .
git commit -m "Descriptive commit message"

# Push to remote
git push

# When feature is done, create Pull Request to develop
```

## Useful Git Commands

```bash
# Check status
git status

# View commit history
git log --oneline

# Switch branches
git checkout branch-name

# See all branches
git branch -a

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard all local changes
git reset --hard HEAD
```

## GitHub Actions Setup

Your workflows are already configured in `.github/workflows/`:
- `backend-ci.yml` - Runs tests on backend changes
- `frontend-ci.yml` - Will run frontend tests (when you add frontend)

### Add Secrets to GitHub

1. Go to your repository on GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_KEY` - Your Supabase anon key

Now GitHub Actions will run tests automatically on every push!

## Team Collaboration Tips

1. **Never commit directly to main** - Always use feature branches
2. **Pull before you push** - `git pull` to get latest changes
3. **Write clear commit messages** - "Add user authentication" not "update"
4. **Small, frequent commits** - Better than one giant commit
5. **Review each other's code** - Use Pull Requests

## Commit Message Convention

Use this format for clear commits:

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Formatting, no code change
- refactor: Code restructuring
- test: Adding tests
- chore: Maintenance

Examples:
feat: add reverse convertible pricing endpoint
fix: correct volatility calculation
docs: update Supabase setup guide
test: add tests for market data API
```

## Emergency: Messed Up Git?

```bash
# Undo all local changes (nuclear option)
git reset --hard origin/develop

# Or just stash changes for later
git stash
git stash list  # See stashed changes
git stash pop   # Restore stashed changes
```

## 🎯 Quick Checklist

- [ ] `git remote add origin <your-repo-url>`
- [ ] `git add .`
- [ ] `git commit -m "Initial commit"`
- [ ] `git push -u origin main`
- [ ] Create `develop` branch
- [ ] Add GitHub secrets (SUPABASE_URL, SUPABASE_KEY)
- [ ] Team members clone repository
- [ ] Start working on feature branches! 🚀
