"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Star,
  Shield,
  CheckCircle2,
  MapPin,
  Phone,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";

interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  base_price: number;
  duration_minutes: number;
  image_url: string | null;
  status: string;
  rating?: number | null;
  reviewCount?: number;
}

export default function ServiceDetailClient({ service }: { service: Service }) {
  const { user, role } = useAuth();

  const handleBookNow = () => {
    if (!user) {
      window.location.href = `/login?redirect=/services/${service.id}`;
      return;
    }
    const bookingPath = role === "customer" 
      ? `/customer/book-service?service=${service.id}`
      : `/login?redirect=/services/${service.id}`;
    window.location.href = bookingPath;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/services">
          <Button variant="ghost" className="mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Services
          </Button>
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted shadow-lg">
              {service.image_url ? (
                <Image
                  src={service.image_url}
                  alt={service.name}
                  fill
                  className="object-cover transition-transform hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                  <span className="text-6xl font-bold text-primary/30">
                    {service.name[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="px-3 py-1 text-sm capitalize">{service.category}</Badge>
                {service.subcategory && (
                  <Badge variant="outline" className="px-3 py-1 text-sm capitalize">{service.subcategory}</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                {service.name}
              </h1>
              {service.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">{service.rating.toFixed(1)}</span>
                  </div>
                  {service.reviewCount && (
                    <span className="text-sm text-muted-foreground">
                      ({service.reviewCount} {service.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Price and Duration */}
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-6">
                  <div>
                    <span className="text-sm text-muted-foreground">Starting from</span>
                    <div className="text-4xl font-bold">₹{service.base_price}</div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground border-l pl-6">
                    <Clock className="h-5 w-5" />
                    <div>
                      <div className="text-sm">Duration</div>
                      <div className="font-semibold">{service.duration_minutes} minutes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {service.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About this service</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle>What's included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Professional and verified service provider</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">On-time service guarantee</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">Quality assured work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-muted-foreground">100% satisfaction guarantee</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 transition-all hover:shadow-md">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Verified Professionals</span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 transition-all hover:shadow-md">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">4.8+ Rating</span>
              </div>
            </div>

            {/* Book Button */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full h-12 text-base shadow-lg hover:shadow-xl transition-all"
                onClick={handleBookNow}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book Now
              </Button>
              <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Shield className="h-4 w-4" />
                Secure booking • Instant confirmation
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info Section */}
        <section className="mt-12 border-t pt-12">
          <h2 className="mb-6 text-2xl font-bold">Why Choose This Service?</h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="transition-all hover:shadow-lg">
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
            <Card className="transition-all hover:shadow-lg">
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
            <Card className="transition-all hover:shadow-lg">
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
          </div>
        </section>
      </div>
    </div>
  );
}
