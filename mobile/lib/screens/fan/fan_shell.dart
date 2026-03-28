import 'package:flutter/material.dart';
import 'package:chronicle_mobile/screens/fan/feed_tab.dart';
import 'package:chronicle_mobile/screens/fan/explore_tab.dart';
import 'package:chronicle_mobile/screens/fan/community_tab.dart';
import 'package:chronicle_mobile/screens/fan/profile_tab.dart';

class FanShell extends StatefulWidget {
  const FanShell({super.key});

  @override
  State<FanShell> createState() => _FanShellState();
}

class _FanShellState extends State<FanShell> {
  int _currentIndex = 0;

  final _tabs = const [
    FeedTab(),
    ExploreTab(),
    CommunityTab(),
    ProfileTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _tabs),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'FEED'),
          BottomNavigationBarItem(icon: Icon(Icons.explore_rounded), label: 'EXPLORE'),
          BottomNavigationBarItem(icon: Icon(Icons.forum_rounded), label: 'COMMUNITY'),
          BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'PROFILE'),
        ],
      ),
    );
  }
}
