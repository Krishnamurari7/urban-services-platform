"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBanner(data: {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  link_text?: string;
  position?: number;
  is_active?: boolean;
  start_date?: string | null;
  end_date?: string | null;
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

  const { error } = await supabase.from("homepage_banners").insert({
    ...data,
    created_by: user.id,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/"); // Revalidate homepage to show new banner
  return { success: true };
}

export async function updateBanner(
  bannerId: string,
  data: {
    title?: string;
    description?: string;
    image_url?: string;
    link_url?: string;
    link_text?: string;
    position?: number;
    is_active?: boolean;
    start_date?: string | null;
    end_date?: string | null;
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
    .from("homepage_banners")
    .update(data)
    .eq("id", bannerId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/"); // Revalidate homepage
  return { success: true };
}

export async function deleteBanner(bannerId: string) {
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
    .from("homepage_banners")
    .delete()
    .eq("id", bannerId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/"); // Revalidate homepage
  return { success: true };
}

export async function toggleBannerStatus(bannerId: string, isActive: boolean) {
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
    .from("homepage_banners")
    .update({ is_active: isActive })
    .eq("id", bannerId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/banners");
  revalidatePath("/"); // Revalidate homepage
  return { success: true };
}
