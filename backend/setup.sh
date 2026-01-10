#!/bin/bash

echo "🚀 Metron Backend Setup Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the backend/ directory"
    exit 1
fi

echo ""
echo "${YELLOW}Step 1: Creating virtual environment...${NC}"
python3 -m venv venv
echo "${GREEN}✅ Virtual environment created${NC}"

echo ""
echo "${YELLOW}Step 2: Activating virtual environment...${NC}"
source venv/bin/activate
echo "${GREEN}✅ Virtual environment activated${NC}"

echo ""
echo "${YELLOW}Step 3: Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
echo "${GREEN}✅ Dependencies installed${NC}"

echo ""
echo "${YELLOW}Step 4: Setting up environment file...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "${GREEN}✅ .env file created${NC}"
    echo "${YELLOW}⚠️  Please edit .env and add your Supabase credentials${NC}"
else
    echo "${YELLOW}⚠️  .env already exists, skipping...${NC}"
fi

echo ""
echo "================================"
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env with your Supabase credentials"
echo "2. Run: source venv/bin/activate"
echo "3. Run: uvicorn app.main:app --reload"
echo "4. Visit: http://localhost:8000/docs"
echo ""
