import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("releases").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: releaseArtists } = await supabase
    .from("release_artists")
    .select("*, artist:artists(id, name, slug)")
    .eq("release_id", params.id)
    .order("sort_order");

  return NextResponse.json({ ...data, artists: releaseArtists || [] });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try { await requireRole(["admin", "artist"]); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  const { artist_ids, ...body } = await request.json();
  const supabase = getSupabaseAdmin();

  if (artist_ids && artist_ids.length > 0) {
    body.artist_id = artist_ids[0];
  }

  const { data, error } = await supabase.from("releases").update(body).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Update artist links if provided
  if (artist_ids !== undefined) {
    await supabase.from("release_artists").delete().eq("release_id", params.id);
    if (artist_ids.length > 0) {
      const links = artist_ids.map((artistId: string, i: number) => ({
        release_id: params.id,
        artist_id: artistId,
        role: i === 0 ? "primary" : "featured",
        sort_order: i,
      }));
      await supabase.from("release_artists").insert(links);
    }
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try { await requireRole(["admin", "artist"]); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("releases").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
