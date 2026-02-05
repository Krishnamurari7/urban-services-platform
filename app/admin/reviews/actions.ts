"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized", user: null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Unauthorized", user: null };
  }

  return { error: null, user };
}

export async function approveReview(formData: FormData) {
  const { error, user } = await checkAdmin();
  if (error || !user) {
    console.error("Unauthorized:", error);
    return;
  }

  const supabase = await createClient();
  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    console.error("Review ID is required");
    return;
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_verified: true,
      is_visible: true,
    })
    .eq("id", reviewId);

  if (updateError) {
    console.error("Error updating review:", updateError.message);
    return;
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

export async function rejectReview(formData: FormData) {
  const { error, user } = await checkAdmin();
  if (error || !user) {
    console.error("Unauthorized:", error);
    return;
  }

  const supabase = await createClient();
  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    console.error("Review ID is required");
    return;
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_visible: false,
    })
    .eq("id", reviewId);

  if (updateError) {
    console.error("Error updating review:", updateError.message);
    return;
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

export async function hideReview(formData: FormData) {
  const { error, user } = await checkAdmin();
  if (error || !user) {
    console.error("Unauthorized:", error);
    return;
  }

  const supabase = await createClient();
  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    console.error("Review ID is required");
    return;
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_visible: false,
    })
    .eq("id", reviewId);

  if (updateError) {
    console.error("Error updating review:", updateError.message);
    return;
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

export async function showReview(formData: FormData) {
  const { error, user } = await checkAdmin();
  if (error || !user) {
    console.error("Unauthorized:", error);
    return;
  }

  const supabase = await createClient();
  const reviewId = formData.get("reviewId") as string;

  if (!reviewId) {
    console.error("Review ID is required");
    return;
  }

  const { error: updateError } = await supabase
    .from("reviews")
    .update({
      is_visible: true,
    })
    .eq("id", reviewId);

  if (updateError) {
    console.error("Error updating review:", updateError.message);
    return;
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
