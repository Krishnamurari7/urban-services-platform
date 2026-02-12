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

  // Get average rating for SEO
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("service_id", id)
    .eq("is_visible", true);

  const rating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return {
    ...service,
    rating,
    reviewCount: reviews?.length || 0,
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

  const title = `${service.name} - ${service.category} Service | Vera Company`;
  const description =
    service.description ||
    `Book ${service.name} service starting at ₹${service.base_price}. Professional ${service.category.toLowerCase()} service with verified professionals.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: service.image_url ? [service.image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: service.image_url ? [service.image_url] : [],
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

  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("service_id", service.id)
    .eq("is_visible", true);

  const rating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;


  if (!service) {
    notFound();
  }

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
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.name,
          },
          price: service.base_price,
          priceCurrency: "INR",
        },
      ],
    },
    aggregateRating: rating
      ? {
        "@type": "AggregateRating",
        ratingValue: rating,
        reviewCount: reviews?.length || 0,
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
