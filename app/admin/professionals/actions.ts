"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function approveProfessional(formData: FormData) {
  const supabase = await createClient();
  const professionalId = formData.get("professionalId") as string;

  if (!professionalId) {
    return { error: "Professional ID is required" };
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
    return { error: profileError.message };
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

  revalidatePath("/admin/professionals");
  return { success: true };
}

export async function rejectProfessional(formData: FormData) {
  const supabase = await createClient();
  const professionalId = formData.get("professionalId") as string;
  const reason = formData.get("reason") as string;

  if (!professionalId) {
    return { error: "Professional ID is required" };
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
    return { error: profileError.message };
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

  revalidatePath("/admin/professionals");
  return { success: true };
}
