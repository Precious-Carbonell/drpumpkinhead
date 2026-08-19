-- Run this in Supabase SQL Editor to create the expenditures table
-- This table tracks revenue allocation / where the money goes

CREATE TABLE IF NOT EXISTS expenditures (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL,           -- e.g. 'Art Supplies', 'Software', 'Food', 'Savings', etc.
  description TEXT DEFAULT '',      -- optional details
  amount NUMERIC(10, 2) NOT NULL,   -- amount spent (PHP)
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (optional but recommended)
ALTER TABLE expenditures ENABLE ROW LEVEL SECURITY;

-- Policy: allow all operations for service role (server-side)
CREATE POLICY "Service role full access" ON expenditures
  FOR ALL USING (true) WITH CHECK (true);
