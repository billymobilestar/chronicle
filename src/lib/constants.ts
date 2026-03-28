export const ROLES = {
  FAN: "fan",
  ARTIST: "artist",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const REACTION_TYPES = ["fire", "heart", "clap", "hundred", "mic"] as const;
export type ReactionType = (typeof REACTION_TYPES)[number];

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  fire: "\uD83D\uDD25",
  heart: "\u2764\uFE0F",
  clap: "\uD83D\uDC4F",
  hundred: "\uD83D\uDCAF",
  mic: "\uD83C\uDFA4",
};

export const STREAMING_PLATFORMS = [
  { key: "spotify", label: "Spotify", icon: "music" },
  { key: "apple_music", label: "Apple Music", icon: "music" },
  { key: "youtube_music", label: "YouTube Music", icon: "youtube" },
  { key: "soundcloud", label: "SoundCloud", icon: "cloud" },
  { key: "tidal", label: "Tidal", icon: "waves" },
  { key: "amazon_music", label: "Amazon Music", icon: "music" },
] as const;

export const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: "instagram" },
  { key: "twitter", label: "X (Twitter)", icon: "twitter" },
  { key: "tiktok", label: "TikTok", icon: "music-2" },
  { key: "youtube", label: "YouTube", icon: "youtube" },
  { key: "facebook", label: "Facebook", icon: "facebook" },
] as const;

export const POST_TYPES = [
  { value: "update", label: "Update" },
  { value: "announcement", label: "Announcement" },
  { value: "behind_the_scenes", label: "Behind the Scenes" },
  { value: "poll", label: "Poll" },
] as const;

export const RELEASE_TYPES = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Album" },
  { value: "mixtape", label: "Mixtape" },
] as const;

export const MERCH_CATEGORIES = [
  "apparel",
  "vinyl",
  "cd",
  "accessories",
  "posters",
  "other",
] as const;

export const FEEDBACK_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "bug", label: "Bug Report" },
  { value: "feature_request", label: "Feature Request" },
  { value: "artist_request", label: "Artist Request" },
] as const;
