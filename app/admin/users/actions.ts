"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function suspendUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  // Don't allow suspending other admins
  const { data: targetUser } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetUser?.role === "admin") {
    throw new Error("Cannot suspend admin users");
  }

  // Update user status
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      is_active: false,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(`Error updating user status: ${updateError.message}`);
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
}

export async function activateUser(formData: FormData): Promise<void> {
  const userId = formData.get("userId") as string;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  // Update user status
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      is_active: true,
    })
    .eq("id", userId);

  if (updateError) {
    throw new Error(`Error updating user status: ${updateError.message}`);
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
}
