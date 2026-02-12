"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Partner {
  id: string;
  name: string;
  logo_url?: string;
  website_url?: string;
}

interface PartnersSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  partners?: Partner[];
}

export function PartnersSection({
  title = "Trusted By",
  subtitle = "Join thousands of satisfied customers",
  description = "We're trusted by leading brands and individuals",
  partners: propPartners,
}: PartnersSectionProps) {
  const [partners, setPartners] = useState<Partner[]>(propPartners || []);
  const [loading, setLoading] = useState(!propPartners);

  useEffect(() => {
    if (propPartners) return;

    const fetchPartners = async () => {
      try {
        const supabase = createClient();
        
        const { data: sectionData } = await supabase
          .from("homepage_sections")
          .select("content")
          .eq("section_type", "partners")
          .eq("is_active", true)
          .single();

        if (sectionData?.content?.partners) {
          setPartners(sectionData.content.partners);
        } else {
          // Default partners/logos can be added here
          setPartners([]);
        }
      } catch (error) {
        console.error("Error fetching partners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [propPartners]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (partners.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
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
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="group flex items-center justify-center rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:-translate-y-1"
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="h-12 w-auto object-contain opacity-60 transition-opacity group-hover:opacity-100"
                />
              ) : (
                <div className="text-center">
                  <div className="text-lg font-semibold text-muted-foreground">
                    {partner.name}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
