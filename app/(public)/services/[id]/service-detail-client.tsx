"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Clock,
  Star,
  Shield,
  CheckCircle2,
  MapPin,
  Phone,
  Calendar,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

interface PricingVariant {
  id: string;
  title: string;
  price: number;
  duration_minutes: number;
  discount_price?: number | null;
  is_popular: boolean;
}

interface Feature {
  id: string;
  feature_title: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text?: string | null;
}

interface Service {
  id: string;
  name: string;
  slug?: string | null;
  description: string | null;
  short_description?: string | null;
  long_description?: string | null;
  category: string;
  subcategory: string | null;
  base_price: number;
  duration_minutes: number;
  image_url: string | null;
  thumbnail_image?: string | null;
  service_type?: "normal" | "intense" | "deep";
  status: string;
  duration_label?: string | null;
  best_for?: string | null;
  cleaning_type?: string | null;
  equipment_used?: string | null;
  warranty_info?: string | null;
  pricing?: PricingVariant[];
  features?: Feature[];
  faqs?: FAQ[];
  gallery?: GalleryImage[];
  rating?: number | null;
  reviewCount?: number;
}


export default function ServiceDetailClient({ service }: { service: Service }) {
  const { user, role } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [similarServices, setSimilarServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchSimilarServices = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("services")
          .select("*")
          .eq("category", service.category)
          .eq("status", "active")
          .neq("id", service.id)
          .limit(4);
        
        if (data) {
          setSimilarServices(data);
        }
      } catch (error) {
        console.error("Error fetching similar services:", error);
      }
    };

    fetchSimilarServices();
  }, [service.category, service.id]);

  const handleBookNow = () => {
    if (!user) {
      window.location.href = `/login?redirect=/services/${service.id}`;
      return;
    }
    const bookingPath =
      role === "customer"
        ? `/customer/book-service?serviceId=${service.id}`
        : `/login?redirect=/services/${service.id}`;
    window.location.href = bookingPath;
  };

  // Build images array from gallery or fallback to thumbnail/image_url
  const images = service.gallery && service.gallery.length > 0
    ? service.gallery.map((img) => img.image_url)
    : service.thumbnail_image
    ? [service.thumbnail_image]
    : service.image_url
    ? [service.image_url]
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <Link href="/services">
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Services
          </Button>
        </Link>

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
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-400/20 to-purple-400/20">
                    <span className="text-6xl font-bold text-primary/30">
                      {service.name[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="px-3 py-1 text-sm capitalize"
                >
                  {service.category}
                </Badge>
                {service.subcategory && (
                  <Badge
                    variant="outline"
                    className="px-3 py-1 text-sm capitalize"
                  >
                    {service.subcategory}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {service.name}
              </h1>
              {service.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">
                      {service.rating.toFixed(1)}
                    </span>
                  </div>
                  {service.reviewCount && (
                    <span className="text-sm text-muted-foreground">
                      ({service.reviewCount}{" "}
                      {service.reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Pricing Variants */}
            {service.pricing && service.pricing.length > 0 ? (
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <CardTitle>Select Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {service.pricing.map((price) => (
                    <div
                      key={price.id}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                        price.is_popular
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{price.title}</span>
                            {price.is_popular && (
                              <Badge className="bg-primary text-white text-xs">
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
                                <span className="text-lg text-muted-foreground line-through">
                                  ₹{price.price}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold">
                                ₹{price.price}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
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
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-6">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Starting from
                      </span>
                      <div className="text-4xl font-bold">
                        ₹{service.base_price}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground border-l pl-6">
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
            {(service.long_description || service.description || service.short_description) && (
              <Card>
                <CardHeader>
                  <CardTitle>About this service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground leading-relaxed space-y-4">
                    {service.short_description && (
                      <p className="text-lg font-medium text-foreground">
                        {service.short_description}
                      </p>
                    )}
                    {(service.long_description || service.description) && (
                      <p className="whitespace-pre-line">
                        {service.long_description || service.description}
                      </p>
                    )}
                  </div>
                  {(service.duration_label || service.best_for || service.cleaning_type || service.equipment_used || service.warranty_info) && (
                    <div className="mt-6 pt-6 border-t space-y-3">
                      {service.duration_label && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-sm"><strong>Duration:</strong> {service.duration_label}</span>
                        </div>
                      )}
                      {service.best_for && (
                        <div className="text-sm"><strong>Best for:</strong> {service.best_for}</div>
                      )}
                      {service.cleaning_type && (
                        <div className="text-sm"><strong>Cleaning type:</strong> {service.cleaning_type}</div>
                      )}
                      {service.equipment_used && (
                        <div className="text-sm"><strong>Equipment used:</strong> {service.equipment_used}</div>
                      )}
                      {service.warranty_info && (
                        <div className="text-sm"><strong>Warranty:</strong> {service.warranty_info}</div>
                      )}
                    </div>
                  )}
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
                        <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">
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
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Professional and verified service provider
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        On-time service guarantee
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
                        Quality assured work
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">
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
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">
                  Verified Professionals
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 transition-all hover:shadow-md">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">4.8+ Rating</span>
              </div>
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
                      <AccordionContent value={`item-${index}`} className="text-muted-foreground whitespace-pre-line">
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
                  <Link key={similar.id} href={`/services/${similar.id}`}>
                    <Card className="hover:shadow-lg transition-all cursor-pointer">
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-2">{similar.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {similar.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary">
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
              <Card className="bg-white shadow-xl border-2 border-primary/10">
                <CardHeader>
                  <CardTitle className="text-2xl">Book This Service</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price */}
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Starting from
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      ₹{service.base_price}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration_minutes} minutes</span>
                    </div>
                  </div>

                  {/* Rating */}
                  {service.rating && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{service.rating.toFixed(1)}</span>
                      </div>
                      {service.reviewCount && (
                        <span className="text-sm text-muted-foreground">
                          ({service.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Book Button */}
                  <Button
                    size="lg"
                    className="w-full h-14 text-base bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
                    onClick={handleBookNow}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Now
                  </Button>

                  <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Shield className="h-3 w-3" />
                    Secure booking • Instant confirmation
                  </p>

                  {/* What's Included */}
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-3">What's Included</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Verified professional</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>On-time guarantee</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Quality assured</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Satisfaction guarantee</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <section className="mt-12 border-t pt-12">
          <h2 className="mb-6 text-2xl font-bold">Why Choose This Service?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="transition-all hover:shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Service Area
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Available in all major cities with quick response times
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="transition-all hover:shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    Support
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    24/7 customer support available for all your queries
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="transition-all hover:shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Fully insured and protected for your peace of mind
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
