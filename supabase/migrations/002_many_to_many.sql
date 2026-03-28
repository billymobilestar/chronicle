-- ============================================================
-- Migration 002: Many-to-Many for Releases & Videos
-- ============================================================

-- ============================================================
-- 1. RELEASE_ARTISTS join table
-- ============================================================

CREATE TABLE release_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  release_id UUID NOT NULL REFERENCES releases(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'primary',  -- 'primary', 'featured', 'producer', 'remix'
  sort_order INTEGER DEFAULT 0,
  UNIQUE(release_id, artist_id)
);

CREATE INDEX idx_release_artists_release ON release_artists(release_id);
CREATE INDEX idx_release_artists_artist ON release_artists(artist_id);

-- Migrate existing releases: insert into join table from current artist_id column
INSERT INTO release_artists (release_id, artist_id, role, sort_order)
SELECT id, artist_id, 'primary', 0
FROM releases
WHERE artist_id IS NOT NULL;

-- Keep artist_id on releases for now as a convenience (primary artist),
-- but the join table is the source of truth for all collaborators.

-- RLS
ALTER TABLE release_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view release artists" ON release_artists FOR SELECT USING (true);
CREATE POLICY "Admins can manage release artists" ON release_artists FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- 2. VIDEOS table (replaces video_urls array on artists)
-- ============================================================

CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  youtube_url TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_videos_published ON videos(is_published, sort_order);

-- Auto-update timestamp
CREATE TRIGGER set_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 3. VIDEO_ARTISTS join table
-- ============================================================

CREATE TABLE video_artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(video_id, artist_id)
);

CREATE INDEX idx_video_artists_video ON video_artists(video_id);
CREATE INDEX idx_video_artists_artist ON video_artists(artist_id);

-- Migrate existing video_urls from artists into the videos table
-- Each URL becomes a video linked to its original artist
DO $$
DECLARE
  r RECORD;
  url TEXT;
  vid_id UUID;
BEGIN
  FOR r IN SELECT id, video_urls FROM artists WHERE video_urls IS NOT NULL AND array_length(video_urls, 1) > 0 LOOP
    FOREACH url IN ARRAY r.video_urls LOOP
      vid_id := uuid_generate_v4();
      INSERT INTO videos (id, youtube_url) VALUES (vid_id, url);
      INSERT INTO video_artists (video_id, artist_id) VALUES (vid_id, r.id);
    END LOOP;
  END LOOP;
END;
$$;

-- RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published videos" ON videos FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can manage videos" ON videos FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

ALTER TABLE video_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view video artists" ON video_artists FOR SELECT USING (true);
CREATE POLICY "Admins can manage video artists" ON video_artists FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
