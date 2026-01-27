import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

/**
 * Create a Razorpay order
 */
export async function createRazorpayOrder(params: {
  amount: number; // Amount in paise (smallest currency unit)
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}) {
  try {
    // Ensure receipt is max 40 characters (Razorpay requirement)
    let receipt = params.receipt || `receipt_${Date.now()}`;
    if (receipt.length > 40) {
      receipt = receipt.substring(0, 40);
    }

    const options = {
      amount: params.amount, // Amount in paise
      currency: params.currency || "INR",
      receipt,
      notes: params.notes || {},
    };

    const order = await razorpay.orders.create(options);
    return { success: true, order };
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return { success: false, error: error.message || "Failed to create order" };
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const { orderId, paymentId, signature } = params;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

  const text = `${orderId}|${paymentId}`;
  const generatedSignature = crypto
    .createHmac("sha256", keySecret)
    .update(text)
    .digest("hex");

  return generatedSignature === signature;
}

/**
 * Fetch payment details from Razorpay
 */
export async function getPaymentDetails(paymentId: string) {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return { success: true, payment };
  } catch (error: any) {
    console.error("Razorpay fetch payment error:", error);
    return { success: false, error: error.message || "Failed to fetch payment" };
  }
}

/**
 * Map Razorpay payment method to our payment_method enum
 */
export function mapRazorpayMethod(razorpayMethod: string | null | undefined): "credit_card" | "debit_card" | "upi" | "wallet" | "net_banking" {
  if (!razorpayMethod) {
    return "upi"; // Default fallback
  }

  const method = razorpayMethod.toLowerCase();
  
  // Map Razorpay methods to our enum
  if (method === "card") {
    return "credit_card"; // Default to credit_card for card payments
  }
  if (method === "debitcard" || method === "debit_card") {
    return "debit_card";
  }
  if (method === "upi") {
    return "upi";
  }
  if (method === "wallet") {
    return "wallet";
  }
  if (method === "netbanking" || method === "net_banking") {
    return "net_banking";
  }
  
  // Default fallback
  return "upi";
}

/**
 * Refund a payment
 */
export async function refundPayment(params: {
  paymentId: string;
  amount?: number; // Amount in paise, if not provided, full refund
  notes?: Record<string, string>;
}) {
  try {
    const refundOptions: any = {
      payment_id: params.paymentId,
      notes: params.notes || {},
    };

    if (params.amount) {
      refundOptions.amount = params.amount;
    }

    const refund = await razorpay.payments.refund(params.paymentId, refundOptions);
    return { success: true, refund };
  } catch (error: any) {
    console.error("Razorpay refund error:", error);
    return { success: false, error: error.message || "Failed to process refund" };
  }
}
