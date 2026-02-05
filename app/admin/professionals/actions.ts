"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";

export async function approveProfessional(formData: FormData) {
  const supabase = await createClient();
  const professionalId = formData.get("professionalId") as string;

  if (!professionalId) {
    console.error("Professional ID is required");
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
    console.error("Error updating profile:", profileError.message);
    return;
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
    console.error("Error updating documents:", docError);
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

export async function rejectProfessional(formData: FormData) {
  const supabase = await createClient();
  const professionalId = formData.get("professionalId") as string;
  const reason = formData.get("reason") as string;

  if (!professionalId) {
    console.error("Professional ID is required");
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
    console.error("Error updating profile:", profileError.message);
    return;
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
    console.error("Error updating documents:", docError);
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
