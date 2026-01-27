import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/types/auth";

export interface Session {
  user: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
}

/**
 * Get the current user session on the server with role
 */
export async function getSession(): Promise<Session> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      user: null,
      isAuthenticated: false,
      role: null,
    };
  }

  // Get role from profiles table
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    user,
    isAuthenticated: true,
    role: (profile?.role as UserRole) || null,
  };
}

/**
 * Get the current user on the server
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session.user;
}

/**
 * Get the current user's role from profiles table
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    // Fallback to user metadata if profile doesn't exist
    return (user.user_metadata?.role as UserRole) || null;
  }

  return data.role as UserRole;
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const userRole = await getUserRole();
  return userRole === role;
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return user;
}

/**
 * Require specific role - throws error if user doesn't have the role
 */
export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireAuth();
  const hasRequiredRole = await hasRole(role);

  if (!hasRequiredRole) {
    throw new Error(`Forbidden: ${role} role required`);
  }

  return user;
}
