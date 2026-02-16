"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import Link from "next/link";

interface Professional {
  id: string;
  full_name: string;
  profile_image_url?: string;
  city?: string;
  state?: string;
  rating?: number;
  total_jobs?: number;
  is_verified: boolean;
}

export function FeaturedProfessionalsSection() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const supabase = createClient();
        
        // Get top-rated verified professionals
        const { data: profiles, error } = await supabase
          .from("profiles")
          .select("id, full_name, profile_image_url, city, state, is_verified")
          .eq("role", "professional")
          .eq("is_active", true)
          .eq("is_verified", true)
          .limit(6);

        if (error) {
          console.error("Error fetching professionals:", error);
          setLoading(false);
          return;
        }

        if (profiles) {
          // Get ratings and job counts
          const professionalIds = profiles.map((p) => p.id);
          
          const { data: reviews } = await supabase
            .from("reviews")
            .select("professional_id, rating")
            .in("professional_id", professionalIds);

          const { data: bookings } = await supabase
            .from("bookings")
            .select("professional_id")
            .in("professional_id", professionalIds)
            .eq("status", "completed");

          const ratingMap = new Map<string, { sum: number; count: number }>();
          const jobCountMap = new Map<string, number>();

          reviews?.forEach((r) => {
            const current = ratingMap.get(r.professional_id) || { sum: 0, count: 0 };
            ratingMap.set(r.professional_id, {
              sum: current.sum + r.rating,
              count: current.count + 1,
            });
          });

          bookings?.forEach((b) => {
            jobCountMap.set(b.professional_id, (jobCountMap.get(b.professional_id) || 0) + 1);
          });

          const professionalsWithStats: Professional[] = profiles.map((p) => {
            const rating = ratingMap.get(p.id);
            const avgRating = rating ? rating.sum / rating.count : 0;
            return {
              ...p,
              rating: avgRating > 0 ? avgRating : undefined,
              total_jobs: jobCountMap.get(p.id) || 0,
            };
          });

          // Sort by rating and job count
          professionalsWithStats.sort((a, b) => {
            const ratingDiff = (b.rating || 0) - (a.rating || 0);
            if (ratingDiff !== 0) return ratingDiff;
            return (b.total_jobs || 0) - (a.total_jobs || 0);
          });

          setProfessionals(professionalsWithStats.slice(0, 6));
        }
      } catch (error) {
        console.error("Error in fetchProfessionals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionals();
  }, []);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (professionals.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Featured Professionals
          </h2>
          <p className="text-lg text-muted-foreground">
            Meet our top-rated, verified service professionals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((professional, index) => (
            <motion.div
              key={professional.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xl font-bold">
                        {professional.full_name.charAt(0).toUpperCase()}
                      </div>
                      {professional.is_verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{professional.full_name}</h3>
                      {(professional.city || professional.state) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {[professional.city, professional.state].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                      {professional.rating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm">{professional.rating.toFixed(1)}</span>
                          </div>
                          {professional.total_jobs && professional.total_jobs > 0 && (
                            <span className="text-xs text-muted-foreground">
                              • {professional.total_jobs} jobs
                            </span>
                          )}
                        </div>
                      )}
                      {professional.is_verified && (
                        <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
