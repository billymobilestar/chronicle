import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artist_id");

  const supabase = getSupabaseAdmin();

  if (artistId) {
    // Get videos for a specific artist
    const { data: videoArtists } = await supabase
      .from("video_artists")
      .select("video_id")
      .eq("artist_id", artistId);

    const videoIds = (videoArtists || []).map((va) => va.video_id);
    if (videoIds.length === 0) return NextResponse.json([]);

    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .in("id", videoIds)
      .eq("is_published", true)
      .order("sort_order");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Attach artists to each video
    const { data: allVideoArtists } = await supabase
      .from("video_artists")
      .select("*, artist:artists(id, name, slug, profile_image_url)")
      .in("video_id", videoIds);

    const videosWithArtists = (data || []).map((v) => ({
      ...v,
      artists: (allVideoArtists || []).filter((va) => va.video_id === v.id),
    }));

    return NextResponse.json(videosWithArtists);
  }

  // All videos (admin)
  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach artists
  const videoIds = (data || []).map((v) => v.id);
  const { data: allVideoArtists } = await supabase
    .from("video_artists")
    .select("*, artist:artists(id, name, slug, profile_image_url)")
    .in("video_id", videoIds.length > 0 ? videoIds : ["none"]);

  const videosWithArtists = (data || []).map((v) => ({
    ...v,
    artists: (allVideoArtists || []).filter((va) => va.video_id === v.id),
  }));

  return NextResponse.json(videosWithArtists);
}

export async function POST(request: NextRequest) {
  try {
    await requireRole("admin");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, youtube_url, description, artist_ids } = await request.json();
  const supabase = getSupabaseAdmin();

  const { data: video, error } = await supabase
    .from("videos")
    .insert({ title, youtube_url, description })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Link artists
  if (artist_ids && artist_ids.length > 0) {
    const links = artist_ids.map((artistId: string, i: number) => ({
      video_id: video.id,
      artist_id: artistId,
      sort_order: i,
    }));
    await supabase.from("video_artists").insert(links);
  }

  return NextResponse.json(video, { status: 201 });
}
