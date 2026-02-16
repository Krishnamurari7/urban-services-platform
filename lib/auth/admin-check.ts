"use server";

import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";

/**
 * Centralized admin check utility
 * Returns the authenticated admin user or an error
 */
export async function checkAdmin(): Promise<
  { error: null; user: User; supabase: Awaited<ReturnType<typeof createClient>> } | { error: string; user: null; supabase: null }
> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Unauthorized: Authentication required", user: null, supabase: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return { error: "Unauthorized: Profile not found", user: null, supabase: null };
  }

  if (profile.role !== "admin") {
    return { error: "Forbidden: Admin role required", user: null, supabase: null };
  }

  if (!profile.is_active) {
    return { error: "Forbidden: Admin account is inactive", user: null, supabase: null };
  }

  return { error: null, user, supabase };
}

/**
 * Require admin access - throws error if not admin
 * Use this in server actions that require admin access
 */
export async function requireAdmin(): Promise<{
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
}> {
  const result = await checkAdmin();
  if (result.error || !result.user) {
    throw new Error(result.error || "Unauthorized");
  }
  return { user: result.user, supabase: result.supabase };
}
