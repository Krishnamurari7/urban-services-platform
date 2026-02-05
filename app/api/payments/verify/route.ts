import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  verifyPaymentSignature,
  getPaymentDetails,
  mapRazorpayMethod,
} from "@/lib/razorpay";
import { logger } from "@/lib/logger";
import { sendPaymentConfirmation, sendBookingConfirmation } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { orderId, paymentId, signature, bookingId } = body;

    if (!orderId || !paymentId || !signature || !bookingId) {
      return NextResponse.json(
        { error: "Missing required payment verification fields" },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature({
      orderId,
      paymentId,
      signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Fetch payment details from Razorpay
    const paymentResult = await getPaymentDetails(paymentId);

    if (!paymentResult.success || !paymentResult.payment) {
      return NextResponse.json(
        { error: "Failed to verify payment with Razorpay" },
        { status: 500 }
      );
    }

    const payment = paymentResult.payment;

    // Verify profile exists for user
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      logger.error("Profile not found for user", profileError, { userId: user.id });
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Get user details for notifications
    const { data: userData } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    // Verify booking belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, customer_id, final_amount")
      .eq("id", bookingId)
      .eq("customer_id", user.id)
      .single();

    if (bookingError || !booking) {
      logger.error("Booking not found or unauthorized", bookingError, { bookingId, userId: user.id });
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if payment amount matches booking amount
    const paymentAmount = Number(payment.amount) / 100; // Convert from paise to rupees
    if (Math.abs(paymentAmount - Number(booking.final_amount)) > 0.01) {
      logger.warn("Payment amount mismatch", {
        expected: booking.final_amount,
        received: paymentAmount,
        bookingId
      });
      return NextResponse.json(
        { error: "Payment amount mismatch" },
        { status: 400 }
      );
    }

    // Update payment record
    const { data: existingPayment, error: paymentFetchError } = await supabase
      .from("payments")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (paymentFetchError && paymentFetchError.code !== "PGRST116") {
      return NextResponse.json(
        { error: "Failed to fetch payment record" },
        { status: 500 }
      );
    }

    const paymentData = {
      booking_id: bookingId,
      customer_id: user.id,
      amount: paymentAmount,
      status:
        payment.status === "authorized" || payment.status === "captured"
          ? "completed"
          : "failed",
      method: mapRazorpayMethod(payment.method),
      transaction_id: paymentId,
      payment_gateway: "razorpay",
      gateway_response: payment as any,
    };

    if (existingPayment) {
      // Update existing payment
      const { error: updateError } = await supabase
        .from("payments")
        .update(paymentData)
        .eq("id", existingPayment.id);

      if (updateError) {
        logger.error("Failed to update payment record", updateError, { paymentId, bookingId });
        return NextResponse.json(
          { error: `Failed to update payment record: ${updateError.message}` },
          { status: 500 }
        );
      }
      logger.info("Payment record updated", { paymentId, bookingId });
    } else {
      // Create new payment record
      const { error: insertError } = await supabase
        .from("payments")
        .insert(paymentData);

      if (insertError) {
        logger.error("Failed to create payment record", insertError, { paymentId, bookingId });
        return NextResponse.json(
          { error: `Failed to create payment record: ${insertError.message}` },
          { status: 500 }
        );
      }
      logger.info("Payment record created", { paymentId, bookingId });
    }

    // Update booking status to confirmed if payment is successful
    if (payment.status === "authorized" || payment.status === "captured") {
      await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .eq("id", bookingId);

      logger.info("Booking confirmed via payment", { bookingId, paymentId });

      // Send notifications
      if (userData?.email) {
        try {
          await Promise.all([
            sendPaymentConfirmation({
              customerEmail: userData.email,
              customerName: userData.full_name || "Customer",
              bookingId,
              amount: paymentAmount,
              transactionId: paymentId,
            }),
            // Fetch service name for booking confirmation
            supabase
              .from("bookings")
              .select("service:services(name)")
              .eq("id", bookingId)
              .single()
              .then(async ({ data: bData }) => {
                if (bData?.service) {
                  await sendBookingConfirmation({
                    customerEmail: userData.email!,
                    customerName: userData.full_name || "Customer",
                    bookingId,
                    serviceName: (bData.service as any).name,
                    scheduledAt: new Date(payment.created_at * 1000), // Approximate
                    amount: paymentAmount,
                  });
                }
              })
          ]);
        } catch (notifError) {
          logger.error("Failed to send payment notifications", notifError, { bookingId });
        }
      }
    }

    return NextResponse.json({
      success: true,
      paymentId,
      status: payment.status,
    });
  } catch (error: any) {
    logger.error("Unexpected payment verification error", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
