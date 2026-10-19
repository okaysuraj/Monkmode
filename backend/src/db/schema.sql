-- Monkmode Database Schema

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Chapters Table (Kage / Monkmode Journey)
CREATE TABLE IF NOT EXISTS chapters (
  id VARCHAR(50) PRIMARY KEY,
  order_index INTEGER NOT NULL UNIQUE,
  title VARCHAR(100) NOT NULL,
  japanese_title VARCHAR(50) NOT NULL,
  subtitle VARCHAR(255),
  duration_minutes INTEGER DEFAULT 15,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Rituals / Disciplines Table
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  japanese_title VARCHAR(50),
  description TEXT,
  category VARCHAR(50) DEFAULT 'discipline', -- discipline, meditation, physical, craft
  target_daily_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Daily Ritual Logs Table
CREATE TABLE IF NOT EXISTS ritual_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ritual_id UUID NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_ritual_per_day UNIQUE (ritual_id, completed_date)
);

-- 5. Focus & Meditation Sessions Table
CREATE TABLE IF NOT EXISTS focus_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  chapter_id VARCHAR(50) REFERENCES chapters(id) ON DELETE SET NULL,
  mode VARCHAR(50) DEFAULT 'deep_work', -- deep_work, zazen, meditation, reading
  duration_minutes INTEGER NOT NULL,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_focus_sessions_completed_at ON focus_sessions(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_ritual_logs_date ON ritual_logs(completed_date DESC);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(order_index ASC);
