import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/otp/session
 * Create a session using magic link token
 * This is called by the client after OTP verification
 */
export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Set session using the token
    const { data: session, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    });

    if (sessionError || !session.session || !session.user) {
      logger.error("Failed to create session", sessionError);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }

    logger.info("Session created successfully", {
      userId: session.user.id,
    });

    return NextResponse.json({
      success: true,
      user: session.user,
    });
  } catch (error) {
    logger.error("Error creating session", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
