"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function updateBookingStatus(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId") as string;
  const status = formData.get("status") as string;

  if (!bookingId || !status) {
    throw new Error("Booking ID and status are required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  const updateData: any = {
    status,
  };

  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (updateError) {
    throw new Error(`Error updating booking status: ${updateError.message}`);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "other",
    target_type: "booking",
    target_id: bookingId,
    description: `Updated booking status to ${status}`,
  });

  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}

export async function cancelBooking(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId") as string;
  const reason = (formData.get("reason") as string) || "Cancelled by admin";

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq("id", bookingId);

  if (updateError) {
    throw new Error(`Error cancelling booking: ${updateError.message}`);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "booking_cancelled",
    target_type: "booking",
    target_id: bookingId,
    description: `Cancelled booking. Reason: ${reason}`,
  });

  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}

export async function assignProfessional(formData: FormData): Promise<void> {
  const bookingId = formData.get("bookingId") as string;
  const professionalId = formData.get("professionalId") as string;

  if (!bookingId || !professionalId) {
    throw new Error("Booking ID and Professional ID are required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  // Verify professional exists and is active
  const { data: professional } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", professionalId)
    .eq("role", "professional")
    .single();

  if (!professional || !professional.is_active) {
    throw new Error("Invalid or inactive professional");
  }

  // Get booking to verify service
  const { data: booking } = await supabase
    .from("bookings")
    .select("service_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Verify professional offers this service
  const { data: professionalService } = await supabase
    .from("professional_services")
    .select("id")
    .eq("professional_id", professionalId)
    .eq("service_id", booking.service_id)
    .eq("is_available", true)
    .single();

  if (!professionalService) {
    throw new Error("Professional does not offer this service");
  }

  // Update booking
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      professional_id: professionalId,
      status: "confirmed",
    })
    .eq("id", bookingId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "other",
    target_type: "booking",
    target_id: bookingId,
    description: `Assigned professional ${professional.full_name} to booking ${bookingId}`,
  });

  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin/bookings");
}
