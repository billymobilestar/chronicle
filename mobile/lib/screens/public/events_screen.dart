import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:chronicle_mobile/config/theme.dart';
import 'package:chronicle_mobile/services/data_service.dart';
import 'package:intl/intl.dart';

class EventsScreen extends StatefulWidget {
  const EventsScreen({super.key});
  @override
  State<EventsScreen> createState() => _EventsScreenState();
}

class _EventsScreenState extends State<EventsScreen> {
  List<Map<String, dynamic>> _events = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    final data = await DataService.getUpcomingEvents();
    if (mounted) setState(() { _events = data; _loading = false; });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('EVENTS')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _events.isEmpty
              ? const Center(child: Text('No upcoming events'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _events.length,
                  itemBuilder: (context, i) {
                    final e = _events[i];
                    final date = DateTime.parse(e['event_date']);
                    return Card(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              width: 56,
                              height: 56,
                              decoration: BoxDecoration(color: ChronicleTheme.cobalt, borderRadius: BorderRadius.circular(14)),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text('${date.day}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
                                  Text(DateFormat.MMM().format(date).toUpperCase(), style: TextStyle(color: Colors.white.withValues(alpha: 0.6), fontWeight: FontWeight.w700, fontSize: 10)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text((e['title'] as String).toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, letterSpacing: 0.5)),
                                  if (e['venue'] != null)
                                    Text('${e['venue']}${e['city'] != null ? ', ${e['city']}' : ''}', style: TextStyle(fontSize: 12, color: ChronicleTheme.cobalt.withValues(alpha: 0.4))),
                                ],
                              ),
                            ),
                            if (e['ticket_url'] != null)
                              ElevatedButton(
                                onPressed: () => launchUrl(Uri.parse(e['ticket_url'])),
                                style: ElevatedButton.styleFrom(backgroundColor: ChronicleTheme.accent, padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8)),
                                child: const Text('TICKETS', style: TextStyle(fontSize: 10)),
                              ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
