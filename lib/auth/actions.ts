"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { UserRole } from "@/lib/types/auth";
import { logger } from "@/lib/logger";
import { getRoleBasedRedirect } from "./utils";

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string,
  redirectTo?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logger.warn("Login failed", { email, error: error.message });
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Failed to sign in" };
  }

  // Get user role from profile
  let { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // If profile is not found, try to fallback to metadata
  if (!profile) {
    logger.warn("Profile not found immediately after login, checking metadata", { userId: data.user.id });
    const metaRole = data.user.user_metadata?.role as UserRole;
    if (metaRole) {
      profile = { role: metaRole };
    }
  }

  revalidatePath("/", "layout");

  // Use redirect parameter if provided and valid, otherwise redirect based on role
  let redirectPath: string;
  if (
    redirectTo &&
    redirectTo.startsWith("/") &&
    !redirectTo.startsWith("//")
  ) {
    // Validate redirect path is safe (starts with /, no protocol-relative URLs)
    redirectPath = redirectTo;
  } else {
    redirectPath = getRoleBasedRedirect(profile?.role || "customer");
  }

  // Return success with redirect path for client-side handling
  logger.info("Login successful", { userId: data.user.id, role: profile?.role });
  return { success: true, redirectPath };
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
    logger.error("Signup failed", error, { email, role });
    // Provide more user-friendly error messages
    if (error.message.includes("already registered")) {
      return {
        error: "This email is already registered. Please sign in instead.",
      };
    }
    if (error.message.includes("password")) {
      return { error: "Password is too weak. Please use a stronger password." };
    }
    if (error.message.includes("email")) {
      return { error: "Invalid email address. Please check and try again." };
    }
    return {
      error: error.message || "Failed to create account. Please try again.",
    };
  }

  if (!data.user) {
    logger.error("Signup failed: No user returned", null, { email });
    return { error: "Failed to create account. Please try again." };
  }

  logger.info("Signup successful", { userId: data.user.id, role });

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
    const { error: profileError } = await supabase.from("profiles").insert({
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
 * Send OTP to phone number via MSG91
 */
export async function sendOTP(phone: string) {
  try {
    const formattedPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");

    if (formattedPhone.length !== 10) {
      return { error: "Invalid phone number. Please enter a valid 10-digit Indian mobile number." };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: formattedPhone }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { error: data.error || "Failed to send OTP" };
    }

    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    logger.error("Error sending OTP", error);
    return { error: "Failed to send OTP. Please try again." };
  }
}

/**
 * Verify OTP and sign in via MSG91
 */
export async function verifyOTP(
  phone: string,
  token: string,
  redirectTo?: string
) {
  try {
    const formattedPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");

    if (formattedPhone.length !== 10) {
      return { error: "Invalid phone number" };
    }

    if (token.length !== 6) {
      return { error: "OTP must be 6 digits" };
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/otp/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phone: formattedPhone, otp: token }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return { error: data.error || "Failed to verify OTP" };
    }

    // After verification, we need to establish a Supabase session
    // The API returns userId, but we need to create a session
    // We'll use the admin API to generate a session token
    const supabase = await createClient();
    
    // Create a session by signing in with a temporary password approach
    // Actually, we'll need to use a different method - let's create a session via admin API
    // For now, we'll return success and handle session creation on client side via a callback
    
    revalidatePath("/", "layout");

    // Use redirect parameter if provided and valid, otherwise redirect based on role
    let redirectPath: string;
    if (
      redirectTo &&
      redirectTo.startsWith("/") &&
      !redirectTo.startsWith("//")
    ) {
      redirectPath = redirectTo;
    } else {
      redirectPath = data.redirectPath || getRoleBasedRedirect(data.role || "customer");
    }

    logger.info("OTP Login successful", { userId: data.userId, role: data.role });
    
    // Return session token if available, otherwise client will need to handle session
    return { 
      success: true, 
      redirectPath,
      userId: data.userId,
      role: data.role,
      sessionToken: data.sessionToken, // If API provides it
      magicLink: data.magicLink, // Pass through from API
      accessToken: data.accessToken, // Pass through from API
      refreshToken: data.refreshToken, // Pass through from API
    };
  } catch (error) {
    logger.error("Error verifying OTP", error);
    return { error: "Failed to verify OTP. Please try again." };
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.error("Sign out error", error);
    // Even if there's an error, try to clear the session and redirect
  } else {
    logger.info("Sign out successful");
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

// Internal usage already uses the imported getRoleBasedRedirect
