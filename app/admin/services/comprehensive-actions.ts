"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checkAdmin } from "@/lib/auth/admin-check";

interface PricingVariant {
  id?: string;
  title: string;
  price: number;
  duration_minutes: number;
  discount_price?: number;
  is_popular: boolean;
}

interface Feature {
  id?: string;
  feature_title: string;
}

interface FAQ {
  id?: string;
  question: string;
  answer: string;
}

interface GalleryImage {
  id?: string;
  image_url: string;
  alt_text?: string;
}

interface ServiceData {
  name: string;
  slug: string;
  short_description?: string;
  long_description?: string;
  category: string;
  subcategory?: string;
  service_type?: "normal" | "intense" | "deep";
  thumbnail_image?: string;
  image_url?: string;
  status?: "active" | "inactive" | "suspended";
  duration_label?: string;
  best_for?: string;
  cleaning_type?: string;
  equipment_used?: string;
  warranty_info?: string;
  pricing?: PricingVariant[];
  features?: Feature[];
  faqs?: FAQ[];
  gallery?: GalleryImage[];
  seo?: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string;
  };
}

export async function createComprehensiveService(data: ServiceData) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  try {
    // Start transaction-like operation
    // 1. Create main service record
    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .insert({
        name: data.name,
        slug: data.slug,
        short_description: data.short_description,
        long_description: data.long_description,
        description: data.short_description, // Keep for backward compatibility
        category: data.category,
        subcategory: data.subcategory,
        service_type: data.service_type || "normal",
        thumbnail_image: data.thumbnail_image,
        image_url: data.image_url || data.thumbnail_image,
        status: data.status || "active",
        duration_label: data.duration_label,
        best_for: data.best_for,
        cleaning_type: data.cleaning_type,
        equipment_used: data.equipment_used,
        warranty_info: data.warranty_info,
        base_price: data.pricing && data.pricing.length > 0
          ? Math.min(...data.pricing.map((p) => p.price))
          : 0,
        duration_minutes: data.pricing && data.pricing.length > 0
          ? data.pricing[0].duration_minutes
          : 60,
        created_by: user.id,
      })
      .select()
      .single();

    if (serviceError) {
      return { error: serviceError.message };
    }

    const serviceId = serviceData.id;

    // 2. Create pricing variants
    if (data.pricing && data.pricing.length > 0) {
      const pricingData = data.pricing.map((p, index) => ({
        service_id: serviceId,
        title: p.title,
        price: p.price,
        duration_minutes: p.duration_minutes,
        discount_price: p.discount_price || null,
        is_popular: p.is_popular || false,
        display_order: index,
      }));

      const { error: pricingError } = await supabase
        .from("service_pricing")
        .insert(pricingData);

      if (pricingError) {
        // Rollback: delete service
        await supabase.from("services").delete().eq("id", serviceId);
        return { error: `Failed to create pricing: ${pricingError.message}` };
      }
    }

    // 3. Create features
    if (data.features && data.features.length > 0) {
      const featuresData = data.features.map((f, index) => ({
        service_id: serviceId,
        feature_title: f.feature_title,
        display_order: index,
      }));

      const { error: featuresError } = await supabase
        .from("service_features")
        .insert(featuresData);

      if (featuresError) {
        // Rollback: delete service and pricing
        await supabase.from("service_pricing").delete().eq("service_id", serviceId);
        await supabase.from("services").delete().eq("id", serviceId);
        return { error: `Failed to create features: ${featuresError.message}` };
      }
    }

    // 4. Create FAQs
    if (data.faqs && data.faqs.length > 0) {
      const faqsData = data.faqs.map((f, index) => ({
        service_id: serviceId,
        question: f.question,
        answer: f.answer,
        display_order: index,
      }));

      const { error: faqsError } = await supabase
        .from("service_faq")
        .insert(faqsData);

      if (faqsError) {
        // Rollback
        await supabase.from("service_features").delete().eq("service_id", serviceId);
        await supabase.from("service_pricing").delete().eq("service_id", serviceId);
        await supabase.from("services").delete().eq("id", serviceId);
        return { error: `Failed to create FAQs: ${faqsError.message}` };
      }
    }

    // 5. Create gallery images
    if (data.gallery && data.gallery.length > 0) {
      const galleryData = data.gallery.map((g, index) => ({
        service_id: serviceId,
        image_url: g.image_url,
        alt_text: g.alt_text || null,
        display_order: index,
      }));

      const { error: galleryError } = await supabase
        .from("service_gallery")
        .insert(galleryData);

      if (galleryError) {
        // Rollback
        await supabase.from("service_faq").delete().eq("service_id", serviceId);
        await supabase.from("service_features").delete().eq("service_id", serviceId);
        await supabase.from("service_pricing").delete().eq("service_id", serviceId);
        await supabase.from("services").delete().eq("id", serviceId);
        return { error: `Failed to create gallery: ${galleryError.message}` };
      }
    }

    // 6. Create SEO data
    if (data.seo) {
      const { error: seoError } = await supabase
        .from("service_seo")
        .insert({
          service_id: serviceId,
          meta_title: data.seo.meta_title || null,
          meta_description: data.seo.meta_description || null,
          meta_keywords: data.seo.meta_keywords || null,
        });

      if (seoError) {
        // Rollback
        await supabase.from("service_gallery").delete().eq("service_id", serviceId);
        await supabase.from("service_faq").delete().eq("service_id", serviceId);
        await supabase.from("service_features").delete().eq("service_id", serviceId);
        await supabase.from("service_pricing").delete().eq("service_id", serviceId);
        await supabase.from("services").delete().eq("id", serviceId);
        return { error: `Failed to create SEO: ${seoError.message}` };
      }
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: "service_created",
      target_type: "service",
      target_id: serviceId,
      description: `Created comprehensive service: ${data.name}`,
    });

    revalidatePath("/admin/services");
    return { success: true, serviceId };
  } catch (error: any) {
    return { error: error.message || "Failed to create service" };
  }
}

export async function updateComprehensiveService(
  serviceId: string,
  data: ServiceData
) {
  // Check if user is admin
  const { error, user, supabase } = await checkAdmin();
  if (error || !user || !supabase) {
    return { error: error || "Unauthorized" };
  }

  try {
    // 1. Update main service record
    const { error: serviceError } = await supabase
      .from("services")
      .update({
        name: data.name,
        slug: data.slug,
        short_description: data.short_description,
        long_description: data.long_description,
        description: data.short_description, // Keep for backward compatibility
        category: data.category,
        subcategory: data.subcategory,
        service_type: data.service_type || "normal",
        thumbnail_image: data.thumbnail_image,
        image_url: data.image_url || data.thumbnail_image,
        status: data.status || "active",
        duration_label: data.duration_label,
        best_for: data.best_for,
        cleaning_type: data.cleaning_type,
        equipment_used: data.equipment_used,
        warranty_info: data.warranty_info,
        base_price: data.pricing && data.pricing.length > 0
          ? Math.min(...data.pricing.map((p) => p.price))
          : 0,
        duration_minutes: data.pricing && data.pricing.length > 0
          ? data.pricing[0].duration_minutes
          : 60,
      })
      .eq("id", serviceId);

    if (serviceError) {
      return { error: serviceError.message };
    }

    // 2. Update pricing variants (delete old, insert new)
    await supabase.from("service_pricing").delete().eq("service_id", serviceId);
    if (data.pricing && data.pricing.length > 0) {
      const pricingData = data.pricing.map((p, index) => ({
        service_id: serviceId,
        title: p.title,
        price: p.price,
        duration_minutes: p.duration_minutes,
        discount_price: p.discount_price || null,
        is_popular: p.is_popular || false,
        display_order: index,
      }));

      const { error: pricingError } = await supabase
        .from("service_pricing")
        .insert(pricingData);

      if (pricingError) {
        return { error: `Failed to update pricing: ${pricingError.message}` };
      }
    }

    // 3. Update features (delete old, insert new)
    await supabase.from("service_features").delete().eq("service_id", serviceId);
    if (data.features && data.features.length > 0) {
      const featuresData = data.features.map((f, index) => ({
        service_id: serviceId,
        feature_title: f.feature_title,
        display_order: index,
      }));

      const { error: featuresError } = await supabase
        .from("service_features")
        .insert(featuresData);

      if (featuresError) {
        return { error: `Failed to update features: ${featuresError.message}` };
      }
    }

    // 4. Update FAQs (delete old, insert new)
    await supabase.from("service_faq").delete().eq("service_id", serviceId);
    if (data.faqs && data.faqs.length > 0) {
      const faqsData = data.faqs.map((f, index) => ({
        service_id: serviceId,
        question: f.question,
        answer: f.answer,
        display_order: index,
      }));

      const { error: faqsError } = await supabase
        .from("service_faq")
        .insert(faqsData);

      if (faqsError) {
        return { error: `Failed to update FAQs: ${faqsError.message}` };
      }
    }

    // 5. Update gallery images (delete old, insert new)
    await supabase.from("service_gallery").delete().eq("service_id", serviceId);
    if (data.gallery && data.gallery.length > 0) {
      const galleryData = data.gallery.map((g, index) => ({
        service_id: serviceId,
        image_url: g.image_url,
        alt_text: g.alt_text || null,
        display_order: index,
      }));

      const { error: galleryError } = await supabase
        .from("service_gallery")
        .insert(galleryData);

      if (galleryError) {
        return { error: `Failed to update gallery: ${galleryError.message}` };
      }
    }

    // 6. Update SEO data (upsert)
    if (data.seo) {
      const { error: seoError } = await supabase
        .from("service_seo")
        .upsert({
          service_id: serviceId,
          meta_title: data.seo.meta_title || null,
          meta_description: data.seo.meta_description || null,
          meta_keywords: data.seo.meta_keywords || null,
        });

      if (seoError) {
        return { error: `Failed to update SEO: ${seoError.message}` };
      }
    }

    // Log admin action
    await supabase.from("admin_actions").insert({
      admin_id: user.id,
      action_type: "service_updated",
      target_type: "service",
      target_id: serviceId,
      description: `Updated comprehensive service: ${data.name}`,
    });

    revalidatePath("/admin/services");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update service" };
  }
}

export async function getComprehensiveService(serviceId: string) {
  const supabase = await createClient();

  try {
    // Get service
    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .single();

    if (serviceError) {
      return { error: serviceError.message };
    }

    // Get related data
    const [pricing, features, faqs, gallery, seo] = await Promise.all([
      supabase
        .from("service_pricing")
        .select("*")
        .eq("service_id", serviceId)
        .order("display_order"),
      supabase
        .from("service_features")
        .select("*")
        .eq("service_id", serviceId)
        .order("display_order"),
      supabase
        .from("service_faq")
        .select("*")
        .eq("service_id", serviceId)
        .order("display_order"),
      supabase
        .from("service_gallery")
        .select("*")
        .eq("service_id", serviceId)
        .order("display_order"),
      supabase
        .from("service_seo")
        .select("*")
        .eq("service_id", serviceId)
        .single(),
    ]);

    return {
      success: true,
      data: {
        ...service,
        pricing: pricing.data || [],
        features: features.data || [],
        faqs: faqs.data || [],
        gallery: gallery.data || [],
        seo: seo.data || null,
      },
    };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch service" };
  }
}
