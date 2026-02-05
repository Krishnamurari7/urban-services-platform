"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function suspendUser(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get("userId") as string;

  if (!userId) {
    return { error: "User ID is required" };
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

  // Don't allow suspending other admins
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetUser?.role === "admin") {
    return { error: "Cannot suspend admin users" };
  }

  // Update user status
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "user_suspended",
    target_type: "user",
    target_id: userId,
    description: `Suspended user: ${userId}`,
  });

  logger.info("Admin action: Suspend user", { adminId: user.id, targetUserId: userId });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function activateUser(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get("userId") as string;

  if (!userId) {
    return { error: "User ID is required" };
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

  // Update user status
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: true,
    })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "user_activated",
    target_type: "user",
    target_id: userId,
    description: `Activated user: ${userId}`,
  });

  logger.info("Admin action: Activate user", { adminId: user.id, targetUserId: userId });
  revalidatePath("/admin/users");
  return { success: true };
}
