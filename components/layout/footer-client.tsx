"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Footer } from "./footer";

interface FooterSettings {
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
}

export function FooterClient() {
  const [settings, setSettings] = useState<FooterSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFooterSettings() {
      const supabase = createClient();
      
      try {
        const { data, error } = await supabase
          .from("footer_settings")
          .select("*")
          .eq("is_active", true)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching footer settings:", error);
        }

        setSettings(data);
      } catch (error) {
        console.error("Unexpected error fetching footer settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFooterSettings();
  }, []);

  // Default values
  const defaults: FooterSettings = {
    company_name: "Vera Company",
    company_description: "Your one-stop destination for reliable and professional home services. We bring the experts to you.",
    logo_url: "/logo.png",
    phone: "+1 (555) 123-4567",
    email: "support@veracompany.com",
    address: "123 Main St, Suite 500, San Francisco, CA 94107",
    facebook_url: "https://facebook.com",
    instagram_url: "https://instagram.com",
    twitter_url: "https://twitter.com",
    linkedin_url: "",
    quick_links: [
      { name: "About Us", url: "/about" },
      { name: "Our Services", url: "/services" },
      { name: "Expert Partners", url: "/become-professional" },
      { name: "Pricing Plans", url: "/#pricing" },
      { name: "Careers", url: "/careers" },
    ],
    privacy_policy_url: "/privacy-policy",
    terms_of_service_url: "/terms-of-service",
    cookie_policy_url: "/cookies",
    newsletter_enabled: true,
    newsletter_text: "Subscribe for latest updates and offers.",
    copyright_text: "All rights reserved.",
  };

  // Merge settings with defaults, prioritizing settings
  const finalSettings = settings ? { ...defaults, ...settings } : defaults;

  if (loading) {
    // Show footer with defaults while loading
    return <Footer settings={defaults} />;
  }

  return <Footer settings={finalSettings} />;
}
