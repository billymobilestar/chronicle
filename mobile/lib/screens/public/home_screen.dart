import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';
import 'package:chronicle_mobile/services/auth_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<Map<String, dynamic>> _featured = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final featured = await DataService.getFeaturedArtists();
    if (mounted) setState(() { _featured = featured; _isLoading = false; });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Scaffold(body: Center(child: CircularProgressIndicator()));

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Hero
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [ChronicleTheme.cobaltDark, ChronicleTheme.cobalt],
                ),
              ),
              child: SafeArea(
                bottom: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 32, 24, 40),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: Image.asset('assets/logo.jpg', width: 56, height: 56),
                          ),
                          const Spacer(),
                          if (Navigator.canPop(context))
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(12)),
                                child: const Icon(Icons.close, color: Colors.white, size: 20),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'CHRONICLE\nRECORDS',
                        style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          color: Colors.white,
                          height: 0.9,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Discover new music. Connect with artists.\nBe part of the story.',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withValues(alpha: 0.5),
                          height: 1.5,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        children: [
                          ElevatedButton(
                            onPressed: () => context.go(AuthService.isSignedIn ? '/fan' : '/sign-up'),
                            style: ElevatedButton.styleFrom(backgroundColor: ChronicleTheme.accent),
                            child: Text(AuthService.isSignedIn ? 'MY FEED' : 'JOIN'),
                          ),
                          const SizedBox(width: 12),
                          OutlinedButton(
                            onPressed: () => context.push('/artists'),
                            style: OutlinedButton.styleFrom(
                              side: BorderSide(color: Colors.white.withValues(alpha: 0.3)),
                              foregroundColor: Colors.white,
                            ),
                            child: const Text('ARTISTS'),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Featured Artists
          if (_featured.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('FEATURED', style: Theme.of(context).textTheme.titleLarge),
                    GestureDetector(
                      onTap: () => context.push('/artists'),
                      child: Text('VIEW ALL →', style: TextStyle(color: ChronicleTheme.wisteria, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.5)),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 200,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _featured.length,
                  itemBuilder: (context, index) {
                    final artist = _featured[index];
                    return GestureDetector(
                      onTap: () => context.go('/artists/${artist['slug']}'),
                      child: Container(
                        width: 140,
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        child: Column(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(20),
                                child: artist['profile_image_url'] != null
                                    ? CachedNetworkImage(imageUrl: artist['profile_image_url'], fit: BoxFit.cover, width: double.infinity)
                                    : Container(
                                        color: ChronicleTheme.cobalt,
                                        child: Center(child: Text(artist['name'][0], style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold))),
                                      ),
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              (artist['name'] as String).toUpperCase(),
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.5, color: ChronicleTheme.cobalt),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
          ],

          // Quick links
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  _QuickLink(icon: Icons.album, label: 'RELEASES', onTap: () => context.push('/releases')),
                  _QuickLink(icon: Icons.newspaper, label: 'NEWS', onTap: () => context.push('/news')),
                  _QuickLink(icon: Icons.event, label: 'EVENTS', onTap: () => context.push('/events')),
                  _QuickLink(icon: Icons.shopping_bag, label: 'MERCH', onTap: () => context.push('/merch')),
                ],
              ),
            ),
          ),

          // CTA
          if (!AuthService.isSignedIn)
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(24, 0, 24, 40),
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: ChronicleTheme.cobalt,
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Column(
                  children: [
                    Text('JOIN THE STORY', style: Theme.of(context).textTheme.headlineMedium?.copyWith(color: Colors.white)),
                    const SizedBox(height: 8),
                    Text('Sign up free and connect with your favorite artists.', style: TextStyle(color: Colors.white.withValues(alpha: 0.5), fontSize: 14), textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: () => context.push('/sign-up'),
                      style: ElevatedButton.styleFrom(backgroundColor: ChronicleTheme.neon, foregroundColor: ChronicleTheme.cobaltDark),
                      child: const Text('CREATE ACCOUNT'),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _QuickLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _QuickLink({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: ChronicleTheme.cobalt.withValues(alpha: 0.05), width: 2),
        ),
        child: Row(
          children: [
            Icon(icon, color: ChronicleTheme.accent, size: 22),
            const SizedBox(width: 16),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1.5, fontSize: 13, color: ChronicleTheme.cobalt)),
            const Spacer(),
            Icon(Icons.arrow_forward_ios, size: 14, color: ChronicleTheme.wisteria),
          ],
        ),
      ),
    );
  }
}
