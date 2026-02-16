"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function approveProfessional(formData: FormData): Promise<void> {
  const professionalId = formData.get("professionalId") as string;

  if (!professionalId) {
    throw new Error("Professional ID is required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  // Update professional verification status
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      is_verified: true,
      is_active: true,
    })
    .eq("id", professionalId)
    .eq("role", "professional");

  if (profileError) {
    throw new Error(`Error updating profile: ${profileError.message}`);
  }

  // Update all pending documents to approved
  const { error: docError } = await supabase
    .from("professional_documents")
    .update({
      status: "approved",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("professional_id", professionalId)
    .eq("status", "pending");

  if (docError) {
    logger.error("Error updating documents:", docError);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "user_activated",
    target_type: "user",
    target_id: professionalId,
    description: `Approved professional: ${professionalId}`,
  });

  logger.info("Admin action: Approved professional", { adminId: user.id, targetProfessionalId: professionalId });
  revalidatePath("/admin/professionals");
}

export async function rejectProfessional(formData: FormData): Promise<void> {
  const professionalId = formData.get("professionalId") as string;
  const reason = formData.get("reason") as string;

  if (!professionalId) {
    throw new Error("Professional ID is required");
  }

  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  // Update professional status
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      is_verified: false,
      is_active: false,
    })
    .eq("id", professionalId)
    .eq("role", "professional");

  if (profileError) {
    throw new Error(`Error updating profile: ${profileError.message}`);
  }

  // Reject all pending documents
  const { error: docError } = await supabase
    .from("professional_documents")
    .update({
      status: "rejected",
      rejection_reason: reason || "Rejected by admin",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
    })
    .eq("professional_id", professionalId)
    .eq("status", "pending");

  if (docError) {
    logger.error("Error updating documents:", docError);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "user_suspended",
    target_type: "user",
    target_id: professionalId,
    description: `Rejected professional: ${professionalId}. Reason: ${reason || "Not specified"}`,
  });

  logger.info("Admin action: Rejected professional", { adminId: user.id, targetProfessionalId: professionalId, reason });
  revalidatePath("/admin/professionals");
}
