-- Fix Supabase Database Schema for GovAI
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. Check if votes table exists and drop if needed
DROP TABLE IF EXISTS votes CASCADE;

-- 2. Recreate votes table with correct schema
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

-- 3. Add index for faster queries
CREATE INDEX idx_votes_poll_id ON votes(poll_id);
CREATE INDEX idx_votes_wallet ON votes(wallet_address);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 5. Create policy to allow all operations (for development)
-- In production, you should restrict this!
CREATE POLICY "Allow all operations on votes" ON votes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Verify the table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

