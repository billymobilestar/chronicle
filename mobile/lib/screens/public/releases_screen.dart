import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';

class ReleasesScreen extends StatefulWidget {
  const ReleasesScreen({super.key});
  @override
  State<ReleasesScreen> createState() => _ReleasesScreenState();
}

class _ReleasesScreenState extends State<ReleasesScreen> {
  List<Map<String, dynamic>> _releases = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final data = await DataService.getReleases();
    if (mounted) setState(() { _releases = data; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('RELEASES')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.75),
              itemCount: _releases.length,
              itemBuilder: (context, i) {
                final r = _releases[i];
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Expanded(
                        child: r['cover_art_url'] != null
                            ? CachedNetworkImage(imageUrl: r['cover_art_url'], fit: BoxFit.cover)
                            : Container(color: ChronicleTheme.accent.withValues(alpha: 0.15), child: const Icon(Icons.music_note, size: 40, color: ChronicleTheme.accent)),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text((r['title'] as String).toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12, letterSpacing: 0.5), maxLines: 1, overflow: TextOverflow.ellipsis),
                            if (r['artist'] != null)
                              Text(r['artist']['name'], style: TextStyle(fontSize: 11, color: ChronicleTheme.cobalt.withValues(alpha: 0.4))),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
