import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/auth_service.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key});
  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  String _displayName = '';
  String _email = '';
  String _role = 'fan';
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final user = AuthService.currentUser;
    if (user == null) return;

    final profile = await Supabase.instance.client
        .from('profiles')
        .select()
        .eq('id', user.id)
        .single();

    if (mounted) {
      setState(() {
        _displayName = profile['display_name'] ?? '';
        _email = profile['email'] ?? user.email ?? '';
        _role = profile['role'] ?? 'fan';
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('PROFILE', style: Theme.of(context).textTheme.headlineMedium),
                    const SizedBox(height: 24),

                    // Avatar + info
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 32,
                              backgroundColor: ChronicleTheme.cobalt,
                              child: Text(
                                _displayName.isNotEmpty ? _displayName[0].toUpperCase() : '?',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 24),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(_displayName.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, letterSpacing: 1)),
                                  const SizedBox(height: 2),
                                  Text(_email, style: TextStyle(fontSize: 13, color: ChronicleTheme.cobalt.withValues(alpha: 0.4))),
                                  const SizedBox(height: 4),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(color: ChronicleTheme.accent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                                    child: Text(_role.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1, color: ChronicleTheme.accent)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // Menu items
                    _MenuItem(icon: Icons.feedback, label: 'FEEDBACK', onTap: () {}),
                    _MenuItem(icon: Icons.notifications, label: 'NOTIFICATIONS', onTap: () {}),
                    _MenuItem(icon: Icons.settings, label: 'SETTINGS', onTap: () {}),

                    const SizedBox(height: 16),

                    // Sign out
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: () async {
                          await AuthService.signOut();
                          if (context.mounted) context.go('/');
                        },
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.red,
                          side: const BorderSide(color: Colors.red, width: 2),
                        ),
                        child: const Text('SIGN OUT'),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }
}

class _MenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _MenuItem({required this.icon, required this.label, required this.onTap});

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
            Icon(icon, color: ChronicleTheme.cobalt, size: 20),
            const SizedBox(width: 16),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w700, letterSpacing: 1.5, fontSize: 13)),
            const Spacer(),
            Icon(Icons.arrow_forward_ios, size: 14, color: ChronicleTheme.wisteria),
          ],
        ),
      ),
    );
  }
}
