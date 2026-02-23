"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Clock,
  Star,
  Shield,
  CheckCircle2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Service } from "@/lib/types/database";
import { LoadingBar } from "@/components/ui/loading-bar";

interface ServiceWithDetails extends Service {
  rating?: number;
  reviewCount?: number;
  pricing?: Array<{
    id: string;
    title: string;
    price: number;
    duration_minutes: number;
    discount_price?: number | null;
    is_popular: boolean;
  }>;
  features?: Array<{
    id: string;
    feature_title: string;
  }>;
  faqs?: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  gallery?: Array<{
    id: string;
    image_url: string;
    alt_text?: string | null;
  }>;
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [service, setService] = useState<ServiceWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarServices, setSimilarServices] = useState<Service[]>([]);

  const serviceId = params?.id as string;

  useEffect(() => {
    if (serviceId && !authLoading) {
      fetchServiceDetails();
    }
  }, [serviceId, authLoading]);

  const fetchServiceDetails = async () => {
    if (!serviceId) return;

    setLoading(true);
    try {
      const supabase = createClient();

      // Fetch service
      const { data: serviceData, error: serviceError } = await supabase
        .from("services")
        .select("*")
        .eq("id", serviceId)
        .eq("status", "active")
        .single();

      if (serviceError || !serviceData) {
        console.error("Error fetching service:", serviceError);
        setService(null);
        setLoading(false);
        return;
      }

      // Fetch additional data in parallel
      const [pricingResult, featuresResult, faqsResult, galleryResult, reviewsResult] = await Promise.all([
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
          .from("reviews")
          .select("rating")
          .eq("service_id", serviceId)
          .eq("is_visible", true),
      ]);

      // Calculate rating
      const reviews = reviewsResult.data || [];
      const rating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : undefined;

      // Fetch similar services
      const { data: similarData } = await supabase
        .from("services")
        .select("*")
        .eq("category", serviceData.category)
        .eq("status", "active")
        .neq("id", serviceId)
        .limit(4);

      setSimilarServices(similarData || []);

      setService({
        ...serviceData,
        pricing: pricingResult.data || [],
        features: featuresResult.data || [],
        faqs: faqsResult.data || [],
        gallery: galleryResult.data || [],
        rating,
        reviewCount: reviews.length,
      });
    } catch (error) {
      console.error("Error fetching service details:", error);
      setService(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = () => {
    if (!user) {
      router.push(`/login?redirect=/customer/services/${serviceId}`);
      return;
    }
    router.push(`/customer/book-service?serviceId=${serviceId}`);
  };

  if (authLoading || loading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-md">
          <LoadingBar text="Loading service details..." />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">Service not found</h3>
            <p className="text-gray-600 mb-4">
              The service you're looking for doesn't exist or is no longer available.
            </p>
            <Button onClick={() => router.push("/customer/services")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Build images array from gallery or fallback to image_url
  const images = service.gallery && service.gallery.length > 0
    ? service.gallery.map((img) => img.image_url)
    : service.image_url
    ? [service.image_url]
    : [];

  return (
    <div className="w-full">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/customer/services")}
          className="group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Services
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-lg group">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[currentImageIndex]}
                    alt={service.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-2 rounded-full transition-all ${
                              idx === currentImageIndex ? "w-8 bg-white" : "w-2 bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-100 to-teal-100">
                  <span className="text-6xl font-bold text-purple-300">
                    {service.name[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Service Title and Info */}
          <div>
            <div className="mb-4 flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="px-3 py-1 text-sm capitalize"
              >
                {service.category}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
              {service.name}
            </h1>
            {service.rating !== undefined && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">
                    {service.rating.toFixed(1)}
                  </span>
                </div>
                {service.reviewCount !== undefined && (
                  <span className="text-sm text-gray-600">
                    ({service.reviewCount} {service.reviewCount === 1 ? "review" : "reviews"})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing Variants */}
          {service.pricing && service.pricing.length > 0 ? (
            <Card className="bg-gradient-to-br from-purple-50 to-teal-50 border-purple-200">
              <CardHeader>
                <CardTitle>Select Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {service.pricing.map((price) => (
                  <div
                    key={price.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      price.is_popular
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{price.title}</span>
                          {price.is_popular && (
                            <Badge className="bg-purple-600 text-white text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          {price.discount_price ? (
                            <>
                              <span className="text-2xl font-bold">
                                ₹{price.discount_price}
                              </span>
                              <span className="text-lg text-gray-500 line-through">
                                ₹{price.price}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold">
                              ₹{price.price}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{price.duration_minutes} minutes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-purple-50 to-teal-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-6">
                  <div>
                    <span className="text-sm text-gray-600">
                      Starting from
                    </span>
                    <div className="text-4xl font-bold text-purple-600">
                      ₹{service.base_price}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 border-l pl-6">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="text-sm">Duration</div>
                      <div className="font-semibold">
                        {service.duration_minutes} minutes
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {service.description && (
            <Card>
              <CardHeader>
                <CardTitle>About this service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {service.description}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {service.features && service.features.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>What's included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-purple-600 flex-shrink-0" />
                      <span className="text-gray-700">
                        {feature.feature_title}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>What's included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700">
                      Professional and verified service provider
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700">
                      On-time service guarantee
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700">
                      Quality assured work
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-purple-600 flex-shrink-0" />
                    <span className="text-gray-700">
                      100% satisfaction guarantee
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 transition-all hover:shadow-md">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium">
                Verified Professionals
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 transition-all hover:shadow-md">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">4.8+ Rating</span>
            </div>
          </div>

          {/* FAQs Section */}
          {service.faqs && service.faqs.length > 0 && (
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" className="w-full">
                  {service.faqs.map((faq, index) => (
                    <AccordionItem key={faq.id} value={`item-${index}`}>
                      <AccordionTrigger value={`item-${index}`} className="text-left font-semibold">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent value={`item-${index}`} className="text-gray-600 whitespace-pre-line">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Similar Services */}
          {similarServices.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Similar Services</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {similarServices.map((similar) => (
                  <Link key={similar.id} href={`/customer/services/${similar.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{similar.name}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {similar.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-600">
                            ₹{similar.base_price}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {similar.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Booking Card */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <Card className="bg-white shadow-xl border-2 border-purple-200">
              <CardHeader>
                <CardTitle className="text-2xl">Book This Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Starting from
                  </div>
                  <div className="text-4xl font-bold text-purple-600">
                    ₹{service.base_price}
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{service.duration_minutes} minutes</span>
                  </div>
                </div>

                {/* Rating */}
                {service.rating !== undefined && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{service.rating.toFixed(1)}</span>
                    </div>
                    {service.reviewCount !== undefined && (
                      <span className="text-sm text-gray-600">
                        ({service.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}

                {/* Book Button */}
                <Button
                  size="lg"
                  onClick={handleBookService}
                  className="w-full h-14 text-base bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Service
                </Button>

                <p className="text-center text-xs text-gray-600 flex items-center justify-center gap-2">
                  <Shield className="h-3 w-3" />
                  Secure booking • Instant confirmation
                </p>

                {/* What's Included */}
                <div className="pt-4 border-t">
                  <h3 className="font-semibold mb-3">What's Included</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Verified professional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>On-time guarantee</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Quality assured</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <span>Satisfaction guarantee</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
