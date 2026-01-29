import { CategoryCard } from "@/components/public/category-card";
import {
    Sparkles,
    Wrench,
    Droplet,
    Zap,
    Home as HomeIcon,
    Car,
    Paintbrush,
    Hammer,
    Settings,
    Wind,
    Scissors,
    Flower,
    Bug,
} from "lucide-react";

export function CategoriesSection() {
    const categories = [
        {
            name: "Cleaning",
            description: "Professional home and office cleaning services",
            href: "/services?category=cleaning",
            icon: <Sparkles className="h-12 w-12 text-primary" />,
            serviceCount: 15,
        },
        {
            name: "Plumbing",
            description: "Expert plumbing solutions for all your needs",
            href: "/services?category=plumbing",
            icon: <Droplet className="h-12 w-12 text-primary" />,
            serviceCount: 12,
        },
        {
            name: "Electrical",
            description: "Safe and reliable electrical services",
            href: "/services?category=electrical",
            icon: <Zap className="h-12 w-12 text-primary" />,
            serviceCount: 10,
        },
        {
            name: "Carpentry",
            description: "Quality carpentry and furniture services",
            href: "/services?category=carpentry",
            icon: <Hammer className="h-12 w-12 text-primary" />,
            serviceCount: 8,
        },
        {
            name: "Home Repair",
            description: "Complete home maintenance and repair",
            href: "/services?category=home-repair",
            icon: <HomeIcon className="h-12 w-12 text-primary" />,
            serviceCount: 20,
        },
        {
            name: "Automotive",
            description: "Car and bike servicing at your doorstep",
            href: "/services?category=automotive",
            icon: <Car className="h-12 w-12 text-primary" />,
            serviceCount: 6,
        },
        {
            name: "Painting",
            description: "Professional painting services for all your needs",
            href: "/services?category=painting",
            icon: <Paintbrush className="h-12 w-12 text-primary" />,
            serviceCount: 4,
        },
        {
            name: "Appliance Repair",
            description: "Professional appliance repair services for all your needs",
            href: "/services?category=appliance-repair",
            icon: <Settings className="h-12 w-12 text-primary" />,
            serviceCount: 4,
        },
        {
            name: "AC Repair",
            description: "Professional AC repair services for all your needs",
            href: "/services?category=ac-repair",
            icon: <Wind className="h-12 w-12 text-primary" />,
            serviceCount: 4,
        },
        {
            name: "Salon",
            description: "Professional salon services for all your needs",
            href: "/services?category=salon",
            icon: <Scissors className="h-12 w-12 text-primary" />,
            serviceCount: 4,
        },
        {
            name: "Gardening",
            description: "Professional gardening services for all your needs",
            href: "/services?category=gardening",
            icon: <Flower className="h-12 w-12 text-primary" />,
            serviceCount: 4,
        },
        {
            name: "Pest Control",
            description: "Professional pest control services for all your needs",
            href: "/services?category=pest-control",
            icon: <Bug className="h-12 w-12 text-primary" />,
            serviceCount: 4,
        },
        {
            name: "Handyman",
            description: "Professional handyman services for all your needs",
            href: "/services?category=handyman",
            icon: <Wrench className="h-12 w-12 text-primary" />,
            serviceCount: 4,
        },
    ];

    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-2xl text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Popular Service Categories
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Choose from a wide range of professional services tailored to your
                        needs
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                        <CategoryCard key={category.name} {...category} />
                    ))}
                </div>
            </div>
        </section>
    );
}
