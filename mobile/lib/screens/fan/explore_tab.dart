import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:chronicle_mobile/config/theme.dart';

class ExploreTab extends StatelessWidget {
  const ExploreTab({super.key});

  @override
  Widget build(BuildContext context) {
    final items = [
      _ExploreItem(icon: Icons.people, label: 'ARTISTS', route: '/artists', color: ChronicleTheme.accent),
      _ExploreItem(icon: Icons.album, label: 'RELEASES', route: '/releases', color: ChronicleTheme.cobalt),
      _ExploreItem(icon: Icons.newspaper, label: 'NEWS', route: '/news', color: ChronicleTheme.frenchBlue),
      _ExploreItem(icon: Icons.event, label: 'EVENTS', route: '/events', color: ChronicleTheme.cobaltDark),
      _ExploreItem(icon: Icons.shopping_bag, label: 'MERCH', route: '/merch', color: ChronicleTheme.accent),
    ];

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('EXPLORE', style: Theme.of(context).textTheme.headlineMedium),
              const SizedBox(height: 24),
              ...items.map((item) => GestureDetector(
                onTap: () => context.push(item.route),
                child: Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: ChronicleTheme.cobalt.withValues(alpha: 0.05), width: 2),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(color: item.color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                        child: Icon(item.icon, color: item.color, size: 20),
                      ),
                      const SizedBox(width: 16),
                      Text(item.label, style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1.5, fontSize: 14)),
                      const Spacer(),
                      Icon(Icons.arrow_forward_ios, size: 14, color: ChronicleTheme.wisteria),
                    ],
                  ),
                ),
              )),
            ],
          ),
        ),
      ),
    );
  }
}

class _ExploreItem {
  final IconData icon;
  final String label;
  final String route;
  final Color color;
  const _ExploreItem({required this.icon, required this.label, required this.route, required this.color});
}
