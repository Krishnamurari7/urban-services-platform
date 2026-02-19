"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import { usePageContent } from "@/lib/cms/client-page-content";

export function CTASection() {
    const { content: ctaTitle } = usePageContent(
        "/",
        "cta_title",
        "Ready to Experience a Spotless Home?"
    );
    const { content: ctaDescription } = usePageContent(
        "/",
        "cta_description",
        "Join over 10,000 happy customers and book your first service today with a 20% discount."
    );
    const { content: ctaPrimaryButtonText } = usePageContent(
        "/",
        "cta_primary_button_text",
        "Book a Service Now"
    );
    const { content: ctaPrimaryButtonLink } = usePageContent(
        "/",
        "cta_primary_button_link",
        "/services"
    );
    const { content: ctaSecondaryButtonText } = usePageContent(
        "/",
        "cta_secondary_button_text",
        "Download App"
    );
    const { content: ctaSecondaryButtonLink } = usePageContent(
        "/",
        "cta_secondary_button_link",
        "/#download-app"
    );
    const { content: ctaBackgroundColor } = usePageContent(
        "/",
        "cta_background_color",
        "#2563EB"
    );

    return (
        <section 
            className="relative overflow-hidden py-16 md:py-24"
            style={{ backgroundColor: ctaBackgroundColor }}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {ctaTitle}
                    </h2>
                    <p className="text-lg text-white/90 mb-8">
                        {ctaDescription}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={ctaPrimaryButtonLink}>
                            <Button
                                size="lg"
                                className="w-full sm:w-auto text-base px-8 h-12 bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
                            >
                                {ctaPrimaryButtonText}
                            </Button>
                        </Link>
                        <Link href={ctaSecondaryButtonLink}>
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto text-base px-8 h-12 border-2 border-white text-white hover:bg-white/10"
                            >
                                <Smartphone className="mr-2 h-5 w-5" />
                                {ctaSecondaryButtonText}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
