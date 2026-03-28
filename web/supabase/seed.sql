-- ============================================================
-- Chronicle Records - Seed Data
-- Run this AFTER the migration and AFTER creating your admin user
-- ============================================================

-- ============================================================
-- ARTISTS
-- ============================================================

INSERT INTO artists (id, name, slug, bio, short_bio, genre, streaming_links, social_links, video_urls, is_active, sort_order) VALUES
(
  'a1000000-0000-0000-0000-000000000001',
  'Kael Rivers',
  'kael-rivers',
  'Born and raised in Toronto, Kael Rivers has been making waves in the R&B scene since 2021. His smooth vocals and introspective lyrics have earned him a dedicated fanbase across North America. With influences ranging from Frank Ocean to Daniel Caesar, Kael brings a fresh perspective to contemporary R&B that resonates with a generation seeking authenticity in music.',
  'Toronto R&B with soul. Smooth vocals, real stories.',
  'R&B',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "youtube_music": "https://music.youtube.com", "soundcloud": "https://soundcloud.com"}',
  '{"instagram": "https://instagram.com", "twitter": "https://x.com", "tiktok": "https://tiktok.com", "youtube": "https://youtube.com"}',
  ARRAY['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com/watch?v=JGwWNGJdvx8', 'https://www.youtube.com/watch?v=kJQP7kiw5Fk'],
  true, 1
),
(
  'a1000000-0000-0000-0000-000000000002',
  'NOVA',
  'nova',
  'NOVA is the alter ego of 22-year-old producer and vocalist Maya Chen. Blending hyperpop, electronic, and indie influences, NOVA creates sonic landscapes that feel like the future. Her debut EP "STATIC DREAMS" was praised for its bold production and genre-defying approach. She produces, writes, and engineers everything herself from her bedroom studio in Vancouver.',
  'Hyperpop meets indie. Genre-defying sonic landscapes.',
  'Hyperpop / Electronic',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "soundcloud": "https://soundcloud.com"}',
  '{"instagram": "https://instagram.com", "tiktok": "https://tiktok.com", "youtube": "https://youtube.com"}',
  ARRAY['https://www.youtube.com/watch?v=9bZkp7q19f0', 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'],
  true, 2
),
(
  'a1000000-0000-0000-0000-000000000003',
  'Marcus Cole',
  'marcus-cole',
  'Marcus Cole is a hip-hop artist and songwriter from Atlanta. Known for his sharp lyricism and storytelling ability, Marcus has built a reputation as one of the most authentic voices in underground rap. His music tackles themes of ambition, identity, and growing up in the South with a raw honesty that sets him apart.',
  'Atlanta hip-hop. Sharp lyrics, real stories.',
  'Hip-Hop',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "youtube_music": "https://music.youtube.com", "tidal": "https://tidal.com"}',
  '{"instagram": "https://instagram.com", "twitter": "https://x.com", "youtube": "https://youtube.com"}',
  ARRAY['https://www.youtube.com/watch?v=hT_nvWreIhg', 'https://www.youtube.com/watch?v=RgKAFK5djSk', 'https://www.youtube.com/watch?v=OPf0YbXqDm0'],
  true, 3
),
(
  'a1000000-0000-0000-0000-000000000004',
  'Ayla Moon',
  'ayla-moon',
  'Ayla Moon writes the kind of songs that stay in your head for weeks. The 20-year-old singer-songwriter from Montreal combines folk-pop sensibilities with modern production, creating music that feels both timeless and current. Her acoustic-driven tracks and confessional lyrics have drawn comparisons to Phoebe Bridgers and Clairo.',
  'Folk-pop from Montreal. Songs that stay with you.',
  'Folk-Pop',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "youtube_music": "https://music.youtube.com"}',
  '{"instagram": "https://instagram.com", "tiktok": "https://tiktok.com"}',
  ARRAY['https://www.youtube.com/watch?v=bo_efYhYU2A'],
  true, 4
),
(
  'a1000000-0000-0000-0000-000000000005',
  'DRFTWD',
  'drftwd',
  'DRFTWD (pronounced "Driftwood") is a four-piece alternative band from Calgary. Formed in a high school garage in 2020, the group has evolved into one of Canada''s most exciting emerging rock acts. Their energetic live shows and anthemic hooks have earned them a growing following across Western Canada.',
  'Alt-rock from Calgary. Anthemic hooks, electric energy.',
  'Alternative Rock',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "soundcloud": "https://soundcloud.com"}',
  '{"instagram": "https://instagram.com", "twitter": "https://x.com", "tiktok": "https://tiktok.com", "youtube": "https://youtube.com"}',
  ARRAY['https://www.youtube.com/watch?v=Zi_XLOBDo_Y', 'https://www.youtube.com/watch?v=pXRviuL6vMY'],
  true, 5
),
(
  'a1000000-0000-0000-0000-000000000006',
  'Sable',
  'sable',
  'Sable is the stage name of R&B and neo-soul artist Jasmine Wright. Her velvety vocals and jazz-influenced production have made her one of Chronicle Records'' most critically acclaimed artists. Based in Los Angeles, Sable draws from the rich tradition of Black music while pushing boundaries with experimental arrangements.',
  'Neo-soul and R&B. Velvet vocals, jazz roots.',
  'Neo-Soul / R&B',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "tidal": "https://tidal.com"}',
  '{"instagram": "https://instagram.com", "twitter": "https://x.com"}',
  ARRAY['https://www.youtube.com/watch?v=450p7goxZqg'],
  true, 6
);

-- ============================================================
-- RELEASES
-- ============================================================

INSERT INTO releases (title, artist_id, release_type, release_date, description, streaming_links, is_published) VALUES
(
  'Midnight Drive',
  'a1000000-0000-0000-0000-000000000001',
  'single',
  '2026-03-15',
  'The lead single from Kael Rivers'' upcoming EP. A late-night R&B track about chasing dreams and leaving the past behind.',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com"}',
  true
),
(
  'STATIC DREAMS',
  'a1000000-0000-0000-0000-000000000002',
  'ep',
  '2026-02-28',
  'NOVA''s debut EP. Five tracks of genre-bending hyperpop that blur the lines between digital and organic sound.',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "soundcloud": "https://soundcloud.com"}',
  true
),
(
  'Southside Stories',
  'a1000000-0000-0000-0000-000000000003',
  'album',
  '2026-01-20',
  'Marcus Cole''s debut album. 12 tracks of raw, unfiltered hip-hop storytelling from the heart of Atlanta.',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "tidal": "https://tidal.com"}',
  true
),
(
  'Golden Hour',
  'a1000000-0000-0000-0000-000000000004',
  'single',
  '2026-03-22',
  'A warm, acoustic-driven single about finding peace in simple moments.',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com"}',
  true
),
(
  'Concrete & Sky',
  'a1000000-0000-0000-0000-000000000005',
  'ep',
  '2026-03-01',
  'DRFTWD''s second EP. Bigger hooks, heavier guitars, and the energy of a thousand basement shows.',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com"}',
  true
),
(
  'Amber',
  'a1000000-0000-0000-0000-000000000006',
  'album',
  '2025-12-10',
  'Sable''s critically acclaimed debut album. A masterclass in neo-soul production and vocal performance.',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com", "tidal": "https://tidal.com"}',
  true
),
(
  'Echoes',
  'a1000000-0000-0000-0000-000000000001',
  'ep',
  '2025-11-05',
  'Kael Rivers'' debut EP that introduced the world to his signature sound.',
  '{"spotify": "https://open.spotify.com", "apple_music": "https://music.apple.com"}',
  true
),
(
  'GLITCH',
  'a1000000-0000-0000-0000-000000000002',
  'single',
  '2026-03-25',
  'The latest single from NOVA. A frenetic, bass-heavy track with distorted vocals and a drop that hits different.',
  '{"spotify": "https://open.spotify.com", "soundcloud": "https://soundcloud.com"}',
  true
);

-- ============================================================
-- ANNOUNCEMENTS / NEWS
-- ============================================================

INSERT INTO announcements (title, slug, content, excerpt, is_published, published_at) VALUES
(
  'Chronicle Records Launches Fan Portal',
  'chronicle-records-launches-fan-portal',
  'We''re excited to announce the launch of the Chronicle Records fan portal — your one-stop destination for everything Chronicle. Follow your favorite artists, get direct updates, browse merch, and stay connected with the community.

This has been months in the making, and we couldn''t be more proud to share it with you. The portal features artist profiles with streaming links and official videos, a community feed where artists post directly to fans, an events calendar, and our upcoming merch store.

Sign up today and be among the first to join the Chronicle community. We have big things planned for 2026 and we want you to be part of the story.',
  'Your one-stop destination for everything Chronicle Records. Follow artists, get updates, and join the community.',
  true,
  '2026-03-27T12:00:00Z'
),
(
  'Marcus Cole''s "Southside Stories" Hits 1M Streams',
  'marcus-cole-southside-stories-1m-streams',
  'Huge milestone for Marcus Cole! His debut album "Southside Stories" has officially crossed 1 million streams across all platforms. The 12-track project, which dropped in January, has been one of Chronicle Records'' biggest releases to date.

Marcus shared his reaction: "This one''s for everyone who believed in me when I was just rapping in parking lots. A million streams means a million moments where someone connected with my story. That''s everything."

If you haven''t listened yet, what are you waiting for? Stream "Southside Stories" now on all platforms.',
  'Marcus Cole''s debut album crosses a massive milestone. Stream it now on all platforms.',
  true,
  '2026-03-20T10:00:00Z'
),
(
  'NOVA Announces "STATIC DREAMS" Visual Experience',
  'nova-static-dreams-visual-experience',
  'NOVA is taking her music to another dimension. The hyperpop artist has announced an immersive visual experience for her debut EP "STATIC DREAMS," featuring custom visuals for each track, interactive elements, and a live-streamed performance.

The event will take place on April 15th and will be streamed live for Chronicle community members. More details coming soon.

"I want people to see what I see when I make music," NOVA said. "It''s not just sound — it''s a whole world."',
  'An immersive visual experience for NOVA''s debut EP. Live stream details coming soon.',
  true,
  '2026-03-18T14:00:00Z'
),
(
  'Chronicle Records Summer Tour 2026 Announced',
  'chronicle-summer-tour-2026',
  'It''s happening. Chronicle Records is hitting the road this summer with our biggest tour yet. Featuring performances from Kael Rivers, Marcus Cole, DRFTWD, and Sable, the tour will visit 15 cities across North America.

Presale tickets will be available exclusively to Chronicle community members starting April 1st. General sale begins April 5th.

Cities include Toronto, Vancouver, Montreal, Calgary, Los Angeles, New York, Atlanta, Chicago, Houston, Miami, Seattle, Portland, Denver, Nashville, and Austin.',
  'Chronicle Records hits the road this summer. 15 cities. 4 artists. Presale starts April 1st.',
  true,
  '2026-03-15T09:00:00Z'
),
(
  'Ayla Moon Signs with Chronicle Records',
  'ayla-moon-signs-chronicle-records',
  'We''re thrilled to welcome Ayla Moon to the Chronicle Records family. The Montreal-based folk-pop artist brings a unique voice and songwriting talent that we believe will resonate with music lovers everywhere.

Ayla''s debut single under Chronicle, "Golden Hour," drops March 22nd. Stay tuned for more from this incredible artist.',
  'The Montreal folk-pop artist joins the Chronicle Records roster. Debut single coming March 22nd.',
  true,
  '2026-03-10T11:00:00Z'
);

-- ============================================================
-- EVENTS
-- ============================================================

INSERT INTO events (title, description, venue, city, state, event_date, event_time, doors_time, ticket_url, artist_id, is_published) VALUES
(
  'Kael Rivers - Midnight Drive Tour',
  'An intimate evening with Kael Rivers performing tracks from his new EP plus fan favorites.',
  'The Velvet Underground',
  'Toronto',
  'ON',
  '2026-04-20',
  '20:00',
  '19:00',
  'https://example.com/tickets',
  'a1000000-0000-0000-0000-000000000001',
  true
),
(
  'NOVA - STATIC DREAMS Visual Experience',
  'An immersive audiovisual performance featuring NOVA''s debut EP with custom visuals and interactive elements.',
  'The Imperial',
  'Vancouver',
  'BC',
  '2026-04-15',
  '21:00',
  '20:00',
  'https://example.com/tickets',
  'a1000000-0000-0000-0000-000000000002',
  true
),
(
  'Chronicle Records Summer Kickoff',
  'The official summer tour kickoff featuring Marcus Cole, DRFTWD, and Sable on one stage.',
  'History',
  'Toronto',
  'ON',
  '2026-06-15',
  '19:00',
  '18:00',
  'https://example.com/tickets',
  NULL,
  true
),
(
  'DRFTWD - Concrete & Sky Album Release Show',
  'DRFTWD celebrates their new EP with a high-energy release show.',
  'The Palace Theatre',
  'Calgary',
  'AB',
  '2026-05-10',
  '20:00',
  '19:00',
  'https://example.com/tickets',
  'a1000000-0000-0000-0000-000000000005',
  true
),
(
  'Sable - Amber Listening Party',
  'An intimate listening party for Sable''s debut album "Amber" with live acoustic performances.',
  'The Roxy Theatre',
  'Los Angeles',
  'CA',
  '2026-05-25',
  '19:30',
  '18:30',
  'https://example.com/tickets',
  'a1000000-0000-0000-0000-000000000006',
  true
),
(
  'Chronicle Records x Local Vibes Festival',
  'Chronicle Records takes over a stage at Local Vibes Festival. Full lineup TBA.',
  'Downsview Park',
  'Toronto',
  'ON',
  '2026-07-20',
  '14:00',
  '13:00',
  'https://example.com/tickets',
  NULL,
  true
),
(
  'Ayla Moon - Acoustic Sessions',
  'A stripped-down acoustic set from Ayla Moon at one of Montreal''s most beloved venues.',
  'La Sala Rossa',
  'Montreal',
  'QC',
  '2026-04-28',
  '20:00',
  '19:00',
  'https://example.com/tickets',
  'a1000000-0000-0000-0000-000000000004',
  true
);

-- ============================================================
-- MERCH ITEMS
-- ============================================================

INSERT INTO merch_items (name, description, price, category, artist_id, is_available, sort_order) VALUES
(
  'Chronicle Records Logo Tee',
  'Classic black tee with the Chronicle Records logo. 100% premium cotton, relaxed fit.',
  35.00,
  'apparel',
  NULL,
  true, 1
),
(
  'Chronicle Records Hoodie',
  'Heavyweight hoodie with embroidered Chronicle logo. Perfect for late-night studio sessions.',
  75.00,
  'apparel',
  NULL,
  true, 2
),
(
  'Southside Stories Vinyl',
  'Limited edition 12" vinyl of Marcus Cole''s debut album. Includes printed inner sleeve with lyrics.',
  30.00,
  'vinyl',
  'a1000000-0000-0000-0000-000000000003',
  true, 3
),
(
  'STATIC DREAMS Poster',
  '18x24" art print featuring the STATIC DREAMS EP artwork. Printed on heavyweight matte paper.',
  20.00,
  'posters',
  'a1000000-0000-0000-0000-000000000002',
  true, 4
),
(
  'Amber Deluxe CD',
  'Deluxe edition CD of Sable''s debut album with two bonus tracks and a 16-page booklet.',
  18.00,
  'cd',
  'a1000000-0000-0000-0000-000000000006',
  true, 5
),
(
  'Chronicle Records Cap',
  'Structured snapback cap with embroidered Chronicle star logo. One size fits most.',
  28.00,
  'accessories',
  NULL,
  true, 6
),
(
  'Kael Rivers "Echoes" Tee',
  'Limited artist tee designed by Kael Rivers. Features custom artwork from the Echoes EP.',
  40.00,
  'apparel',
  'a1000000-0000-0000-0000-000000000001',
  true, 7
),
(
  'DRFTWD Sticker Pack',
  'Pack of 5 die-cut stickers featuring DRFTWD artwork and logos. Weatherproof vinyl.',
  8.00,
  'accessories',
  'a1000000-0000-0000-0000-000000000005',
  true, 8
);
