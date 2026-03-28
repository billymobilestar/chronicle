import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/auth";

// Extract Open Graph image or other metadata images from a URL
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ChronicleBot/1.0)",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const html = await res.text();

    // Try og:image first
    const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogMatch?.[1]) return ogMatch[1];

    // Try twitter:image
    const twMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
    if (twMatch?.[1]) return twMatch[1];

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { urls } = await request.json();

  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
  }

  const thumbnails: { url: string; image: string; source: string }[] = [];

  for (const url of urls) {
    if (!url || typeof url !== "string") continue;

    try {
      // Spotify oEmbed
      if (url.includes("spotify.com")) {
        const oembedRes = await fetch(
          `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          if (data.thumbnail_url) {
            thumbnails.push({ url, image: data.thumbnail_url, source: "Spotify" });
            continue;
          }
        }
      }

      // YouTube
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const vidMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
        if (vidMatch?.[1]) {
          thumbnails.push({
            url,
            image: `https://img.youtube.com/vi/${vidMatch[1]}/hqdefault.jpg`,
            source: "YouTube",
          });
          continue;
        }
      }

      // Apple Music oEmbed
      if (url.includes("music.apple.com")) {
        const ogImage = await fetchOgImage(url);
        if (ogImage) {
          thumbnails.push({ url, image: ogImage, source: "Apple Music" });
          continue;
        }
      }

      // SoundCloud oEmbed
      if (url.includes("soundcloud.com")) {
        const oembedRes = await fetch(
          `https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`,
          { signal: AbortSignal.timeout(5000) }
        );
        if (oembedRes.ok) {
          const data = await oembedRes.json();
          if (data.thumbnail_url) {
            thumbnails.push({ url, image: data.thumbnail_url, source: "SoundCloud" });
            continue;
          }
        }
      }

      // Generic OG image fallback for any URL
      const ogImage = await fetchOgImage(url);
      if (ogImage) {
        thumbnails.push({ url, image: ogImage, source: new URL(url).hostname });
      }
    } catch {
      // Skip failed URLs
    }
  }

  return NextResponse.json({ thumbnails });
}
