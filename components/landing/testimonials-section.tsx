"use client";

import { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Testimonial {
  id: string;
  name: string;
  role?: string;
  content: string;
  rating: number;
  image_url?: string;
}

interface TestimonialsSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  testimonials?: Testimonial[];
}

export function TestimonialsSection({
  title = "What Our Customers Say",
  subtitle = "Don't just take our word for it",
  description = "Read what our satisfied customers have to say about our services",
  testimonials: propTestimonials,
}: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(propTestimonials || []);
  const [loading, setLoading] = useState(!propTestimonials);

  useEffect(() => {
    if (propTestimonials) return;

    const fetchTestimonials = async () => {
      try {
        const supabase = createClient();
        
        // Fetch from database if not provided
        const { data: sectionData } = await supabase
          .from("homepage_sections")
          .select("content")
          .eq("section_type", "testimonials")
          .eq("is_active", true)
          .single();

        if (sectionData?.content?.testimonials) {
          setTestimonials(sectionData.content.testimonials);
        } else {
          // Default testimonials if none in DB
          setTestimonials([
            {
              id: "1",
              name: "Rajesh Kumar",
              role: "Homeowner",
              content: "Excellent service! The professional was punctual, skilled, and very courteous. Highly recommended!",
              rating: 5,
            },
            {
              id: "2",
              name: "Priya Sharma",
              role: "Business Owner",
              content: "Great platform for finding reliable professionals. The booking process is smooth and hassle-free.",
              rating: 5,
            },
            {
              id: "3",
              name: "Amit Patel",
              role: "Customer",
              content: "Best service experience I've had. Professional, timely, and quality work guaranteed.",
              rating: 5,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [propTestimonials]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-lg text-primary font-medium">{subtitle}</p>
          )}
          {description && (
            <p className="mt-4 text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="group relative rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
              <div className="mb-4 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="mb-4 text-muted-foreground italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                {testimonial.image_url ? (
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  {testimonial.role && (
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
