import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';

class ArtistsScreen extends StatefulWidget {
  const ArtistsScreen({super.key});

  @override
  State<ArtistsScreen> createState() => _ArtistsScreenState();
}

class _ArtistsScreenState extends State<ArtistsScreen> {
  List<Map<String, dynamic>> _artists = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final data = await DataService.getArtists();
    if (mounted) setState(() { _artists = data; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('ARTISTS')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _artists.isEmpty
              ? const Center(child: Text('No artists yet'))
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 0.7,
                  ),
                  itemCount: _artists.length,
                  itemBuilder: (context, index) {
                    final artist = _artists[index];
                    return GestureDetector(
                      onTap: () => context.push('/artists/${artist['slug']}'),
                      child: Card(
                        clipBehavior: Clip.antiAlias,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Expanded(
                              flex: 3,
                              child: artist['profile_image_url'] != null
                                  ? CachedNetworkImage(imageUrl: artist['profile_image_url'], fit: BoxFit.cover)
                                  : Container(
                                      color: ChronicleTheme.cobalt,
                                      child: Center(child: Text(artist['name'][0], style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold))),
                                    ),
                            ),
                            Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    (artist['name'] as String).toUpperCase(),
                                    style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1, fontSize: 13, color: ChronicleTheme.cobalt),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  if (artist['genre'] != null) ...[
                                    const SizedBox(height: 4),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: ChronicleTheme.cobalt.withValues(alpha: 0.08),
                                        borderRadius: BorderRadius.circular(20),
                                      ),
                                      child: Text(artist['genre'], style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: ChronicleTheme.cobalt)),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
