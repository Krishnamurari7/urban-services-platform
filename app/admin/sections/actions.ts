"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

export async function createSection(data: {
  section_type: string;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: Record<string, any>;
  image_url?: string;
  background_color?: string;
  text_color?: string;
  position?: number;
  display_order?: number;
  is_active?: boolean;
}) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  const { error: dbError } = await supabase.from("homepage_sections").insert({
    ...data,
    created_by: user.id,
  });

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  return { success: true };
}

export async function updateSection(
  sectionId: string,
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    content?: Record<string, any>;
    image_url?: string;
    background_color?: string;
    text_color?: string;
    position?: number;
    display_order?: number;
    is_active?: boolean;
  }
) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  const { error: dbError } = await supabase
    .from("homepage_sections")
    .update(data)
    .eq("id", sectionId);

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSection(sectionId: string) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  const { error: dbError } = await supabase
    .from("homepage_sections")
    .delete()
    .eq("id", sectionId);

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  return { success: true };
}

export async function toggleSectionStatus(sectionId: string, isActive: boolean) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  const { error: dbError } = await supabase
    .from("homepage_sections")
    .update({ is_active: isActive })
    .eq("id", sectionId);

  if (dbError) {
    return { error: dbError.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  return { success: true };
}
