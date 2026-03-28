-- ============================================================
-- Migration 005: Tag artists on community posts
-- ============================================================

CREATE TABLE IF NOT EXISTS post_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES artist_posts(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  UNIQUE(post_id, artist_id)
);

CREATE INDEX idx_post_artists_post ON post_artists(post_id);
CREATE INDEX idx_post_artists_artist ON post_artists(artist_id);

ALTER TABLE post_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view post artists" ON post_artists FOR SELECT USING (true);
CREATE POLICY "Admins can manage post artists" ON post_artists FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
