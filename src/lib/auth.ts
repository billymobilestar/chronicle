import "server-only";
import { getSupabaseServer } from "./supabase-server";
import { getSupabaseAdmin } from "./supabase";
import type { Profile } from "./types";

export async function getUser() {
  const supabase = getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser(): Promise<Profile | null> {
  const user = await getUser();
  if (!user) return null;

  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as Profile | null;
}

export async function getUserRole(): Promise<string | null> {
  const profile = await getCurrentUser();
  return profile?.role ?? null;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(role: string | string[]) {
  const profile = await getCurrentUser();
  if (!profile) throw new Error("Unauthorized");

  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(profile.role)) {
    throw new Error("Forbidden");
  }
  return profile;
}
