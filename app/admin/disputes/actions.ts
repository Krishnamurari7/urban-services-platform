"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function processRefund(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const refundReason = formData.get("reason") as string || "Refund processed by admin";

  if (!bookingId) {
    return { error: "Booking ID is required" };
  }

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select("final_amount, customer_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { error: "Booking not found" };
  }

  // Get payment for this booking
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount")
    .eq("booking_id", bookingId)
    .single();

  if (!payment) {
    return { error: "Payment not found" };
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
    return { error: paymentError.message };
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
  return { success: true };
}

export async function resolveDispute(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const resolution = formData.get("resolution") as string || "Dispute resolved by admin";

  if (!bookingId) {
    return { error: "Booking ID is required" };
  }

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized" };
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
  return { success: true };
}
