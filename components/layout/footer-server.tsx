import { createClient } from "@/lib/supabase/server";
import { Footer } from "./footer";

async function getFooterSettings() {
  const supabase = await createClient();
  
  try {
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
  } catch (error) {
    console.error("Unexpected error fetching footer settings:", error);
    return null;
  }
}

export async function FooterServer() {
  const footerSettings = await getFooterSettings();

  // Default values
  const defaults = {
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
  const settings = footerSettings 
    ? { ...defaults, ...footerSettings }
    : defaults;

  return <Footer settings={settings} />;
}
