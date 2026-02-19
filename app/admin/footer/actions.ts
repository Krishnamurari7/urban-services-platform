"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function getFooterSettings() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("footer_settings")
    .select("*")
    .eq("is_active", true)
    .single();

  if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
    console.error("Error fetching footer settings:", error);
    return null;
  }

  return data;
}

export async function updateFooterSettings(data: {
  company_name?: string;
  company_description?: string;
  logo_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  quick_links?: Array<{ name: string; url: string }>;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
  cookie_policy_url?: string;
  newsletter_enabled?: boolean;
  newsletter_text?: string;
  copyright_text?: string;
}) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  // Get current active footer settings
  const { data: currentSettings } = await supabase
    .from("footer_settings")
    .select("id")
    .eq("is_active", true)
    .single();

  if (currentSettings) {
    // Update existing active settings
    const { error: updateError } = await supabase
      .from("footer_settings")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", currentSettings.id);

    if (updateError) {
      return { error: updateError.message };
    }
  } else {
    // Create new active settings
    const { error: insertError } = await supabase
      .from("footer_settings")
      .insert({
        ...data,
        is_active: true,
      });

    if (insertError) {
      return { error: insertError.message };
    }
  }

  revalidatePath("/admin/footer");
  // Revalidate all pages that use footer
  revalidatePath("/", "layout");
  revalidatePath("/customer", "layout");
  revalidatePath("/professional", "layout");
  revalidatePath("/admin", "layout");
  
  return { success: true };
}
