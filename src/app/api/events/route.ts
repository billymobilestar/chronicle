import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("events")
    .select("*, artist:artists(id, name, slug)")
    .eq("is_published", true)
    .order("event_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try { await requireRole("admin"); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const body = await request.json();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("events").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
