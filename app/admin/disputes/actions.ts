"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processRefund(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const refundReason =
    (formData.get("reason") as string) || "Refund processed by admin";

  if (!bookingId) {
    console.error("Booking ID is required");
    return;
  }

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Unauthorized: No user found");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    console.error("Unauthorized: User is not an admin");
    return;
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select("final_amount, customer_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    console.error("Booking not found");
    return;
  }

  // Get payment for this booking
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount")
    .eq("booking_id", bookingId)
    .single();

  if (!payment) {
    console.error("Payment not found");
    return;
  }

  // Update payment status to refunded
  const { error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "refunded",
      refund_amount: payment.amount,
      refund_reason: refundReason,
      refunded_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (paymentError) {
    console.error("Error updating payment:", paymentError.message);
    return;
  }

  // Update booking status
  const { error: bookingError } = await supabase
    .from("bookings")
    .update({
      status: "refunded",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (bookingError) {
    console.error("Error updating booking:", bookingError);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "payment_refunded",
    target_type: "payment",
    target_id: payment.id,
    description: `Refunded payment for booking ${bookingId}. Amount: ₹${payment.amount}`,
  });

  revalidatePath("/admin/disputes");
}

export async function resolveDispute(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const resolution =
    (formData.get("resolution") as string) || "Dispute resolved by admin";

  if (!bookingId) {
    console.error("Booking ID is required");
    return;
  }

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Unauthorized: No user found");
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    console.error("Unauthorized: User is not an admin");
    return;
  }

  // Update booking - mark as resolved (you might want to add a resolved status)
  // For now, we'll just log the action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "other",
    target_type: "booking",
    target_id: bookingId,
    description: `Resolved dispute for booking ${bookingId}. Resolution: ${resolution}`,
  });

  revalidatePath("/admin/disputes");
}
