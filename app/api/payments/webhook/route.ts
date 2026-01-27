import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPaymentSignature, mapRazorpayMethod } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const keySecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Invalid webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    // Handle payment events
    if (eventType === "payment.authorized" || eventType === "payment.captured") {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;

      // Extract booking ID from notes
      const bookingId = payment.notes?.booking_id;
      const customerId = payment.notes?.customer_id;

      if (!bookingId || !customerId) {
        console.error("Missing booking_id or customer_id in payment notes");
        return NextResponse.json({ received: true });
      }

      const supabase = await createClient();

      // Update payment record
      const paymentData = {
        amount: payment.amount / 100, // Convert from paise to rupees
        status: eventType === "payment.captured" ? "completed" : "processing",
        method: mapRazorpayMethod(payment.method),
        transaction_id: paymentId,
        payment_gateway: "razorpay",
        gateway_response: payment as any,
      };

      // Find existing payment record
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("booking_id", bookingId)
        .single();

      if (existingPayment) {
        await supabase
          .from("payments")
          .update(paymentData)
          .eq("id", existingPayment.id);
      } else {
        await supabase.from("payments").insert({
          booking_id: bookingId,
          customer_id: customerId,
          ...paymentData,
        });
      }

      // Update booking status
      if (eventType === "payment.captured") {
        await supabase
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", bookingId);
      }
    }

    // Handle refund events
    if (eventType === "refund.created" || eventType === "refund.processed") {
      const refund = payload.refund.entity;
      const paymentId = refund.payment_id;

      const supabase = await createClient();

      // Find payment record
      const { data: payment } = await supabase
        .from("payments")
        .select("id, booking_id")
        .eq("transaction_id", paymentId)
        .single();

      if (payment) {
        await supabase
          .from("payments")
          .update({
            refund_amount: refund.amount / 100,
            refund_reason: refund.notes?.reason || "Refund processed",
            refunded_at: new Date().toISOString(),
            status: "refunded",
          })
          .eq("id", payment.id);

        // Update booking status
        await supabase
          .from("bookings")
          .update({ status: "refunded" })
          .eq("id", payment.booking_id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
