-- ============================================
-- Cozy Calendar: Custom Stickers
-- Run this in your Supabase SQL Editor
-- ============================================

-- Custom stickers uploaded by users
CREATE TABLE IF NOT EXISTS custom_stickers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Custom Sticker',
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE custom_stickers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own custom stickers"
  ON custom_stickers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Also create a storage bucket for sticker images
-- NOTE: Run this separately if it doesn't work in a batch:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('stickers', 'stickers', true);
