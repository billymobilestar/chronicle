import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reaction } = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("post_reactions")
    .insert({
      post_id: params.id,
      user_id: user.id,
      reaction,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already reacted" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { reaction } = await request.json();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("post_reactions")
    .delete()
    .eq("post_id", params.id)
    .eq("user_id", user.id)
    .eq("reaction", reaction);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
