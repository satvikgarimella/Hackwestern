# 🔧 Fix Database Schema - Quick Guide

## Problem
Your Supabase database is missing the `signature` column in the `votes` table. This is causing the voting to fail.

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to **[https://supabase.com/dashboard](https://supabase.com/dashboard)**
2. Select your GovAI project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New Query"**

### Step 2: Run the Fix Script
Copy and paste this SQL into the editor:

```sql
-- Fix votes table schema
DROP TABLE IF EXISTS votes CASCADE;

CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  vote_option TEXT NOT NULL,
  signature TEXT NOT NULL,
  wallet_age_days INTEGER,
  sol_balance NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, wallet_address)
);

CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_wallet ON votes(wallet_address);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on votes" ON votes
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### Step 3: Click "Run" Button
- Wait for "Success. No rows returned"
- This means the table was created correctly

### Step 4: Test Voting Again
1. Go back to **http://localhost:3000**
2. Make sure your wallet is connected
3. Try voting on any poll
4. You should see **"Vote Recorded! 🎉"**

---

## 🔄 Complete Database Reset (If needed)

If you want to recreate ALL tables (polls, votes, agent_analyses):

1. Open **Supabase SQL Editor**
2. Copy the contents of `fix-all-tables.sql` from your project
3. Paste into SQL Editor
4. Click **Run**

This will:
- ✓ Drop and recreate all tables
- ✓ Add proper indexes for performance
- ✓ Set up Row Level Security policies
- ✓ Verify the schema is correct

---

## 📊 Verify Schema

After running the fix, verify your tables exist:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('polls', 'votes', 'agent_analyses');

-- Check votes table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'votes' 
ORDER BY ordinal_position;
```

You should see these columns in `votes`:
- ✓ id (uuid)
- ✓ poll_id (text)
- ✓ wallet_address (text)
- ✓ vote_option (text)
- ✓ **signature (text)** ← This was missing!
- ✓ wallet_age_days (integer)
- ✓ sol_balance (numeric)
- ✓ created_at (timestamp)

---

## 🎯 Quick Test After Fix

```bash
# Test vote submission directly
curl -X POST http://localhost:8000/api/vote \
  -H "Content-Type: application/json" \
  -d '{
    "poll_id": "test-poll",
    "wallet_address": "TestWallet123",
    "vote_option": "yes",
    "signature": "test_signature_123",
    "wallet_age_days": 30,
    "sol_balance": 1.5
  }'
```

Should return:
```json
{
  "success": true,
  "vote_recorded": true,
  "whale_watch_analysis": {...}
}
```

---

## ⚠️ Important Notes

1. **This will delete existing votes** - If you have test data you want to keep, skip the DROP TABLE line
2. **RLS Policies** - The policy allows all operations. In production, restrict this!
3. **Backup** - Supabase keeps automatic backups, but you can export data first if needed

---

## 🐛 Still Not Working?

Check:
1. ✓ SQL ran without errors
2. ✓ Table shows up in Supabase Table Editor
3. ✓ Columns match the schema above
4. ✓ Backend is running (`curl http://localhost:8000/health`)
5. ✓ Environment variables are set (`python check-env.py`)

If vote still fails, check browser console (F12) for the exact error message.

