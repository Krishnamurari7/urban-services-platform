"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    Array.isArray(propTestimonials) ? propTestimonials : []
  );
  const [loading, setLoading] = useState(!propTestimonials || !Array.isArray(propTestimonials));

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

        if (sectionData?.content?.testimonials && Array.isArray(sectionData.content.testimonials)) {
          setTestimonials(sectionData.content.testimonials);
        } else {
          // Default testimonials if none in DB
          setTestimonials([
            {
              id: "1",
              name: "Sarah Jenkins",
              role: "Homeowner",
              content: "The deep cleaning service was incredible. My kitchen looks brand new! The staff was professional and very thorough.",
              rating: 5,
            },
            {
              id: "2",
              name: "Michael Ross",
              role: "Business Owner",
              content: "I've used several services before, but Vera Company is by far the most reliable. Their pricing is fair and the quality is top-notch.",
              rating: 5,
            },
            {
              id: "3",
              name: "Elena G.",
              role: "Real Estate Agent",
              content: "Very impressed with the pest control service. They explained everything and the follow-up was excellent. Highly recommended.",
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

  if (!Array.isArray(testimonials) || testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
            TESTIMONIALS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.isArray(testimonials) && testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-xl bg-gray-800 p-6 text-white"
            >
              <div className="mb-4 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="mb-6 text-gray-200 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                {testimonial.image_url ? (
                  <img
                    src={testimonial.image_url}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  {testimonial.role && (
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
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
