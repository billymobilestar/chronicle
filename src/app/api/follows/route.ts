import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artist_id } = await request.json();

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("fan_follows")
    .insert({ fan_user_id: user.id, artist_id })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Already following" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artist_id } = await request.json();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("fan_follows")
    .delete()
    .eq("fan_user_id", user.id)
    .eq("artist_id", artist_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
