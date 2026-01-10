# 🗄️ Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - **Project name**: Metron
   - **Database password**: (choose a strong password)
   - **Region**: Choose closest to you (Europe West for France)
5. Click "Create new project" (takes ~2 minutes)

## 2. Get Your API Keys

Once project is created:

1. Go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`
   - **service_role** key → `SUPABASE_SERVICE_KEY` (⚠️ Keep this secret!)

3. Paste them in `backend/.env`:
```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Create Database Tables

Go to **SQL Editor** in Supabase dashboard and run this:

```sql
-- Users table (Supabase Auth handles this automatically)

-- Simulations table
CREATE TABLE simulations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_type TEXT NOT NULL,
  ticker TEXT NOT NULL,
  parameters JSONB NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX simulations_user_id_idx ON simulations(user_id);
CREATE INDEX simulations_created_at_idx ON simulations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own simulations
CREATE POLICY "Users can view own simulations"
  ON simulations FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own simulations
CREATE POLICY "Users can insert own simulations"
  ON simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own simulations
CREATE POLICY "Users can delete own simulations"
  ON simulations FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable:
   - ✅ **Email** (default, already enabled)
   - Optional: **Google**, **GitHub** (for social login)

## 5. Test Connection

Run this in your backend:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -c "from app.database import get_supabase; print(get_supabase())"
```

If you see a Supabase client object → ✅ Connection works!

## 6. Optional: Get Database Connection String

For direct PostgreSQL access (optional):

1. **Settings** → **Database**
2. Scroll to "Connection string"
3. Copy the **URI** format
4. Replace `[YOUR-PASSWORD]` with your database password
5. Add to `.env` as `DATABASE_URL`

## 🔒 Security Checklist

- ✅ Never commit `.env` file to Git
- ✅ Use `service_role` key only in backend (never in frontend)
- ✅ Enable RLS on all tables
- ✅ Test authentication flows

## 🎯 Next Steps

1. ✅ Create Supabase project
2. ✅ Copy API keys to `.env`
3. ✅ Run SQL schema
4. ✅ Test connection
5. → Start building! 🚀
