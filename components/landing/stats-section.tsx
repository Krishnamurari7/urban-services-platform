"use client";

import { useState, useEffect } from "react";
import { Users, Star, Award, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Stat {
  id: string;
  label: string;
  value: string;
  icon?: string;
  description?: string;
}

interface StatsSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  stats?: Stat[];
}

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="h-8 w-8" />,
  star: <Star className="h-8 w-8" />,
  award: <Award className="h-8 w-8" />,
  trending: <TrendingUp className="h-8 w-8" />,
};

export function StatsSection({
  title = "Our Impact",
  subtitle = "Numbers that speak for themselves",
  description = "See how we're making a difference",
  stats: propStats,
}: StatsSectionProps) {
  const [stats, setStats] = useState<Stat[]>(propStats || []);
  const [loading, setLoading] = useState(!propStats);

  useEffect(() => {
    if (propStats) return;

    const fetchStats = async () => {
      try {
        const supabase = createClient();
        
        const { data: sectionData } = await supabase
          .from("homepage_sections")
          .select("content")
          .eq("section_type", "stats")
          .eq("is_active", true)
          .single();

        if (sectionData?.content?.stats) {
          setStats(sectionData.content.stats);
        } else {
          // Default stats
          setStats([
            {
              id: "1",
              label: "Happy Customers",
              value: "10K+",
              icon: "users",
              description: "Satisfied customers",
            },
            {
              id: "2",
              label: "Verified Professionals",
              value: "500+",
              icon: "award",
              description: "Background verified",
            },
            {
              id: "3",
              label: "Average Rating",
              value: "4.8★",
              icon: "star",
              description: "Out of 5 stars",
            },
            {
              id: "4",
              label: "Services Completed",
              value: "50K+",
              icon: "trending",
              description: "Successful bookings",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [propStats]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stats.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4">
        {(title || subtitle || description) && (
          <div className="mx-auto max-w-2xl text-center mb-12">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-2 text-lg text-primary font-medium">{subtitle}</p>
            )}
            {description && (
              <p className="mt-4 text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="group flex flex-col items-center rounded-lg border bg-card p-6 text-center transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                {stat.icon && iconMap[stat.icon] ? (
                  iconMap[stat.icon]
                ) : (
                  <TrendingUp className="h-8 w-8" />
                )}
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="font-semibold text-sm mb-1">{stat.label}</div>
              {stat.description && (
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
