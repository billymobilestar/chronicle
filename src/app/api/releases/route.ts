import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("is_published", true)
    .order("release_date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach artists via join table
  const releaseIds = (data || []).map((r) => r.id);
  const { data: releaseArtists } = await supabase
    .from("release_artists")
    .select("*, artist:artists(id, name, slug, profile_image_url)")
    .in("release_id", releaseIds.length > 0 ? releaseIds : ["none"])
    .order("sort_order");

  const releasesWithArtists = (data || []).map((r) => ({
    ...r,
    artists: (releaseArtists || []).filter((ra) => ra.release_id === r.id),
    // Keep backward-compat: set artist from primary
    artist: (releaseArtists || []).find((ra) => ra.release_id === r.id && ra.role === "primary")?.artist || null,
  }));

  return NextResponse.json(releasesWithArtists);
}

export async function POST(request: NextRequest) {
  try { await requireRole("admin"); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const { artist_ids, ...body } = await request.json();
  const supabase = getSupabaseAdmin();

  // Set artist_id to the first (primary) artist for backward compat
  if (artist_ids && artist_ids.length > 0) {
    body.artist_id = artist_ids[0];
  }

  const { data, error } = await supabase.from("releases").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Link artists via join table
  if (artist_ids && artist_ids.length > 0) {
    const links = artist_ids.map((artistId: string, i: number) => ({
      release_id: data.id,
      artist_id: artistId,
      role: i === 0 ? "primary" : "featured",
      sort_order: i,
    }));
    await supabase.from("release_artists").insert(links);
  }

  return NextResponse.json(data, { status: 201 });
}
