"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ServiceCard } from "@/components/public/service-card";
import { ServiceCardSkeleton } from "@/components/public/service-card-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X, MapPin, Star, DollarSign } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Service {
    id: string;
    name: string;
    description: string | null;
    category: string;
    subcategory: string | null;
    base_price: number;
    duration_minutes: number;
    image_url: string | null;
    status: string;
    rating?: number;
    reviewCount?: number;
}

export default function ServicesClient() {
    const searchParams = useSearchParams();

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("search") || ""
    );
    const [selectedCategory, setSelectedCategory] = useState(
        searchParams.get("category") || "all"
    );
    const [location, setLocation] = useState(
        searchParams.get("location") || ""
    );

    const [minRating, setMinRating] = useState<number | null>(null);
    const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
        min: null,
        max: null,
    });

    const [categories, setCategories] = useState<string[]>([]);
    const supabase = createClient();

    // ---------------- FETCH CATEGORIES ----------------
    const fetchCategories = async () => {
        const { data } = await supabase
            .from("services")
            .select("category")
            .eq("status", "active");

        if (data) {
            setCategories([...new Set(data.map((s) => s.category))]);
        }
    };

    // ---------------- FETCH SERVICES ----------------
    const fetchServices = async () => {
        setLoading(true);

        let query = supabase
            .from("services")
            .select("*")
            .eq("status", "active")
            .order("created_at", { ascending: false });

        if (selectedCategory !== "all") {
            query = query.eq("category", selectedCategory);
        }

        if (searchQuery) {
            query = query.or(
                `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
            );
        }

        if (priceRange.min !== null) {
            query = query.gte("base_price", priceRange.min);
        }
        if (priceRange.max !== null) {
            query = query.lte("base_price", priceRange.max);
        }

        const { data, error } = await query;

        if (error) {
            console.error(error);
            setServices([]);
            setLoading(false);
            return;
        }

        let finalServices: any[] = data || [];

        // -------- RATINGS --------
        const serviceIds = finalServices.map((s) => s.id);
        if (serviceIds.length) {
            const { data: reviews } = await supabase
                .from("reviews")
                .select("service_id, rating")
                .in("service_id", serviceIds)
                .eq("is_visible", true);

            const ratingMap = new Map<string, { sum: number; count: number }>();

            reviews?.forEach((r: any) => {
                const current = ratingMap.get(r.service_id) || { sum: 0, count: 0 };
                ratingMap.set(r.service_id, {
                    sum: current.sum + r.rating,
                    count: current.count + 1,
                });
            });

            finalServices = finalServices.map((s) => {
                const r = ratingMap.get(s.id);
                return {
                    ...s,
                    rating: r ? r.sum / r.count : undefined,
                    reviewCount: r?.count || 0,
                };
            });

            if (minRating !== null) {
                finalServices = finalServices.filter(
                    (s) => s.rating && s.rating >= minRating
                );
            }
        }

        // -------- LOCATION FILTER --------
        if (location) {
            const { data: professionals } = await supabase
                .from("profiles")
                .select("id, addresses:addresses(city,state)")
                .eq("role", "professional")
                .eq("is_active", true);

            const matchedIds =
                professionals
                    ?.filter((p: any) =>
                        p.addresses?.some(
                            (a: any) =>
                                a.city?.toLowerCase().includes(location.toLowerCase()) ||
                                a.state?.toLowerCase().includes(location.toLowerCase())
                        )
                    )
                    .map((p: any) => p.id) || [];

            if (matchedIds.length) {
                const { data: ps } = await supabase
                    .from("professional_services")
                    .select("service_id")
                    .in("professional_id", matchedIds)
                    .eq("is_available", true);

                const allowedIds = ps?.map((p: any) => p.service_id) || [];
                finalServices = finalServices.filter((s) =>
                    allowedIds.includes(s.id)
                );
            } else {
                finalServices = [];
            }
        }

        setServices(finalServices);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
        fetchServices();
    }, [selectedCategory, searchQuery, location, minRating, priceRange]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setLocation("");
        setMinRating(null);
        setPriceRange({ min: null, max: null });
    };

    // ---------------- UI ----------------
    return (
        <div className="container mx-auto px-4 py-8">
            {/* SEARCH */}
            <div className="flex flex-col gap-3 sm:flex-row mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search services"
                        className="pl-9"
                    />
                </div>
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
                    <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="City / State"
                        className="pl-9"
                    />
                </div>
            </div>

            {/* CATEGORY */}
            <div className="flex flex-wrap gap-2 mb-6">
                <Button
                    size="sm"
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                >
                    All
                </Button>
                {categories.map((c) => (
                    <Button
                        key={c}
                        size="sm"
                        variant={selectedCategory === c ? "default" : "outline"}
                        onClick={() => setSelectedCategory(c)}
                        className="capitalize"
                    >
                        {c}
                    </Button>
                ))}
            </div>

            {/* RESULTS */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <ServiceCardSkeleton key={i} />
                    ))}
                </div>
            ) : services.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((s) => (
                        <ServiceCard
                            key={s.id}
                            id={s.id}
                            name={s.name}
                            description={s.description}
                            category={s.category}
                            basePrice={s.base_price}
                            durationMinutes={s.duration_minutes}
                            imageUrl={s.image_url}
                            rating={s.rating}
                            reviewCount={s.reviewCount}
                        />
                    ))}

                </div>
            ) : (
                <div className="text-center py-16">
                    <Search className="mx-auto h-12 w-12 mb-4 text-muted-foreground" />
                    <p className="text-lg font-semibold mb-2">No services found</p>
                    <Button variant="outline" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    );
}
