import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendOTPViaMSG91, generateOTP } from "@/lib/services/msg91";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/otp/send
 * Send OTP via MSG91
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Format phone number (remove +91 and non-digits)
    const formattedPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");

    if (formattedPhone.length !== 10) {
      return NextResponse.json(
        { error: "Invalid phone number. Please enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in database
    const supabase = await createClient();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Delete any existing unverified OTPs for this phone
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("phone", formattedPhone)
      .eq("verified", false);

    // Insert new OTP
    const { error: dbError } = await supabase.from("otp_verifications").insert({
      phone: formattedPhone,
      otp: otp,
      expires_at: expiresAt.toISOString(),
      verified: false,
      attempts: 0,
    });

    if (dbError) {
      logger.error("Failed to store OTP in database", dbError);
      return NextResponse.json(
        { error: "Failed to process OTP request" },
        { status: 500 }
      );
    }

    // Send OTP via MSG91
    const smsResult = await sendOTPViaMSG91({
      phone: formattedPhone,
      otp: otp,
    });

    if (!smsResult.success) {
      logger.error("Failed to send OTP via MSG91", null, {
        phone: formattedPhone,
        error: smsResult.error,
      });

      // Clean up the stored OTP if SMS failed
      await supabase
        .from("otp_verifications")
        .delete()
        .eq("phone", formattedPhone)
        .eq("verified", false);

      return NextResponse.json(
        { error: smsResult.error || "Failed to send OTP. Please try again." },
        { status: 500 }
      );
    }

    logger.info("OTP sent successfully", {
      phone: formattedPhone,
      requestId: smsResult.requestId,
    });

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    logger.error("Error in send OTP API", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
