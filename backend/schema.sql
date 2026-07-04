-- Supabase SQL Schema (Run in Supabase SQL Editor)
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  plan          TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  switches_today INT DEFAULT 0,
  switches_total INT DEFAULT 0,
  last_reset    DATE DEFAULT CURRENT_DATE,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Switch events (analytics)
CREATE TABLE IF NOT EXISTS switch_events (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_ai    TEXT NOT NULL,
  to_ai      TEXT NOT NULL,
  chars      INT,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- DOM Selectors (remote update)
CREATE TABLE IF NOT EXISTS selectors (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_name       TEXT NOT NULL,
  selector_type TEXT NOT NULL CHECK (selector_type IN ('scrape', 'inject')),
  selector_val  TEXT NOT NULL,
  priority      INT DEFAULT 1,
  is_active     BOOLEAN DEFAULT true,
  updated_at    TIMESTAMP DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE switch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE selectors ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users read own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Selectors are public read" ON selectors FOR SELECT USING (true);
CREATE POLICY "Anyone can insert events" ON switch_events FOR INSERT WITH CHECK (true);
