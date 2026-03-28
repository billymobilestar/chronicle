import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';
import 'package:intl/intl.dart';

class NewsScreen extends StatefulWidget {
  const NewsScreen({super.key});
  @override
  State<NewsScreen> createState() => _NewsScreenState();
}

class _NewsScreenState extends State<NewsScreen> {
  List<Map<String, dynamic>> _articles = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final data = await DataService.getNews();
    if (mounted) setState(() { _articles = data; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('NEWS')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _articles.length,
              itemBuilder: (context, i) {
                final a = _articles[i];
                final date = a['published_at'] != null ? DateFormat.yMMMd().format(DateTime.parse(a['published_at'])) : '';
                return Card(
                  clipBehavior: Clip.antiAlias,
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (a['cover_image_url'] != null)
                        CachedNetworkImage(imageUrl: a['cover_image_url'], height: 160, fit: BoxFit.cover),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(date, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.5, color: ChronicleTheme.accent)),
                            const SizedBox(height: 6),
                            Text((a['title'] as String).toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, letterSpacing: 0.5, color: ChronicleTheme.cobalt)),
                            if (a['excerpt'] != null) ...[
                              const SizedBox(height: 8),
                              Text(a['excerpt'], style: TextStyle(fontSize: 13, color: ChronicleTheme.cobalt.withValues(alpha: 0.5), height: 1.5), maxLines: 3, overflow: TextOverflow.ellipsis),
                            ],
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
