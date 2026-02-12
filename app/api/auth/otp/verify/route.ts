import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";
import type { UserRole } from "@/lib/types/auth";
import { getRoleBasedRedirect } from "@/lib/auth/utils";
import { cookies } from "next/headers";

/**
 * POST /api/auth/otp/verify
 * Verify OTP and sign in/create user
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, otp, role } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required" },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");

    if (formattedPhone.length !== 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    if (otp.length !== 6) {
      return NextResponse.json(
        { error: "OTP must be 6 digits" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Find the OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from("otp_verifications")
      .select("*")
      .eq("phone", formattedPhone)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Check attempts (max 5 attempts)
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: "Maximum verification attempts exceeded. Please request a new OTP." },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      await supabase
        .from("otp_verifications")
        .update({ attempts: otpRecord.attempts + 1 })
        .eq("id", otpRecord.id);

      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await supabase
      .from("otp_verifications")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    // Use admin client for user management
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user exists with this phone number
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("phone", formattedPhone)
      .single();

    let userId: string;
    let userRole: UserRole = (role as UserRole) || existingProfile?.role || "customer";

    // Create virtual email for phone-based auth
    const virtualEmail = `${formattedPhone}@otp.urban.local`;

    if (existingProfile) {
      // User exists
      userId = existingProfile.id;
      userRole = existingProfile.role;

      // Get or create auth user
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);

      if (!authUser?.user) {
        // Create auth user
        const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: virtualEmail,
          phone: `+91${formattedPhone}`,
          email_confirm: false,
          user_metadata: {
            role: userRole,
            phone: formattedPhone,
          },
        });

        if (authError || !newAuthUser.user) {
          logger.error("Failed to create auth user", authError);
          return NextResponse.json(
            { error: "Failed to authenticate. Please try again." },
            { status: 500 }
          );
        }

        userId = newAuthUser.user.id;
      }
    } else {
      // New user - create account
      const { data: newAuthUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: virtualEmail,
        phone: `+91${formattedPhone}`,
        email_confirm: false,
        user_metadata: {
          role: userRole,
          full_name: `User ${formattedPhone}`,
          phone: formattedPhone,
        },
      });

      if (authError || !newAuthUser.user) {
        logger.error("Failed to create new user", authError);
        return NextResponse.json(
          { error: "Failed to create account. Please try again." },
          { status: 500 }
        );
      }

      userId = newAuthUser.user.id;

      // Wait for trigger to create profile
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Verify profile exists, create if not
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: userId,
          role: userRole,
          full_name: `User ${formattedPhone}`,
          phone: formattedPhone,
          is_active: true,
          is_verified: true,
        });
      }
    }

    // Generate a magic link to create a session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: virtualEmail,
    });

    if (sessionError || !sessionData) {
      logger.error("Failed to generate session", sessionError);
      return NextResponse.json(
        { error: "Failed to create session. Please try again." },
        { status: 500 }
      );
    }

    // Generate magic link for session creation
    // The client will use this link to establish the session
    const magicLink = sessionData.properties.action_link;
    
    // Extract token from magic link for client-side session creation
    const url = new URL(magicLink);
    const hashParams = new URLSearchParams(url.hash.substring(1));
    const accessToken = hashParams.get("access_token") || url.searchParams.get("token");

    logger.info("OTP verified successfully", {
      userId,
      phone: formattedPhone,
      role: userRole,
    });

    // Return success with magic link for client to establish session
    return NextResponse.json({
      success: true,
      userId,
      role: userRole,
      redirectPath: getRoleBasedRedirect(userRole),
      magicLink: magicLink, // Client can use this to establish session
      accessToken: accessToken, // Alternative: client can use this directly
    });
  } catch (error) {
    logger.error("Error in verify OTP API", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
