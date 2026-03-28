import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';
import 'package:timeago/timeago.dart' as timeago;

class CommunityTab extends StatefulWidget {
  const CommunityTab({super.key});
  @override
  State<CommunityTab> createState() => _CommunityTabState();
}

class _CommunityTabState extends State<CommunityTab> {
  List<Map<String, dynamic>> _posts = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final data = await DataService.getCommunityPosts();
    if (mounted) setState(() { _posts = data; _loading = false; });
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
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(20, 20, 20, 16),
                        child: Text('COMMUNITY', style: Theme.of(context).textTheme.headlineMedium),
                      ),
                    ),
                    _posts.isEmpty
                        ? const SliverFillRemaining(child: Center(child: Text('No posts yet')))
                        : SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, i) {
                                final post = _posts[i];
                                final isLabel = post['is_label_post'] == true;
                                final name = isLabel ? 'Chronicle Records' : (post['artists']?['name'] ?? 'Artist');
                                final image = isLabel ? null : post['artists']?['profile_image_url'];
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
                                              backgroundImage: image != null ? CachedNetworkImageProvider(image) : null,
                                              child: image == null ? Text(name[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)) : null,
                                            ),
                                            const SizedBox(width: 10),
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  Text(name.toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 1)),
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
                              },
                              childCount: _posts.length,
                            ),
                          ),
                  ],
                ),
              ),
      ),
    );
  }
}
