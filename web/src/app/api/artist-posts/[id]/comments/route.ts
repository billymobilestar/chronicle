import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("post_comments")
    .select("*, profile:profiles(display_name, avatar_url)")
    .eq("post_id", params.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: params.id,
      user_id: user.id,
      content,
    })
    .select("*, profile:profiles(display_name, avatar_url)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
