import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailClient from "./service-detail-client";

async function getService(id: string) {
  const supabase = await createClient();

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (error || !service) {
    return null;
  }

  // Get comprehensive service data
  const [pricing, features, faqs, gallery, seo, reviews] = await Promise.all([
    supabase
      .from("service_pricing")
      .select("*")
      .eq("service_id", id)
      .order("display_order"),
    supabase
      .from("service_features")
      .select("*")
      .eq("service_id", id)
      .order("display_order"),
    supabase
      .from("service_faq")
      .select("*")
      .eq("service_id", id)
      .order("display_order"),
    supabase
      .from("service_gallery")
      .select("*")
      .eq("service_id", id)
      .order("display_order"),
    supabase
      .from("service_seo")
      .select("*")
      .eq("service_id", id)
      .single(),
    supabase
      .from("reviews")
      .select("rating")
      .eq("service_id", id)
      .eq("is_visible", true),
  ]);

  const rating =
    reviews.data && reviews.data.length > 0
      ? reviews.data.reduce((sum, r) => sum + r.rating, 0) / reviews.data.length
      : null;

  return {
    ...service,
    pricing: pricing.data || [],
    features: features.data || [],
    faqs: faqs.data || [],
    gallery: gallery.data || [],
    seo: seo.data || null,
    rating,
    reviewCount: reviews.data?.length || 0,
  };
}

type ServicePageParams = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: ServicePageParams;
}): Promise<Metadata> {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const title = service.seo?.meta_title || `${service.name} - ${service.category} Service | Vera Company`;
  const description =
    service.seo?.meta_description ||
    service.short_description ||
    service.description ||
    `Book ${service.name} service starting at ₹${service.base_price}. Professional ${service.category.toLowerCase()} service with verified professionals.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: service.thumbnail_image ? [service.thumbnail_image] : service.image_url ? [service.image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: service.thumbnail_image ? [service.thumbnail_image] : service.image_url ? [service.image_url] : [],
    },
    alternates: {
      canonical: `/services/${id}`,
    },
    other: {
      "service:price:amount": service.base_price.toString(),
      "service:price:currency": "INR",
      "service:duration": `${service.duration_minutes} minutes`,
    },
  };
}

export const revalidate = 3600; // Revalidate every hour (ISR)

export default async function ServiceDetailPage({
  params,
}: {
  params: ServicePageParams;
}) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) {
    notFound();
  }

  // Rating already included in getService
  const rating = service.rating;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    provider: {
      "@type": "Organization",
      name: "Vera Company",
      url: process.env.NEXT_PUBLIC_APP_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: service.category,
      itemListElement: (service.pricing && service.pricing.length > 0
        ? service.pricing
        : [{ price: service.base_price }]
      ).map((p: any) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.name,
        },
        price: p.price || service.base_price,
        priceCurrency: "INR",
      })),
    },
    aggregateRating: rating
      ? {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: service.reviewCount || 0,
      }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetailClient service={service} />
    </>
  );
}
