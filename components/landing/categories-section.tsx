"use client";

import Link from "next/link";
import { Home, UtensilsCrossed, Sofa, Bug, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePageContent } from "@/lib/cms/client-page-content";

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
    const { content: categoriesTitle } = usePageContent(
        "/",
        "categories_title",
        "Our Premium Services"
    );
    const { content: categoriesDescription } = usePageContent(
        "/",
        "categories_description",
        "Explore our range of professional cleaning and maintenance solutions designed to keep your home pristine."
    );
    
    // Use default services for now - can be enhanced later with JSON support
    const services = defaultServices;

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {categoriesTitle}
                    </h2>
                    <p className="text-lg text-gray-600">
                        {categoriesDescription}
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {services.map((service, index) => (
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
