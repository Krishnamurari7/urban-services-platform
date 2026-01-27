import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createRazorpayOrder } from "@/lib/razorpay";

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
    const { bookingId, amount } = body;

    if (!bookingId || !amount) {
      return NextResponse.json(
        { error: "Booking ID and amount are required" },
        { status: 400 }
      );
    }

    // Verify booking belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, customer_id, final_amount, status")
      .eq("id", bookingId)
      .eq("customer_id", user.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found or unauthorized" },
        { status: 404 }
      );
    }

    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Booking is not in pending status" },
        { status: 400 }
      );
    }

    // Convert amount to paise (Razorpay uses smallest currency unit)
    const amountInPaise = Math.round(amount * 100);

    // Create a receipt that's max 40 characters (Razorpay requirement)
    // Use first 32 chars of UUID (without hyphens) with "bk_" prefix = 35 chars
    const receiptId = bookingId.replace(/-/g, "").substring(0, 32);
    const receipt = `bk_${receiptId}`;

    // Create Razorpay order
    const orderResult = await createRazorpayOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt,
      notes: {
        booking_id: bookingId,
        customer_id: user.id,
      },
    });

    if (!orderResult.success) {
      return NextResponse.json(
        { error: orderResult.error || "Failed to create payment order" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: orderResult.order?.id,
      amount: orderResult.order?.amount,
      currency: orderResult.order?.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
