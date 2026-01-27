"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types/auth";

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string, redirectTo?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Failed to sign in" };
  }

  // Get user role from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  revalidatePath("/", "layout");
  
  // Use redirect parameter if provided and valid, otherwise redirect based on role
  let redirectPath: string;
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    // Validate redirect path is safe (starts with /, no protocol-relative URLs)
    redirectPath = redirectTo;
  } else {
    redirectPath = getRoleBasedRedirect(profile?.role || "customer");
  }
  redirect(redirectPath);
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = "customer"
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error) {
    console.error("Auth signup error:", error);
    // Provide more user-friendly error messages
    if (error.message.includes("already registered")) {
      return { error: "This email is already registered. Please sign in instead." };
    }
    if (error.message.includes("password")) {
      return { error: "Password is too weak. Please use a stronger password." };
    }
    if (error.message.includes("email")) {
      return { error: "Invalid email address. Please check and try again." };
    }
    return { error: error.message || "Failed to create account. Please try again." };
  }

  if (!data.user) {
    return { error: "Failed to create account. Please try again." };
  }

  // The trigger should automatically create the profile
  // Wait a moment to ensure trigger execution
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Verify profile was created (optional check)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", data.user.id)
    .single();

  if (!profile) {
    console.warn("Profile was not created by trigger for user:", data.user.id);
    // Try to create profile manually as fallback
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        role: role,
        full_name: fullName,
        is_active: true,
        is_verified: false,
      });

    if (profileError) {
      console.error("Failed to create profile manually:", profileError);
      // Don't fail the signup - user can still sign in
    }
  }

  revalidatePath("/", "layout");
  // redirect() throws a special error that Next.js catches - don't wrap in try-catch
  redirect("/login?message=Check your email to confirm your account");
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }

  return { error: "Failed to initiate Google sign in" };
}

/**
 * Send OTP to phone number
 */
export async function sendOTP(phone: string) {
  const supabase = await createClient();

  // Format phone number (add +91 if not present for Indian numbers)
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

  const { data, error } = await supabase.auth.signInWithOtp({
    phone: formattedPhone,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "OTP sent successfully" };
}

/**
 * Verify OTP and sign in
 */
export async function verifyOTP(phone: string, token: string, redirectTo?: string) {
  const supabase = await createClient();

  // Format phone number
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone}`;

  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: "sms",
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Failed to verify OTP" };
  }

  // Get user role from profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  revalidatePath("/", "layout");

  // Use redirect parameter if provided and valid, otherwise redirect based on role
  let redirectPath: string;
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    redirectPath = redirectTo;
  } else {
    redirectPath = getRoleBasedRedirect(profile?.role || "customer");
  }
  redirect(redirectPath);
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    // Even if there's an error, try to clear the session and redirect
  }

  revalidatePath("/", "layout");
  // redirect() throws a special error that Next.js catches - don't wrap in try-catch
  redirect("/");
}

/**
 * Get the current user session
 */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user };
}

/**
 * Get user role from profile
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.role as UserRole;
}

/**
 * Helper function to get role-based redirect path
 */
function getRoleBasedRedirect(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"; // Admin dashboard
    case "professional":
      return "/professional/dashboard"; // Professional dashboard
    case "customer":
      return "/customer/dashboard"; // Customer dashboard
    default:
      return "/dashboard";
  }
}
