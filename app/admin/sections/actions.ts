"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  const supabase = await createClient();

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

  const { error } = await supabase.from("homepage_sections").insert({
    ...data,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
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
  const supabase = await createClient();

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

  const { error } = await supabase
    .from("homepage_sections")
    .update(data)
    .eq("id", sectionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSection(sectionId: string) {
  const supabase = await createClient();

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

  const { error } = await supabase
    .from("homepage_sections")
    .delete()
    .eq("id", sectionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  return { success: true };
}

export async function toggleSectionStatus(sectionId: string, isActive: boolean) {
  const supabase = await createClient();

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

  const { error } = await supabase
    .from("homepage_sections")
    .update({ is_active: isActive })
    .eq("id", sectionId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/sections");
  revalidatePath("/");
  return { success: true };
}
