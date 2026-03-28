import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();

  if (!query) return NextResponse.json({ artists: [], merch: [], news: [] });

  const supabase = getSupabaseAdmin();
  const pattern = `%${query}%`;

  const [artistRes, merchRes, newsRes] = await Promise.all([
    supabase.from("artists").select("*").eq("is_active", true).ilike("name", pattern).limit(8),
    supabase.from("merch_items").select("*").eq("is_available", true).ilike("name", pattern).limit(8),
    supabase.from("announcements").select("*").eq("is_published", true).ilike("title", pattern).limit(6),
  ]);

  return NextResponse.json({
    artists: artistRes.data || [],
    merch: merchRes.data || [],
    news: newsRes.data || [],
  });
}
