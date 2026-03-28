import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService {
  static final _supabase = Supabase.instance.client;

  static User? get currentUser => _supabase.auth.currentUser;
  static bool get isSignedIn => currentUser != null;

  static Stream<AuthState> get authStateChanges => _supabase.auth.onAuthStateChange;

  static Future<String?> getUserRole() async {
    final user = currentUser;
    if (user == null) return null;

    final data = await _supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return data['role'] as String?;
  }

  static Future<AuthResponse> signIn({
    required String email,
    required String password,
  }) async {
    return await _supabase.auth.signInWithPassword(
      email: email,
      password: password,
    );
  }

  static Future<AuthResponse> signUp({
    required String email,
    required String password,
    required String displayName,
  }) async {
    return await _supabase.auth.signUp(
      email: email,
      password: password,
      data: {
        'display_name': displayName,
        'role': 'fan',
      },
    );
  }

  static Future<void> signOut() async {
    await _supabase.auth.signOut();
  }
}
