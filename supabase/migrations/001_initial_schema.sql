-- ============================================================
-- Chronicle Records Fan Portal - Supabase Database Schema
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('fan', 'artist', 'admin');
CREATE TYPE post_type AS ENUM ('announcement', 'update', 'behind_the_scenes', 'poll');
CREATE TYPE reaction_type AS ENUM ('fire', 'heart', 'clap', 'hundred', 'mic');
CREATE TYPE notification_type AS ENUM (
  'new_post', 'post_comment', 'post_reaction',
  'new_release', 'new_event', 'new_announcement', 'welcome'
);

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'fan',
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, display_name, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'fan'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ARTISTS
-- ============================================================

CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  short_bio TEXT,
  profile_image_url TEXT,
  banner_image_url TEXT,
  genre TEXT,
  streaming_links JSONB DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  video_urls TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_artists_slug ON artists(slug);
CREATE INDEX idx_artists_user_id ON artists(user_id);
CREATE INDEX idx_artists_name_trgm ON artists USING gin(name gin_trgm_ops);

-- ============================================================
-- ANNOUNCEMENTS / NEWS
-- ============================================================

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image_url TEXT,
  author_id UUID REFERENCES profiles(id),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_announcements_published ON announcements(is_published, published_at DESC);
CREATE INDEX idx_announcements_title_trgm ON announcements USING gin(title gin_trgm_ops);

-- ============================================================
-- MERCH ITEMS
-- ============================================================

CREATE TABLE merch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  image_url TEXT,
  additional_images TEXT[] DEFAULT '{}',
  external_url TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  category TEXT,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_merch_available ON merch_items(is_available, sort_order);
CREATE INDEX idx_merch_name_trgm ON merch_items USING gin(name gin_trgm_ops);

-- ============================================================
-- EVENTS
-- ============================================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'US',
  event_date DATE NOT NULL,
  event_time TIME,
  doors_time TIME,
  ticket_url TEXT,
  image_url TEXT,
  artist_id UUID REFERENCES artists(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date DESC);
CREATE INDEX idx_events_upcoming ON events(event_date ASC);

-- ============================================================
-- MUSIC RELEASES
-- ============================================================

CREATE TABLE releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  release_type TEXT NOT NULL DEFAULT 'single',
  release_date DATE,
  cover_art_url TEXT,
  description TEXT,
  streaming_links JSONB DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_releases_date ON releases(release_date DESC);
CREATE INDEX idx_releases_artist ON releases(artist_id);

-- ============================================================
-- ARTIST POSTS (Community Feed)
-- ============================================================

CREATE TABLE artist_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES auth.users(id),
  post_type post_type NOT NULL DEFAULT 'update',
  title TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_artist ON artist_posts(artist_id, created_at DESC);
CREATE INDEX idx_posts_feed ON artist_posts(created_at DESC);

-- ============================================================
-- POST COMMENTS
-- ============================================================

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES artist_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON post_comments(post_id, created_at ASC);

-- ============================================================
-- POST REACTIONS
-- ============================================================

CREATE TABLE post_reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES artist_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction reaction_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction)
);

CREATE INDEX idx_reactions_post ON post_reactions(post_id);

-- ============================================================
-- FAN FOLLOWS
-- ============================================================

CREATE TABLE fan_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fan_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(fan_user_id, artist_id)
);

CREATE INDEX idx_follows_fan ON fan_follows(fan_user_id);
CREATE INDEX idx_follows_artist ON fan_follows(artist_id);

-- ============================================================
-- FAN FEEDBACK
-- ============================================================

CREATE TABLE fan_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT,
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedback_unread ON fan_feedback(is_read, created_at DESC);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  related_artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  related_post_id UUID REFERENCES artist_posts(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id, is_read, created_at DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE merch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON profiles FOR UPDATE USING (is_admin());

-- ARTISTS
CREATE POLICY "Anyone can view active artists" ON artists FOR SELECT USING (is_active = true OR is_admin() OR user_id = auth.uid());
CREATE POLICY "Admins can insert artists" ON artists FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update artists" ON artists FOR UPDATE USING (is_admin());
CREATE POLICY "Artists can update own" ON artists FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can delete artists" ON artists FOR DELETE USING (is_admin());

-- ANNOUNCEMENTS
CREATE POLICY "Anyone can view published" ON announcements FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Admins can manage" ON announcements FOR ALL USING (is_admin());

-- MERCH
CREATE POLICY "Anyone can view available merch" ON merch_items FOR SELECT USING (is_available = true OR is_admin());
CREATE POLICY "Admins can manage merch" ON merch_items FOR ALL USING (is_admin());

-- EVENTS
CREATE POLICY "Anyone can view published events" ON events FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (is_admin());

-- RELEASES
CREATE POLICY "Anyone can view published releases" ON releases FOR SELECT USING (is_published = true OR is_admin());
CREATE POLICY "Admins can manage releases" ON releases FOR ALL USING (is_admin());

-- ARTIST POSTS
CREATE POLICY "Anyone can view posts" ON artist_posts FOR SELECT USING (true);
CREATE POLICY "Artists can create posts" ON artist_posts FOR INSERT
  WITH CHECK (author_user_id = auth.uid() AND EXISTS (SELECT 1 FROM artists WHERE id = artist_id AND user_id = auth.uid()));
CREATE POLICY "Authors can update own posts" ON artist_posts FOR UPDATE USING (author_user_id = auth.uid() OR is_admin());
CREATE POLICY "Authors can delete own posts" ON artist_posts FOR DELETE USING (author_user_id = auth.uid() OR is_admin());

-- COMMENTS
CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can comment" ON post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own" ON post_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own or admin" ON post_comments FOR DELETE USING (auth.uid() = user_id OR is_admin());

-- REACTIONS
CREATE POLICY "Anyone can view reactions" ON post_reactions FOR SELECT USING (true);
CREATE POLICY "Auth users can react" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS
CREATE POLICY "Anyone can view follows" ON fan_follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON fan_follows FOR INSERT WITH CHECK (auth.uid() = fan_user_id);
CREATE POLICY "Users can unfollow" ON fan_follows FOR DELETE USING (auth.uid() = fan_user_id);

-- FEEDBACK
CREATE POLICY "Users can submit feedback" ON fan_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own or admin" ON fan_feedback FOR SELECT USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "Admins can update feedback" ON fan_feedback FOR UPDATE USING (is_admin());

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = recipient_user_id);
CREATE POLICY "Users can mark own as read" ON notifications FOR UPDATE USING (auth.uid() = recipient_user_id);

-- ============================================================
-- REALTIME
-- ============================================================

ALTER PUBLICATION supabase_realtime ADD TABLE artist_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE post_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================
-- AUTO-UPDATE TIMESTAMPS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON artists FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON merch_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON releases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON artist_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON post_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- NOTIFICATION TRIGGER: Notify followers when artist posts
-- ============================================================

CREATE OR REPLACE FUNCTION notify_followers_on_post()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (recipient_user_id, type, title, body, link, related_artist_id, related_post_id)
  SELECT
    ff.fan_user_id,
    'new_post',
    (SELECT name FROM artists WHERE id = NEW.artist_id) || ' posted an update',
    LEFT(NEW.content, 100),
    '/community',
    NEW.artist_id,
    NEW.id
  FROM fan_follows ff
  WHERE ff.artist_id = NEW.artist_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_artist_post_created
  AFTER INSERT ON artist_posts
  FOR EACH ROW EXECUTE FUNCTION notify_followers_on_post();

-- ============================================================
-- STORAGE BUCKETS (create via Supabase Dashboard)
-- ============================================================
-- 1. artist-images   (public)
-- 2. merch-images    (public)
-- 3. news-images     (public)
-- 4. release-covers  (public)
-- 5. post-images     (public)
-- 6. avatars         (public)
