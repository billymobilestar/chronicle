import 'package:go_router/go_router.dart';
import 'package:chronicle_mobile/screens/auth/sign_in_screen.dart';
import 'package:chronicle_mobile/screens/auth/sign_up_screen.dart';
import 'package:chronicle_mobile/screens/public/home_screen.dart';
import 'package:chronicle_mobile/screens/public/artists_screen.dart';
import 'package:chronicle_mobile/screens/public/artist_profile_screen.dart';
import 'package:chronicle_mobile/screens/public/releases_screen.dart';
import 'package:chronicle_mobile/screens/public/news_screen.dart';
import 'package:chronicle_mobile/screens/public/events_screen.dart';
import 'package:chronicle_mobile/screens/public/merch_screen.dart';
import 'package:chronicle_mobile/screens/fan/fan_shell.dart';
import 'package:chronicle_mobile/services/auth_service.dart';

final router = GoRouter(
  initialLocation: '/',
  redirect: (context, state) {
    final isAuth = AuthService.isSignedIn;
    final isAuthRoute = state.matchedLocation == '/sign-in' || state.matchedLocation == '/sign-up';

    if (isAuth && isAuthRoute) return '/fan';
    return null;
  },
  routes: [
    // Home
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),

    // Auth
    GoRoute(path: '/sign-in', builder: (context, state) => const SignInScreen()),
    GoRoute(path: '/sign-up', builder: (context, state) => const SignUpScreen()),

    // Public browsing - these are pushable so back button works
    GoRoute(path: '/artists', builder: (context, state) => const ArtistsScreen()),
    GoRoute(
      path: '/artists/:slug',
      builder: (context, state) => ArtistProfileScreen(slug: state.pathParameters['slug']!),
    ),
    GoRoute(path: '/releases', builder: (context, state) => const ReleasesScreen()),
    GoRoute(path: '/news', builder: (context, state) => const NewsScreen()),
    GoRoute(path: '/events', builder: (context, state) => const EventsScreen()),
    GoRoute(path: '/merch', builder: (context, state) => const MerchScreen()),

    // Fan (authenticated)
    GoRoute(path: '/fan', builder: (context, state) => const FanShell()),
  ],
);
