"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function suspendUser(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get("userId") as string;

  if (!userId) {
    console.error("User ID is required");
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

  // Don't allow suspending other admins
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetUser?.role === "admin") {
    console.error("Cannot suspend admin users");
    return;
  }

  // Update user status
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: false,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user status:", error.message);
    return;
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
  logger.info("Admin action: Suspend user", { adminId: user.id, targetUserId: userId });
  revalidatePath("/admin/users");
}

export async function activateUser(formData: FormData) {
  const supabase = await createClient();
  const userId = formData.get("userId") as string;

  if (!userId) {
    console.error("User ID is required");
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

  // Update user status
  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: true,
    })
    .eq("id", userId);

  if (error) {
    console.error("Error updating user status:", error.message);
    return;
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
  logger.info("Admin action: Activate user", { adminId: user.id, targetUserId: userId });
  revalidatePath("/admin/users");
}
