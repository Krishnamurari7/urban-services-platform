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

  const title = `${service.name} - ${service.category} Service | vera company`;
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
      canonical: `/services/${params.id}`,
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

  return <ServiceDetailClient service={service} />;
}
