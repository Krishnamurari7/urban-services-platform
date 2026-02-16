"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Home, UtensilsCrossed, Sofa, Bug, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

const iconMap: Record<string, React.ReactNode> = {
    Home: <Home className="h-12 w-12 text-blue-500" />,
    UtensilsCrossed: <UtensilsCrossed className="h-12 w-12 text-orange-500" />,
    Sofa: <Sofa className="h-12 w-12 text-blue-400" />,
    Bug: <Bug className="h-12 w-12 text-purple-500" />,
};

const defaultServices = [
    {
        name: "Deep Cleaning",
        description: "Complete sanitization of all rooms, bathrooms, and balconies using industrial tools.",
        href: "/services?category=cleaning&type=deep",
        icon: "Home",
    },
    {
        name: "Kitchen Cleaning",
        description: "Oil & grease removal, chimney cleaning, and detailed cabinet sanitization.",
        href: "/services?category=cleaning&type=kitchen",
        icon: "UtensilsCrossed",
    },
    {
        name: "Sofa & Carpet",
        description: "Shampooing and deep extraction cleaning for furniture and expensive rugs.",
        href: "/services?category=cleaning&type=sofa-carpet",
        icon: "Sofa",
    },
    {
        name: "Pest Control",
        description: "Eco-friendly pest treatment for cockroaches, ants, and termites.",
        href: "/services?category=pest-control",
        icon: "Bug",
    },
];

export function CategoriesSection() {
    const [sectionData, setSectionData] = useState({
        title: "Our Premium Services",
        description: "Explore our range of professional cleaning and maintenance solutions designed to keep your home pristine.",
        services: defaultServices,
    });

    useEffect(() => {
        const fetchServicesData = async () => {
            try {
                const supabase = createClient();
                const { data: sectionData } = await supabase
                    .from("homepage_sections")
                    .select("*")
                    .eq("section_type", "services")
                    .eq("is_active", true)
                    .single();

                if (sectionData?.content) {
                    setSectionData({
                        title: sectionData.content.title || sectionData.title || "Our Premium Services",
                        description: sectionData.content.description || sectionData.description || "",
                        services: sectionData.content.services || defaultServices,
                    });
                }
            } catch (error) {
                console.error("Error fetching services data:", error);
            }
        };
        fetchServicesData();
    }, []);

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {sectionData.title}
                    </h2>
                    <p className="text-lg text-gray-600">
                        {sectionData.description}
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {sectionData.services.map((service, index) => (
                        <Card key={service.name || index} className="border border-gray-200 hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="mb-4">
                                    {iconMap[service.icon] || <Home className="h-12 w-12 text-blue-500" />}
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    {service.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {service.description}
                                </p>
                                <Link
                                    href={service.href}
                                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    View Details
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
