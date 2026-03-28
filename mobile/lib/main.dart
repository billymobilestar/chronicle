import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:chronicle_mobile/config/supabase_config.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/config/router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: SupabaseConfig.url,
    anonKey: SupabaseConfig.anonKey,
  );

  runApp(const ChronicleApp());
}

class ChronicleApp extends StatelessWidget {
  const ChronicleApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Chronicle Records',
      theme: ChronicleTheme.theme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
