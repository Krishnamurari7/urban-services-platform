"use client";

import { useState, useEffect } from "react";
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
    Grid3x3,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CategoryData {
    name: string;
    description: string;
    href: string;
    icon: React.ReactNode;
    serviceCount: number;
}

// Helper function to get icon for category
const getCategoryIcon = (categoryName: string): React.ReactNode => {
    const iconMap: Record<string, React.ReactNode> = {
        cleaning: <Sparkles className="h-12 w-12 text-primary" />,
        plumbing: <Droplet className="h-12 w-12 text-primary" />,
        electrical: <Zap className="h-12 w-12 text-primary" />,
        carpentry: <Hammer className="h-12 w-12 text-primary" />,
        "home repair": <HomeIcon className="h-12 w-12 text-primary" />,
        automotive: <Car className="h-12 w-12 text-primary" />,
        painting: <Paintbrush className="h-12 w-12 text-primary" />,
        "appliance repair": <Settings className="h-12 w-12 text-primary" />,
        "ac repair": <Wind className="h-12 w-12 text-primary" />,
        salon: <Scissors className="h-12 w-12 text-primary" />,
        gardening: <Flower className="h-12 w-12 text-primary" />,
        "pest control": <Bug className="h-12 w-12 text-primary" />,
        handyman: <Wrench className="h-12 w-12 text-primary" />,
    };

    return iconMap[categoryName.toLowerCase()] || <Grid3x3 className="h-12 w-12 text-primary" />;
};

export function CategoriesSection() {
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const supabase = createClient();
                
                // Fetch distinct categories with service counts
                const { data: categoryData, error } = await supabase
                    .from("services")
                    .select("category, description")
                    .eq("status", "active");

                if (error) {
                    console.error("Error fetching categories:", error);
                    setLoading(false);
                    return;
                }

                if (categoryData) {
                    // Group by category and count services
                    const categoryMap = new Map<string, { count: number; description: string | null }>();

                    categoryData.forEach((service) => {
                        const category = service.category;
                        const existing = categoryMap.get(category) || { count: 0, description: service.description };
                        categoryMap.set(category, {
                            count: existing.count + 1,
                            description: existing.description || service.description,
                        });
                    });

                    // Convert to array format
                    const categoriesList: CategoryData[] = Array.from(categoryMap.entries()).map(
                        ([categoryName, { count, description }]) => ({
                            name: categoryName,
                            description: description || `Professional ${categoryName.toLowerCase()} services`,
                            href: `/services?category=${encodeURIComponent(categoryName.toLowerCase())}`,
                            icon: getCategoryIcon(categoryName),
                            serviceCount: count,
                        })
                    );

                    // Sort by service count (descending)
                    categoriesList.sort((a, b) => b.serviceCount - a.serviceCount);

                    setCategories(categoriesList);
                }
            } catch (error) {
                console.error("Error in fetchCategories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

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
                {loading ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-64 bg-muted animate-pulse rounded-lg"
                            />
                        ))}
                    </div>
                ) : categories.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {categories.map((category) => (
                            <CategoryCard key={category.name} {...category} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No categories available at the moment.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
