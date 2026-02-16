"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function CTASection() {
    const [ctaData, setCtaData] = useState({
        title: "Ready to Experience a Spotless Home?",
        description: "Join over 10,000 happy customers and book your first service today with a 20% discount.",
        primaryButtonText: "Book a Service Now",
        primaryButtonLink: "/services",
        secondaryButtonText: "Download App",
        secondaryButtonLink: "/#download-app",
        backgroundColor: "#2563EB",
    });

    useEffect(() => {
        const fetchCTAData = async () => {
            try {
                const supabase = createClient();
                const { data: sectionData } = await supabase
                    .from("homepage_sections")
                    .select("*")
                    .eq("section_type", "cta")
                    .eq("is_active", true)
                    .single();

                if (sectionData?.content) {
                    setCtaData({
                        title: sectionData.content.title || sectionData.title || ctaData.title,
                        description: sectionData.content.description || sectionData.description || ctaData.description,
                        primaryButtonText: sectionData.content.primaryButtonText || ctaData.primaryButtonText,
                        primaryButtonLink: sectionData.content.primaryButtonLink || ctaData.primaryButtonLink,
                        secondaryButtonText: sectionData.content.secondaryButtonText || ctaData.secondaryButtonText,
                        secondaryButtonLink: sectionData.content.secondaryButtonLink || ctaData.secondaryButtonLink,
                        backgroundColor: sectionData.background_color || ctaData.backgroundColor,
                    });
                }
            } catch (error) {
                console.error("Error fetching CTA data:", error);
            }
        };
        fetchCTAData();
    }, []);

    return (
        <section 
            className="relative overflow-hidden py-16 md:py-24"
            style={{ backgroundColor: ctaData.backgroundColor }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {ctaData.title}
                    </h2>
                    <p className="text-lg text-white/90 mb-8">
                        {ctaData.description}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={ctaData.primaryButtonLink}>
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-base px-8 h-12 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                            >
                                {ctaData.primaryButtonText}
                            </Button>
                        </Link>
                        <Link href={ctaData.secondaryButtonLink}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-base px-8 h-12 border-2 border-white text-white hover:bg-white/10"
                            >
                                <Smartphone className="mr-2 h-5 w-5" />
                                {ctaData.secondaryButtonText}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
