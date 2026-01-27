"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function cancelBooking(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const reason = formData.get("reason") as string;

  if (!bookingId) {
    return { error: "Booking ID is required" };
  }

  if (!reason || reason.trim() === "") {
    return { error: "Cancellation reason is required" };
  }

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  // Verify user is a customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "customer") {
    return { error: "Unauthorized" };
  }

  // Get booking to verify ownership and status
  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select("id, customer_id, status")
    .eq("id", bookingId)
    .single();

  if (fetchError || !booking) {
    return { error: "Booking not found" };
  }

  // Verify ownership
  if (booking.customer_id !== user.id) {
    return { error: "Unauthorized" };
  }

  // Verify booking can be cancelled
  if (booking.status !== "pending" && booking.status !== "confirmed") {
    return { error: `Cannot cancel booking with status: ${booking.status}` };
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason.trim(),
    })
    .eq("id", bookingId)
    .eq("customer_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  // Note: Payment status updates should be handled by admin or via webhook
  // Customers don't have permission to update payments per RLS policies

  revalidatePath(`/customer/bookings/${bookingId}`);
  revalidatePath("/customer/bookings");
  return { success: true };
}
