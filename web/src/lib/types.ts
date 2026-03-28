import type { ReactionType } from "./constants";

export interface Profile {
  id: string;
  role: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Artist {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  bio: string | null;
  short_bio: string | null;
  profile_image_url: string | null;
  banner_image_url: string | null;
  genre: string | null;
  streaming_links: Record<string, string>;
  social_links: Record<string, string>;
  video_urls: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author_id: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MerchItem {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  additional_images: string[];
  external_url: string | null;
  artist_id: string | null;
  category: string | null;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  artist?: Artist;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  city: string | null;
  state: string | null;
  country: string;
  event_date: string;
  event_time: string | null;
  doors_time: string | null;
  ticket_url: string | null;
  image_url: string | null;
  artist_id: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  artist?: Artist;
}

export interface Release {
  id: string;
  title: string;
  artist_id: string;
  release_type: string;
  release_date: string | null;
  cover_art_url: string | null;
  description: string | null;
  streaming_links: Record<string, string>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  artist?: Artist;
  artists?: ReleaseArtist[];
}

export interface ReleaseArtist {
  id: string;
  release_id: string;
  artist_id: string;
  role: string;
  sort_order: number;
  artist?: Artist;
}

export interface Video {
  id: string;
  title: string | null;
  youtube_url: string;
  description: string | null;
  thumbnail_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  artists?: VideoArtist[];
}

export interface VideoArtist {
  id: string;
  video_id: string;
  artist_id: string;
  sort_order: number;
  artist?: Artist;
}

export interface ArtistPost {
  id: string;
  artist_id: string | null;
  author_user_id: string | null;
  post_type: string;
  title: string | null;
  content: string;
  image_url: string | null;
  is_pinned: boolean;
  is_label_post: boolean;
  link_url: string | null;
  link_title: string | null;
  link_description: string | null;
  link_image: string | null;
  related_release_id: string | null;
  related_video_id: string | null;
  countdown_date: string | null;
  countdown_label: string | null;
  created_at: string;
  updated_at: string;
  artist_name?: string;
  artist_slug?: string | null;
  artist_image?: string;
  comment_count?: number;
  reaction_counts?: Record<ReactionType, number>;
  poll?: {
    options: { id: string; label: string; votes: number }[];
    total_votes: number;
    user_vote: string | null;
  } | null;
  tagged_artists?: {
    id: string;
    name: string;
    slug: string;
    profile_image_url: string | null;
  }[];
}

export interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface PostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction: ReactionType;
  created_at: string;
}

export interface FanFollow {
  id: string;
  fan_user_id: string;
  artist_id: string;
  created_at: string;
}

export interface FanFeedback {
  id: string;
  user_id: string | null;
  subject: string | null;
  message: string;
  category: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: string;
  recipient_user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  related_artist_id: string | null;
  related_post_id: string | null;
  is_read: boolean;
  created_at: string;
}
