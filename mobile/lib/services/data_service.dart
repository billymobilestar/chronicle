import 'package:supabase_flutter/supabase_flutter.dart';

class DataService {
  static final _supabase = Supabase.instance.client;

  // ==================== Artists ====================
  static Future<List<Map<String, dynamic>>> getArtists() async {
    final data = await _supabase
        .from('artists')
        .select()
        .eq('is_active', true)
        .order('name');
    return List<Map<String, dynamic>>.from(data);
  }

  static Future<List<Map<String, dynamic>>> getFeaturedArtists() async {
    final data = await _supabase
        .from('artists')
        .select()
        .eq('is_active', true)
        .eq('is_featured', true)
        .order('name')
        .limit(8);
    return List<Map<String, dynamic>>.from(data);
  }

  static Future<Map<String, dynamic>?> getArtistBySlug(String slug) async {
    final data = await _supabase
        .from('artists')
        .select()
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
    return data;
  }

  // ==================== Releases ====================
  static Future<List<Map<String, dynamic>>> getReleases() async {
    final data = await _supabase
        .from('releases')
        .select('*, artist:artists(id, name, slug)')
        .eq('is_published', true)
        .order('release_date', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  static Future<List<Map<String, dynamic>>> getArtistReleases(String artistId) async {
    final links = await _supabase
        .from('release_artists')
        .select('release_id')
        .eq('artist_id', artistId);

    final ids = List<String>.from(links.map((l) => l['release_id']));
    if (ids.isEmpty) return [];

    final data = await _supabase
        .from('releases')
        .select()
        .inFilter('id', ids)
        .eq('is_published', true)
        .order('release_date', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  // ==================== Videos ====================
  static Future<List<Map<String, dynamic>>> getArtistVideos(String artistId) async {
    final links = await _supabase
        .from('video_artists')
        .select('video_id')
        .eq('artist_id', artistId);

    final ids = List<String>.from(links.map((l) => l['video_id']));
    if (ids.isEmpty) return [];

    final data = await _supabase
        .from('videos')
        .select()
        .inFilter('id', ids)
        .eq('is_published', true)
        .order('sort_order');
    return List<Map<String, dynamic>>.from(data);
  }

  // ==================== News ====================
  static Future<List<Map<String, dynamic>>> getNews() async {
    final data = await _supabase
        .from('announcements')
        .select()
        .eq('is_published', true)
        .order('published_at', ascending: false);
    return List<Map<String, dynamic>>.from(data);
  }

  // ==================== Events ====================
  static Future<List<Map<String, dynamic>>> getUpcomingEvents() async {
    final data = await _supabase
        .from('events')
        .select('*, artist:artists(id, name, slug)')
        .eq('is_published', true)
        .gte('event_date', DateTime.now().toIso8601String().split('T')[0])
        .order('event_date');
    return List<Map<String, dynamic>>.from(data);
  }

  // ==================== Merch ====================
  static Future<List<Map<String, dynamic>>> getMerch() async {
    final data = await _supabase
        .from('merch_items')
        .select('*, artist:artists(id, name, slug)')
        .eq('is_available', true)
        .order('sort_order');
    return List<Map<String, dynamic>>.from(data);
  }

  // ==================== Community Posts ====================
  static Future<List<Map<String, dynamic>>> getCommunityPosts() async {
    final data = await _supabase
        .from('artist_posts')
        .select('*, artists(name, slug, profile_image_url)')
        .order('is_pinned', ascending: false)
        .order('created_at', ascending: false)
        .limit(50);
    return List<Map<String, dynamic>>.from(data);
  }

  // ==================== Follows ====================
  static Future<bool> isFollowing(String artistId) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return false;

    final data = await _supabase
        .from('fan_follows')
        .select('id')
        .eq('fan_user_id', user.id)
        .eq('artist_id', artistId)
        .maybeSingle();
    return data != null;
  }

  static Future<void> followArtist(String artistId) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    await _supabase.from('fan_follows').insert({
      'fan_user_id': user.id,
      'artist_id': artistId,
    });
  }

  static Future<void> unfollowArtist(String artistId) async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user == null) return;

    await _supabase
        .from('fan_follows')
        .delete()
        .eq('fan_user_id', user.id)
        .eq('artist_id', artistId);
  }

  static Future<int> getFollowerCount(String artistId) async {
    final data = await _supabase
        .from('fan_follows')
        .select('id')
        .eq('artist_id', artistId);
    return data.length;
  }
}
