import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ count: 0 });

  const supabase = getSupabaseAdmin();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_user_id", user.id)
    .eq("is_read", false);

  return NextResponse.json({ count: count || 0 });
}
