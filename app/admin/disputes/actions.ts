"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function processRefund(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId") as string;
  const refundReason =
    (formData.get("reason") as string) || "Refund processed by admin";

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  // Get booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select("final_amount, customer_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Get payment for this booking
  const { data: payment } = await supabase
    .from("payments")
    .select("id, amount")
    .eq("booking_id", bookingId)
    .single();

  if (!payment) {
    throw new Error("Payment not found");
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
    throw new Error(`Error updating payment: ${paymentError.message}`);
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
    throw new Error(`Error updating booking: ${bookingError.message}`);
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

export async function resolveDispute(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId") as string;
  const resolution =
    (formData.get("resolution") as string) || "Dispute resolved by admin";

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
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
