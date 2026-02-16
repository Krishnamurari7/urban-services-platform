"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

/**
 * Client-side hook to get page content
 */
export function usePageContent(pagePath: string, contentKey: string, defaultValue: string = "") {
  const [content, setContent] = useState<string>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("page_contents")
          .select("content_value, content_json")
          .eq("page_path", pagePath)
          .eq("content_key", contentKey)
          .eq("is_active", true)
          .single();

        if (!error && data) {
          if (data.content_json) {
            setContent(JSON.stringify(data.content_json));
          } else {
            setContent(data.content_value || defaultValue);
          }
        } else {
          setContent(defaultValue);
        }
      } catch (error) {
        console.error(`Error fetching page content for ${pagePath}/${contentKey}:`, error);
        setContent(defaultValue);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [pagePath, contentKey, defaultValue]);

  return { content, loading };
}

/**
 * Get all page contents for a page (client-side)
 */
export function usePageContents(pagePath: string) {
  const [contents, setContents] = useState<Record<string, string | any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("page_contents")
          .select("content_key, content_value, content_json, content_type")
          .eq("page_path", pagePath)
          .eq("is_active", true)
          .order("display_order", { ascending: true });

        if (!error && data) {
          const contentMap: Record<string, string | any> = {};
          data.forEach((item) => {
            if (item.content_json) {
              contentMap[item.content_key] = item.content_json;
            } else {
              contentMap[item.content_key] = item.content_value;
            }
          });
          setContents(contentMap);
        }
      } catch (error) {
        console.error(`Error fetching page contents for ${pagePath}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [pagePath]);

  return { contents, loading };
}
