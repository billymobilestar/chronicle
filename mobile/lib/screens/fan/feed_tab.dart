import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';
import 'package:chronicle_mobile/services/auth_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:timeago/timeago.dart' as timeago;

class FeedTab extends StatefulWidget {
  const FeedTab({super.key});
  @override
  State<FeedTab> createState() => _FeedTabState();
}

class _FeedTabState extends State<FeedTab> {
  List<Map<String, dynamic>> _posts = [];
  List<Map<String, dynamic>> _followedArtists = [];
  bool _loading = true;
  String _displayName = 'Fan';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final user = AuthService.currentUser;
    if (user == null) return;

    final supabase = Supabase.instance.client;
    final profile = await supabase.from('profiles').select('display_name').eq('id', user.id).single();
    _displayName = profile['display_name'] ?? 'Fan';

    // Get followed artists
    final follows = await supabase.from('fan_follows').select('artist_id').eq('fan_user_id', user.id);
    final followIds = List<String>.from(follows.map((f) => f['artist_id']));

    if (followIds.isNotEmpty) {
      final artists = await supabase.from('artists').select().inFilter('id', followIds).eq('is_active', true);
      _followedArtists = List<Map<String, dynamic>>.from(artists);
    }

    final posts = await DataService.getCommunityPosts();

    if (mounted) setState(() { _posts = posts; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : RefreshIndicator(
                onRefresh: _load,
                child: CustomScrollView(
                  slivers: [
                    // Header
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                        child: Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_getGreeting(), style: Theme.of(context).textTheme.bodySmall),
                                  Text(_displayName.toUpperCase(), style: Theme.of(context).textTheme.headlineMedium),
                                ],
                              ),
                            ),
                            GestureDetector(
                              onTap: () => context.push('/'),
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.asset('assets/logo.jpg', width: 40, height: 40),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    // Followed artists
                    if (_followedArtists.isNotEmpty)
                      SliverToBoxAdapter(
                        child: SizedBox(
                          height: 90,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                            itemCount: _followedArtists.length,
                            itemBuilder: (context, i) {
                              final a = _followedArtists[i];
                              return GestureDetector(
                                onTap: () => context.push('/artists/${a['slug']}'),
                                child: Container(
                                  width: 60,
                                  margin: const EdgeInsets.symmetric(horizontal: 4),
                                  child: Column(
                                    children: [
                                      CircleAvatar(
                                        radius: 26,
                                        backgroundColor: ChronicleTheme.cobalt,
                                        backgroundImage: a['profile_image_url'] != null ? CachedNetworkImageProvider(a['profile_image_url']) : null,
                                        child: a['profile_image_url'] == null ? Text(a['name'][0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)) : null,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(a['name'], style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.5), maxLines: 1, overflow: TextOverflow.ellipsis, textAlign: TextAlign.center),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),

                    // Posts
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
                        child: Text('YOUR FEED', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 14)),
                      ),
                    ),

                    _posts.isEmpty
                        ? const SliverToBoxAdapter(child: Padding(padding: EdgeInsets.all(40), child: Center(child: Text('Follow some artists to see posts here!'))))
                        : SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, i) => _PostCard(post: _posts[i]),
                              childCount: _posts.length,
                            ),
                          ),
                  ],
                ),
              ),
      ),
    );
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}

class _PostCard extends StatelessWidget {
  final Map<String, dynamic> post;
  const _PostCard({required this.post});

  @override
  Widget build(BuildContext context) {
    final isLabel = post['is_label_post'] == true;
    final artistName = isLabel ? 'Chronicle Records' : (post['artists']?['name'] ?? 'Artist');
    final artistImage = isLabel ? null : post['artists']?['profile_image_url'];
    final createdAt = DateTime.tryParse(post['created_at'] ?? '') ?? DateTime.now();

    return Card(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: ChronicleTheme.cobalt,
                  backgroundImage: artistImage != null ? CachedNetworkImageProvider(artistImage) : null,
                  child: artistImage == null ? Text(artistName[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)) : null,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(artistName.toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1)),
                      Text(timeago.format(createdAt), style: TextStyle(fontSize: 11, color: ChronicleTheme.cobalt.withValues(alpha: 0.3))),
                    ],
                  ),
                ),
              ],
            ),
            if (post['title'] != null) ...[
              const SizedBox(height: 12),
              Text(post['title'], style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
            ],
            if (post['content'] != null) ...[
              const SizedBox(height: 8),
              Text(post['content'], style: TextStyle(fontSize: 14, color: ChronicleTheme.cobalt.withValues(alpha: 0.7), height: 1.5)),
            ],
            if (post['image_url'] != null) ...[
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: CachedNetworkImage(imageUrl: post['image_url'], fit: BoxFit.cover, width: double.infinity),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
