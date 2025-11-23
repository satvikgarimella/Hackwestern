-- Complete Database Schema for GovAI
-- Run this in Supabase SQL Editor to create/fix all tables

-- =======================
-- 1. POLLS TABLE
-- =======================
DROP TABLE IF EXISTS polls CASCADE;

CREATE TABLE polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT UNIQUE NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_polls_poll_id ON polls(poll_id);

ALTER TABLE polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on polls" ON polls
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =======================
-- 2. VOTES TABLE
-- =======================
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

-- =======================
-- 3. AGENT ANALYSES TABLE
-- =======================
DROP TABLE IF EXISTS agent_analyses CASCADE;

CREATE TABLE agent_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  risk_score INTEGER,
  flags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analyses_poll_id ON agent_analyses(poll_id);
CREATE INDEX idx_analyses_agent_type ON agent_analyses(agent_type);

ALTER TABLE agent_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on agent_analyses" ON agent_analyses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =======================
-- 4. VERIFY ALL TABLES
-- =======================
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('polls', 'votes', 'agent_analyses')
ORDER BY table_name;

-- Show all columns for votes table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'votes'
ORDER BY ordinal_position;

