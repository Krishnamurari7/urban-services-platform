/**
 * MSG91 Service
 * Handles OTP sending via MSG91 API
 */

const MSG91_API_URL = "https://control.msg91.com/api/v5/otp";

interface MSG91Response {
  type: string;
  message: string;
  request_id?: string;
}

interface SendOTPParams {
  phone: string;
  otp: string;
  message?: string;
}

/**
 * Send OTP via MSG91
 */
export async function sendOTPViaMSG91({
  phone,
  otp,
  message,
}: SendOTPParams): Promise<{ success: boolean; error?: string; requestId?: string }> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authKey) {
    return {
      success: false,
      error: "MSG91 Auth Key is not configured",
    };
  }

  // Format phone number (add country code 91 for Indian numbers)
  const formattedPhone = phone.replace(/^\+91/, "").replace(/\D/g, "");

  if (formattedPhone.length !== 10) {
    return {
      success: false,
      error: "Invalid phone number. Please enter a valid 10-digit Indian mobile number.",
    };
  }

  // MSG91 requires phone number with country code
  const phoneWithCountryCode = `91${formattedPhone}`;

  try {
    // MSG91 OTP API - Send OTP
    // Build query parameters
    const params = new URLSearchParams({
      authkey: authKey,
      mobile: phoneWithCountryCode,
      otp: otp,
      otp_length: "6",
      otp_expiry: "5", // 5 minutes
    });

    // Add template_id if provided
    if (templateId) {
      params.append("template_id", templateId);
    }

    const response = await fetch(`${MSG91_API_URL}?${params.toString()}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Failed to send OTP. Status: ${response.status}`,
      };
    }

    const data: MSG91Response = await response.json();

    if (data.type === "success" || response.status === 200) {
      return {
        success: true,
        requestId: data.request_id,
      };
    } else {
      return {
        success: false,
        error: data.message || "Failed to send OTP",
      };
    }
  } catch (error) {
    console.error("MSG91 API Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send OTP. Please try again.",
    };
  }
}

/**
 * Generate a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
