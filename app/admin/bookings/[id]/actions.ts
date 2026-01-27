"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateBookingStatus(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const status = formData.get("status") as string;

  if (!bookingId || !status) {
    return { error: "Booking ID and status are required" };
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

  const updateData: any = {
    status,
  };

  if (status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("bookings")
    .update(updateData)
    .eq("id", bookingId);

  if (error) {
    return { error: error.message };
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
  return { success: true };
}

export async function cancelBooking(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const reason = formData.get("reason") as string || "Cancelled by admin";

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

  const { error } = await supabase
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason,
    })
    .eq("id", bookingId);

  if (error) {
    return { error: error.message };
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
  return { success: true };
}

export async function assignProfessional(formData: FormData) {
  const supabase = await createClient();
  const bookingId = formData.get("bookingId") as string;
  const professionalId = formData.get("professionalId") as string;

  if (!bookingId || !professionalId) {
    return { error: "Booking ID and Professional ID are required" };
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

  // Verify professional exists and is active
  const { data: professional } = await supabase
    .from("profiles")
    .select("id, full_name, role, is_active")
    .eq("id", professionalId)
    .eq("role", "professional")
    .single();

  if (!professional || !professional.is_active) {
    return { error: "Invalid or inactive professional" };
  }

  // Get booking to verify service
  const { data: booking } = await supabase
    .from("bookings")
    .select("service_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { error: "Booking not found" };
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
    return { error: "Professional does not offer this service" };
  }

  // Update booking
  const { error } = await supabase
    .from("bookings")
    .update({
      professional_id: professionalId,
      status: "confirmed",
    })
    .eq("id", bookingId);

  if (error) {
    return { error: error.message };
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
  return { success: true };
}