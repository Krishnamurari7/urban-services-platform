"use client";

import { useState, useEffect } from "react";
import { Search, Calendar, CheckCircle2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Step {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface HowItWorksSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  steps?: Step[];
}

const iconMap: Record<string, React.ReactNode> = {
  search: <Search className="h-6 w-6" />,
  calendar: <Calendar className="h-6 w-6" />,
  check: <CheckCircle2 className="h-6 w-6" />,
  star: <Star className="h-6 w-6" />,
};

export function HowItWorksSection({
  title = "How It Works",
  subtitle = "Simple steps to get started",
  description = "Get professional services in just a few easy steps",
  steps: propSteps,
}: HowItWorksSectionProps) {
  const [steps, setSteps] = useState<Step[]>(Array.isArray(propSteps) ? propSteps : []);
  const [loading, setLoading] = useState(!propSteps);

  useEffect(() => {
    if (propSteps) return;

    const fetchSteps = async () => {
      try {
        const supabase = createClient();
        
        const { data: sectionData } = await supabase
          .from("homepage_sections")
          .select("content")
          .eq("section_type", "how_it_works")
          .eq("is_active", true)
          .single();

        if (sectionData?.content?.steps && Array.isArray(sectionData.content.steps)) {
          setSteps(sectionData.content.steps);
        } else {
          // Default steps
          setSteps([
            {
              id: "1",
              title: "Browse Services",
              description: "Explore our wide range of professional services",
              icon: "search",
            },
            {
              id: "2",
              title: "Book Appointment",
              description: "Select a time slot that works for you",
              icon: "calendar",
            },
            {
              id: "3",
              title: "Get Service",
              description: "Our verified professional arrives on time",
              icon: "check",
            },
            {
              id: "4",
              title: "Rate & Review",
              description: "Share your experience and help others",
              icon: "star",
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching steps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSteps();
  }, [propSteps]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!Array.isArray(steps) || steps.length === 0) return null;

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {Array.isArray(steps) && steps.map((step, index) => (
            <div
              key={step.id}
              className="group relative flex flex-col items-center text-center"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-all group-hover:scale-110 group-hover:bg-primary/20">
                {step.icon && iconMap[step.icon] ? (
                  iconMap[step.icon]
                ) : (
                  <CheckCircle2 className="h-6 w-6" />
                )}
              </div>
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                {index + 1}
              </div>
              <h3 className="mb-2 font-semibold text-lg">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+4rem)] hidden h-0.5 w-full bg-primary/20 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
