import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';
import 'package:chronicle_mobile/services/auth_service.dart';

class ArtistProfileScreen extends StatefulWidget {
  final String slug;
  const ArtistProfileScreen({super.key, required this.slug});

  @override
  State<ArtistProfileScreen> createState() => _ArtistProfileScreenState();
}

class _ArtistProfileScreenState extends State<ArtistProfileScreen> {
  Map<String, dynamic>? _artist;
  List<Map<String, dynamic>> _releases = [];
  List<Map<String, dynamic>> _videos = [];
  bool _loading = true;
  bool _following = false;
  int _followers = 0;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final artist = await DataService.getArtistBySlug(widget.slug);
    if (artist == null) { if (mounted) setState(() { _loading = false; }); return; }

    final releases = await DataService.getArtistReleases(artist['id']);
    final videos = await DataService.getArtistVideos(artist['id']);
    final followers = await DataService.getFollowerCount(artist['id']);
    final following = await DataService.isFollowing(artist['id']);

    if (mounted) {
      setState(() {
        _artist = artist;
        _releases = releases;
        _videos = videos;
        _followers = followers;
        _following = following;
        _loading = false;
      });
    }
  }

  Future<void> _toggleFollow() async {
    if (!AuthService.isSignedIn || _artist == null) return;
    if (_following) {
      await DataService.unfollowArtist(_artist!['id']);
      setState(() { _following = false; _followers--; });
    } else {
      await DataService.followArtist(_artist!['id']);
      setState(() { _following = true; _followers++; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    if (_artist == null) return const Scaffold(body: Center(child: Text('Artist not found')));

    final artist = _artist!;
    final streamingLinks = Map<String, String>.from(artist['streaming_links'] ?? {});

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Banner + profile
          SliverToBoxAdapter(
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    color: ChronicleTheme.cobalt,
                    image: artist['banner_image_url'] != null
                        ? DecorationImage(image: CachedNetworkImageProvider(artist['banner_image_url']), fit: BoxFit.cover)
                        : null,
                  ),
                  child: Container(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black.withValues(alpha: 0.5)]))),
                ),
                Positioned(
                  top: 40,
                  left: 16,
                  child: GestureDetector(
                    onTap: () => Navigator.canPop(context) ? Navigator.pop(context) : context.go('/'),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(12)),
                      child: const Icon(Icons.arrow_back, color: Colors.white, size: 20),
                    ),
                  ),
                ),
              ],
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Profile image
                  ClipRRect(
                    borderRadius: BorderRadius.circular(16),
                    child: SizedBox(
                      width: 80,
                      height: 80,
                      child: artist['profile_image_url'] != null
                          ? CachedNetworkImage(imageUrl: artist['profile_image_url'], fit: BoxFit.cover)
                          : Container(color: ChronicleTheme.cobalt, child: Center(child: Text(artist['name'][0], style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)))),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text((artist['name'] as String).toUpperCase(), style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontSize: 22)),
                        const SizedBox(height: 4),
                        Text('$_followers followers', style: Theme.of(context).textTheme.bodySmall),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: _toggleFollow,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _following ? ChronicleTheme.paleSky : ChronicleTheme.accent,
                      foregroundColor: _following ? ChronicleTheme.cobalt : Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                    child: Text(_following ? 'FOLLOWING' : 'FOLLOW'),
                  ),
                ],
              ),
            ),
          ),

          // Bio
          if (artist['bio'] != null)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                child: Text(artist['bio'], style: TextStyle(color: ChronicleTheme.cobalt.withValues(alpha: 0.6), height: 1.6, fontSize: 14)),
              ),
            ),

          // Streaming links
          if (streamingLinks.values.any((v) => v.isNotEmpty))
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: streamingLinks.entries.where((e) => e.value.isNotEmpty).map((e) {
                    return ActionChip(
                      label: Text(e.key.replaceAll('_', ' ').toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1)),
                      onPressed: () => launchUrl(Uri.parse(e.value)),
                      backgroundColor: ChronicleTheme.cobalt.withValues(alpha: 0.05),
                    );
                  }).toList(),
                ),
              ),
            ),

          // Releases
          if (_releases.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Text('RELEASES', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16)),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 160,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: _releases.length,
                  itemBuilder: (context, i) {
                    final r = _releases[i];
                    return Container(
                      width: 120,
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      child: Column(
                        children: [
                          Expanded(
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: r['cover_art_url'] != null
                                  ? CachedNetworkImage(imageUrl: r['cover_art_url'], fit: BoxFit.cover, width: double.infinity)
                                  : Container(color: ChronicleTheme.accent.withValues(alpha: 0.2), child: const Icon(Icons.music_note, size: 32)),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(r['title'], style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5), maxLines: 1, overflow: TextOverflow.ellipsis),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ),
          ],

          // Videos
          if (_videos.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 12),
                child: Text('VIDEOS', style: Theme.of(context).textTheme.titleLarge?.copyWith(fontSize: 16)),
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              sliver: SliverGrid.count(
                crossAxisCount: 2,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 16 / 9,
                children: _videos.map((v) {
                  final url = v['youtube_url'] as String;
                  final match = RegExp(r'(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})').firstMatch(url);
                  final ytId = match?.group(1);
                  if (ytId == null) return const SizedBox();
                  return ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: CachedNetworkImage(
                      imageUrl: 'https://img.youtube.com/vi/$ytId/mqdefault.jpg',
                      fit: BoxFit.cover,
                    ),
                  );
                }).toList(),
              ),
            ),
          ],

          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }
}
