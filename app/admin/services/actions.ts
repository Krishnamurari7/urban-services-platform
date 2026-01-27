"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  const supabase = await createClient();

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

  const { error } = await supabase.from("services").insert({
    ...data,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
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
  const supabase = await createClient();

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
    .from("services")
    .update(data)
    .eq("id", serviceId);

  if (error) {
    return { error: error.message };
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
