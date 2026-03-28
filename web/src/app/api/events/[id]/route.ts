import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/auth";

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("events").select("*").eq("id", params.id).single();
  if (error) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try { await requireRole(["admin", "artist"]); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const body = await request.json();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("events").update(body).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try { await requireRole(["admin", "artist"]); } catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("events").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
