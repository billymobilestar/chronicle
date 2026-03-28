import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';

class MerchScreen extends StatefulWidget {
  const MerchScreen({super.key});
  @override
  State<MerchScreen> createState() => _MerchScreenState();
}

class _MerchScreenState extends State<MerchScreen> {
  List<Map<String, dynamic>> _items = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final data = await DataService.getMerch();
    if (mounted) setState(() { _items = data; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('MERCH')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _items.isEmpty
              ? const Center(child: Text('Merch coming soon'))
              : GridView.builder(
                  padding: const EdgeInsets.all(16),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.7),
                  itemCount: _items.length,
                  itemBuilder: (context, i) {
                    final m = _items[i];
                    return Card(
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                            child: m['image_url'] != null
                                ? CachedNetworkImage(imageUrl: m['image_url'], fit: BoxFit.cover)
                                : Container(color: ChronicleTheme.cream, child: const Icon(Icons.shopping_bag, size: 40, color: ChronicleTheme.wisteria)),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(10),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text((m['name'] as String).toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 11, letterSpacing: 0.5), maxLines: 1, overflow: TextOverflow.ellipsis),
                                const SizedBox(height: 4),
                                if (m['price'] != null)
                                  Text('\$${m['price']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: ChronicleTheme.cobalt)),
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
