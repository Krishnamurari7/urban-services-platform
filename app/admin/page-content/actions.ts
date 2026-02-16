"use server";

import { checkAdmin } from "@/lib/auth/admin-check";
import { revalidatePath } from "next/cache";

export async function createPageContent(data: {
  page_path: string;
  content_key: string;
  content_type?: string;
  content_value?: string;
  content_json?: any;
  display_order?: number;
  is_active?: boolean;
}) {
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  try {
    const { error: insertError } = await supabase
      .from("page_contents")
      .insert({
        ...data,
        created_by: user.id,
        content_type: data.content_type || "text",
        is_active: data.is_active ?? true,
        display_order: data.display_order ?? 0,
      });

    if (insertError) {
      return { error: insertError.message };
    }

    // Revalidate the page
    revalidatePath(data.page_path);
    revalidatePath("/admin/page-content");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to create page content" };
  }
}

export async function updatePageContent(
  id: string,
  data: {
    content_value?: string;
    content_json?: any;
    content_type?: string;
    display_order?: number;
    is_active?: boolean;
  }
) {
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  try {
    // First get the page_path to revalidate
    const { data: existing } = await supabase
      .from("page_contents")
      .select("page_path")
      .eq("id", id)
      .single();

    const updateData: any = {};
    // Always update these fields if provided, including null values to clear them
    if (data.content_value !== undefined) updateData.content_value = data.content_value;
    if (data.content_json !== undefined) updateData.content_json = data.content_json;
    if (data.content_type !== undefined) updateData.content_type = data.content_type;
    if (data.display_order !== undefined) updateData.display_order = data.display_order;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;
    
    // If no fields to update, return error
    if (Object.keys(updateData).length === 0) {
      return { error: "No fields to update" };
    }

    const { error: updateError } = await supabase
      .from("page_contents")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      return { error: updateError.message };
    }

    // Revalidate the page
    if (existing?.page_path) {
      revalidatePath(existing.page_path);
    }
    revalidatePath("/admin/page-content");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update page content" };
  }
}

export async function deletePageContent(id: string) {
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  try {
    // First get the page_path to revalidate
    const { data: existing } = await supabase
      .from("page_contents")
      .select("page_path")
      .eq("id", id)
      .single();

    const { error: deleteError } = await supabase
      .from("page_contents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return { error: deleteError.message };
    }

    // Revalidate the page
    if (existing?.page_path) {
      revalidatePath(existing.page_path);
    }
    revalidatePath("/admin/page-content");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete page content" };
  }
}

export async function getPageContentsForAdmin(pagePath?: string) {
  const { error, supabase } = await checkAdmin();
  if (error || !supabase) {
    return { error: error || "Unauthorized", data: null };
  }

  try {
    let query = supabase
      .from("page_contents")
      .select("*")
      .order("page_path", { ascending: true })
      .order("display_order", { ascending: true });

    if (pagePath) {
      query = query.eq("page_path", pagePath);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      return { error: fetchError.message, data: null };
    }

    return { data: data || [], error: null };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch page contents", data: null };
  }
}
