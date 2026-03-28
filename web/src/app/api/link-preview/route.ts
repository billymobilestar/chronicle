import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/auth";

function extractMeta(html: string, property: string): string | null {
  // Try property="X" content="Y"
  const r1 = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i");
  const m1 = html.match(r1);
  if (m1?.[1]) return m1[1];

  // Try content="Y" property="X"
  const r2 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${property}["']`, "i");
  const m2 = html.match(r2);
  if (m2?.[1]) return m2[1];

  // Try name= instead of property=
  const r3 = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i");
  const m3 = html.match(r3);
  if (m3?.[1]) return m3[1];

  const r4 = new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*name=["']${property}["']`, "i");
  const m4 = html.match(r4);
  return m4?.[1] || null;
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "No URL" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ChronicleBot/1.0)" },
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return NextResponse.json({ error: "Failed to fetch" }, { status: 400 });

    const html = await res.text();

    const title =
      extractMeta(html, "og:title") ||
      extractMeta(html, "twitter:title") ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
      null;

    const description =
      extractMeta(html, "og:description") ||
      extractMeta(html, "twitter:description") ||
      extractMeta(html, "description") ||
      null;

    const image =
      extractMeta(html, "og:image") ||
      extractMeta(html, "twitter:image") ||
      null;

    const siteName =
      extractMeta(html, "og:site_name") ||
      new URL(url).hostname.replace("www.", "");

    return NextResponse.json({
      url,
      title,
      description,
      image,
      site_name: siteName,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch preview" }, { status: 400 });
  }
}
