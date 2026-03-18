-- ============================================
-- Cozy Calendar: Event Details Enhancement
-- Run this in your Supabase SQL Editor
-- ============================================

-- Add description and location columns
ALTER TABLE events ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE events ADD COLUMN IF NOT EXISTS location TEXT DEFAULT '';

-- Add proper time columns (start/end)
ALTER TABLE events ADD COLUMN IF NOT EXISTS start_time TIME;
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_time TIME;
