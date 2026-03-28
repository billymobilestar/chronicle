import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { option_id } = await request.json();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("poll_votes")
    .insert({ option_id, user_id: user.id })
    .select()
    .single();

  if (error) {
    if (error.message.includes("already voted")) {
      return NextResponse.json({ error: "Already voted in this poll" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data, { status: 201 });
}
