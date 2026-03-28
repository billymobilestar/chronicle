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
      artists(name, slug, profile_image_url)
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
      // Still show label posts even if following nobody
      query = query.eq("is_label_post", true);
    } else {
      // Show posts from followed artists + label posts
      query = query.or(`artist_id.in.(${artistIds.join(",")}),is_label_post.eq.true`);
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fetch reaction counts and comment counts
  const postIds = (data || []).map((p) => p.id);

  const reactionMap: Record<string, Record<string, number>> = {};
  const commentMap: Record<string, number> = {};

  if (postIds.length > 0) {
    const [{ data: reactionData }, { data: commentData }] = await Promise.all([
      supabase.from("post_reactions").select("post_id, reaction").in("post_id", postIds),
      supabase.from("post_comments").select("post_id").in("post_id", postIds),
    ]);

    (reactionData || []).forEach((r) => {
      if (!reactionMap[r.post_id]) reactionMap[r.post_id] = {};
      reactionMap[r.post_id][r.reaction] = (reactionMap[r.post_id][r.reaction] || 0) + 1;
    });

    (commentData || []).forEach((c) => {
      commentMap[c.post_id] = (commentMap[c.post_id] || 0) + 1;
    });
  }

  // Fetch poll data for poll posts
  const pollPostIds = (data || []).filter((p) => p.post_type === "poll").map((p) => p.id);
  const pollDataMap: Record<string, { options: { id: string; label: string; votes: number }[]; total_votes: number; user_vote: string | null }> = {};

  if (pollPostIds.length > 0) {
    const { data: options } = await supabase
      .from("poll_options")
      .select("*")
      .in("post_id", pollPostIds)
      .order("sort_order");

    const optionIds = (options || []).map((o) => o.id);
    const { data: votes } = optionIds.length > 0
      ? await supabase.from("poll_votes").select("option_id, user_id").in("option_id", optionIds)
      : { data: [] };

    for (const postId of pollPostIds) {
      const postOptions = (options || []).filter((o) => o.post_id === postId);
      const optIds = postOptions.map((o) => o.id);
      const postVotes = (votes || []).filter((v) => optIds.includes(v.option_id));

      pollDataMap[postId] = {
        options: postOptions.map((o) => ({
          id: o.id,
          label: o.label,
          votes: postVotes.filter((v) => v.option_id === o.id).length,
        })),
        total_votes: postVotes.length,
        user_vote: user ? (postVotes.find((v) => v.user_id === user.id)?.option_id || null) : null,
      };
    }
  }

  // Fetch tagged artists
  const taggedArtistsMap: Record<string, { id: string; name: string; slug: string; profile_image_url: string | null }[]> = {};
  if (postIds.length > 0) {
    const { data: postArtists } = await supabase
      .from("post_artists")
      .select("post_id, artist:artists(id, name, slug, profile_image_url)")
      .in("post_id", postIds);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (postArtists || []).forEach((pa: any) => {
      if (!pa.artist) return;
      if (!taggedArtistsMap[pa.post_id]) taggedArtistsMap[pa.post_id] = [];
      taggedArtistsMap[pa.post_id].push(pa.artist);
    });
  }

  const posts = (data || []).map((p) => ({
    ...p,
    artist_name: p.is_label_post ? "Chronicle Records" : p.artists?.name,
    artist_slug: p.is_label_post ? null : p.artists?.slug,
    artist_image: p.is_label_post ? "/chronicle logo.jpg" : p.artists?.profile_image_url,
    reaction_counts: reactionMap[p.id] || {},
    comment_count: commentMap[p.id] || 0,
    poll: pollDataMap[p.id] || null,
    tagged_artists: taggedArtistsMap[p.id] || [],
    artists: undefined,
  }));

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const supabase = getSupabaseAdmin();

  // Check if admin posting as label
  if (body.is_label_post) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("artist_posts")
      .insert({
        artist_id: null,
        author_user_id: user.id,
        post_type: body.post_type || "announcement",
        title: body.title || null,
        content: body.content,
        image_url: body.image_url || null,
        is_label_post: true,
        link_url: body.link_url || null,
        link_title: body.link_title || null,
        link_description: body.link_description || null,
        link_image: body.link_image || null,
        related_release_id: body.related_release_id || null,
        related_video_id: body.related_video_id || null,
        countdown_date: body.countdown_date || null,
        countdown_label: body.countdown_label || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Create poll options if poll type
    if (body.post_type === "poll" && body.poll_options && body.poll_options.length > 0) {
      const options = body.poll_options.map((label: string, i: number) => ({
        post_id: data.id,
        label,
        sort_order: i,
      }));
      await supabase.from("poll_options").insert(options);
    }

    // Tag artists on the post
    if (body.tagged_artist_ids && body.tagged_artist_ids.length > 0) {
      const tags = body.tagged_artist_ids.map((artistId: string) => ({
        post_id: data.id,
        artist_id: artistId,
      }));
      await supabase.from("post_artists").insert(tags);
    }

    return NextResponse.json(data, { status: 201 });
  }

  // Artist posting
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
