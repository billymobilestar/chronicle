import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const artistId = searchParams.get("artist_id");
  const followed = searchParams.get("followed");

  const supabase = getSupabaseAdmin();
  const user = await getUser();

  let query = supabase
    .from("artist_posts")
    .select(`
      *,
      artists!inner(name, slug, profile_image_url)
    `)
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(50);

  if (artistId) {
    query = query.eq("artist_id", artistId);
  }

  if (followed === "true" && user) {
    const { data: follows } = await supabase
      .from("fan_follows")
      .select("artist_id")
      .eq("fan_user_id", user.id);

    const artistIds = (follows || []).map((f) => f.artist_id);
    if (artistIds.length === 0) {
      return NextResponse.json([]);
    }
    query = query.in("artist_id", artistIds);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch reaction counts and comment counts
  const postIds = (data || []).map((p) => p.id);

  const [{ data: reactionData }, { data: commentData }] = await Promise.all([
    supabase.from("post_reactions").select("post_id, reaction").in("post_id", postIds),
    supabase.from("post_comments").select("post_id").in("post_id", postIds),
  ]);

  const reactionMap: Record<string, Record<string, number>> = {};
  (reactionData || []).forEach((r) => {
    if (!reactionMap[r.post_id]) reactionMap[r.post_id] = {};
    reactionMap[r.post_id][r.reaction] = (reactionMap[r.post_id][r.reaction] || 0) + 1;
  });

  const commentMap: Record<string, number> = {};
  (commentData || []).forEach((c) => {
    commentMap[c.post_id] = (commentMap[c.post_id] || 0) + 1;
  });

  const posts = (data || []).map((p) => ({
    ...p,
    artist_name: p.artists?.name,
    artist_slug: p.artists?.slug,
    artist_image: p.artists?.profile_image_url,
    reaction_counts: reactionMap[p.id] || {},
    comment_count: commentMap[p.id] || 0,
    artists: undefined,
  }));

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  // Verify user owns this artist
  const { data: artist } = await supabase
    .from("artists")
    .select("id")
    .eq("id", body.artist_id)
    .eq("user_id", user.id)
    .single();

  if (!artist) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("artist_posts")
    .insert({
      artist_id: body.artist_id,
      author_user_id: user.id,
      post_type: body.post_type || "update",
      title: body.title || null,
      content: body.content,
      image_url: body.image_url || null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
