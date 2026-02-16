"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Get page content by path and key
 * Returns the content value or null if not found
 */
export async function getPageContent(
  pagePath: string,
  contentKey: string
): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("content_value, content_json")
      .eq("page_path", pagePath)
      .eq("content_key", contentKey)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    // If content_json exists, return it as stringified JSON
    if (data.content_json) {
      return JSON.stringify(data.content_json);
    }

    return data.content_value || null;
  } catch (error) {
    console.error(`Error fetching page content for ${pagePath}/${contentKey}:`, error);
    return null;
  }
}

/**
 * Get all content for a specific page
 * Returns a map of content_key -> content_value
 */
export async function getPageContents(
  pagePath: string
): Promise<Record<string, string | any>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("page_contents")
      .select("content_key, content_value, content_json, content_type")
      .eq("page_path", pagePath)
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error || !data) {
      return {};
    }

    const contents: Record<string, string | any> = {};
    data.forEach((item) => {
      if (item.content_json) {
        contents[item.content_key] = item.content_json;
      } else {
        contents[item.content_key] = item.content_value;
      }
    });

    return contents;
  } catch (error) {
    console.error(`Error fetching page contents for ${pagePath}:`, error);
    return {};
  }
}

/**
 * Get page content with fallback to default value
 */
export async function getPageContentWithFallback(
  pagePath: string,
  contentKey: string,
  defaultValue: string
): Promise<string> {
  const content = await getPageContent(pagePath, contentKey);
  return content || defaultValue;
}
