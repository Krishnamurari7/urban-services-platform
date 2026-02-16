"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function createService(data: {
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  base_price: number;
  duration_minutes: number;
  image_url?: string;
  status?: "active" | "inactive" | "suspended";
}) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  const { error: insertError } = await supabase.from("services").insert({
    ...data,
    created_by: user.id,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "service_created",
    target_type: "service",
    description: `Created service: ${data.name}`,
  });

  revalidatePath("/admin/services");
  return { success: true };
}

export async function updateService(
  serviceId: string,
  data: {
    name?: string;
    description?: string;
    category?: string;
    subcategory?: string;
    base_price?: number;
    duration_minutes?: number;
    image_url?: string;
    status?: "active" | "inactive" | "suspended";
  }
) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  const { error: updateError } = await supabase
    .from("services")
    .update(data)
    .eq("id", serviceId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "service_updated",
    target_type: "service",
    target_id: serviceId,
    description: `Updated service: ${serviceId}`,
  });

  revalidatePath("/admin/services");
  return { success: true };
}
