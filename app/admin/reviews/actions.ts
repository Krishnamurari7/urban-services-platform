"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function approveReview(formData: FormData): Promise<void> {
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }
  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_verified: true,
      is_visible: true,
    })
    .eq("id", reviewId);

  if (updateError) {
    throw new Error(`Error updating review: ${updateError.message}`);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "other",
    target_type: "review",
    target_id: reviewId,
    description: `Approved review ${reviewId}`,
  });

  revalidatePath("/admin/reviews");
}

export async function rejectReview(formData: FormData): Promise<void> {
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_visible: false,
    })
    .eq("id", reviewId);

  if (updateError) {
    throw new Error(`Error updating review: ${updateError.message}`);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "other",
    target_type: "review",
    target_id: reviewId,
    description: `Rejected review ${reviewId}`,
  });

  revalidatePath("/admin/reviews");
}

export async function hideReview(formData: FormData): Promise<void> {
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_visible: false,
    })
    .eq("id", reviewId);

  if (updateError) {
    throw new Error(`Error updating review: ${updateError.message}`);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "other",
    target_type: "review",
    target_id: reviewId,
    description: `Hidden review ${reviewId}`,
  });

  revalidatePath("/admin/reviews");
}

export async function showReview(formData: FormData): Promise<void> {
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    throw new Error(error || "Unauthorized");
  }

  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    throw new Error("Review ID is required");
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_visible: true,
    })
    .eq("id", reviewId);

  if (updateError) {
    throw new Error(`Error updating review: ${updateError.message}`);
  }

  // Log admin action
  await supabase.from("admin_actions").insert({
    admin_id: user.id,
    action_type: "other",
    target_type: "review",
    target_id: reviewId,
    description: `Made review ${reviewId} visible`,
  });

  revalidatePath("/admin/reviews");
}
