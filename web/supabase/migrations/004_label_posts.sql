-- ============================================================
-- Migration 004: Label Posts, Polls, Countdowns, Link Previews
-- ============================================================

-- Expand post_type: convert enum to text
ALTER TABLE artist_posts ALTER COLUMN post_type DROP DEFAULT;
ALTER TABLE artist_posts ALTER COLUMN post_type TYPE TEXT USING post_type::TEXT;
ALTER TABLE artist_posts ALTER COLUMN post_type SET DEFAULT 'update';
DROP TYPE IF EXISTS post_type;

-- Add new columns to artist_posts for rich post types
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS link_title TEXT;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS link_description TEXT;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS link_image TEXT;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS related_release_id UUID REFERENCES releases(id) ON DELETE SET NULL;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS related_video_id UUID REFERENCES videos(id) ON DELETE SET NULL;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS countdown_date TIMESTAMPTZ;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS countdown_label TEXT;
ALTER TABLE artist_posts ADD COLUMN IF NOT EXISTS is_label_post BOOLEAN NOT NULL DEFAULT FALSE;

-- Make artist_id nullable (label posts have no artist)
ALTER TABLE artist_posts ALTER COLUMN artist_id DROP NOT NULL;
ALTER TABLE artist_posts ALTER COLUMN author_user_id DROP NOT NULL;

-- ============================================================
-- POLLS
-- ============================================================

CREATE TABLE poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES artist_posts(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_poll_options_post ON poll_options(post_id, sort_order);

CREATE TABLE poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(option_id, user_id)
);

CREATE INDEX idx_poll_votes_option ON poll_votes(option_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);

-- Prevent voting on multiple options in the same poll
CREATE OR REPLACE FUNCTION check_single_vote_per_poll()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM poll_votes pv
    JOIN poll_options po ON po.id = pv.option_id
    WHERE po.post_id = (SELECT post_id FROM poll_options WHERE id = NEW.option_id)
    AND pv.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User has already voted in this poll';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_single_vote
  BEFORE INSERT ON poll_votes
  FOR EACH ROW EXECUTE FUNCTION check_single_vote_per_poll();

-- RLS
ALTER TABLE poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll options" ON poll_options FOR SELECT USING (true);
CREATE POLICY "Admins can manage poll options" ON poll_options FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view poll votes" ON poll_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON poll_votes FOR DELETE USING (auth.uid() = user_id);

-- Update RLS on artist_posts to allow label posts (artist_id is null)
DROP POLICY IF EXISTS "Artists can create posts" ON artist_posts;
CREATE POLICY "Artists and admins can create posts" ON artist_posts FOR INSERT
  WITH CHECK (
    -- Artist posting for their artist profile
    (author_user_id = auth.uid() AND artist_id IS NOT NULL AND EXISTS (SELECT 1 FROM artists WHERE id = artist_id AND user_id = auth.uid()))
    OR
    -- Admin posting as label
    (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  );
