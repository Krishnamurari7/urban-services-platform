"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function deleteService(serviceId: string) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  // Check if service has active bookings
  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("service_id", serviceId)
    .in("status", ["pending", "confirmed", "in_progress"])
    .limit(1);

  if (activeBookings && activeBookings.length > 0) {
    return {
      error:
        "Cannot delete service with active bookings. Please cancel bookings first.",
    };
  }

  const { error: deleteError } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId);

  if (deleteError) {
    return { error: deleteError.message };
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "service_deleted",
    target_type: "service",
    target_id: serviceId,
    description: `Deleted service: ${serviceId}`,
  });

  revalidatePath("/admin/services");
  return { success: true };
}
