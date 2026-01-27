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

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
  const [categories, setCategories] = useState<string[]>([]);

  const supabase = createClient();

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [selectedCategory, searchQuery, location, minRating, priceRange]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("services")
      .select("category")
      .eq("status", "active");
    if (data) {
      const uniqueCategories = Array.from(
        new Set(data.map((s) => s.category))
      );
      setCategories(uniqueCategories);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    
    // Start with base query
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

    // Apply price filter
    if (priceRange.min !== null) {
      query = query.gte("base_price", priceRange.min);
    }
    if (priceRange.max !== null) {
      query = query.lte("base_price", priceRange.max);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } else {
      let filteredServices = data || [];
      
      // Fetch ratings for services
      const serviceIds = filteredServices.map((s: any) => s.id);
      if (serviceIds.length > 0) {
        const { data: reviewsData } = await supabase
          .from("reviews")
          .select("service_id, rating")
          .in("service_id", serviceIds)
          .eq("is_visible", true);

        // Calculate average ratings
        const ratingsMap = new Map<string, { sum: number; count: number }>();
        reviewsData?.forEach((review: any) => {
          const existing = ratingsMap.get(review.service_id) || { sum: 0, count: 0 };
          ratingsMap.set(review.service_id, {
            sum: existing.sum + review.rating,
            count: existing.count + 1,
          });
        });

        // Add ratings to services
        filteredServices = filteredServices.map((service: any) => {
          const ratingData = ratingsMap.get(service.id);
          const rating = ratingData ? ratingData.sum / ratingData.count : undefined;
          const reviewCount = ratingData?.count || 0;
          return { ...service, rating, reviewCount };
        });

        // Filter by minimum rating
        if (minRating !== null) {
          filteredServices = filteredServices.filter(
            (service: any) => service.rating !== undefined && service.rating >= minRating
          );
        }
      }
      
      // Filter by location if provided
      if (location) {
        const locationLower = location.toLowerCase();
        
        // Fetch professionals with addresses matching location
        const { data: professionalsData } = await supabase
          .from("profiles")
          .select(`
            id,
            addresses:addresses(city, state)
          `)
          .eq("role", "professional")
          .eq("is_active", true);

        if (professionalsData) {
          const matchingProfessionalIds = professionalsData
            .filter((prof: any) => {
              if (!prof.addresses || prof.addresses.length === 0) return false;
              return prof.addresses.some((addr: any) => 
                addr.city?.toLowerCase().includes(locationLower) ||
                addr.state?.toLowerCase().includes(locationLower)
              );
            })
            .map((prof: any) => prof.id);

          // Get services that have professionals in the matching location
          if (matchingProfessionalIds.length > 0) {
            const { data: professionalServices } = await supabase
              .from("professional_services")
              .select("service_id")
              .in("professional_id", matchingProfessionalIds)
              .eq("is_available", true);

            if (professionalServices) {
              const serviceIds = [...new Set(professionalServices.map((ps: any) => ps.service_id))];
              filteredServices = filteredServices.filter((service: any) =>
                serviceIds.includes(service.id)
              );
            } else {
              filteredServices = [];
            }
          } else {
            filteredServices = [];
          }
        }
      }

      setServices(filteredServices);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setLocation("");
    setMinRating(null);
    setPriceRange({ min: null, max: null });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Section */}
      <section className="border-b bg-gradient-to-br from-primary/5 via-background to-background py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              All Services
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Find the perfect service for your needs
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-10 text-base"
                />
              </div>
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Location (city/state)..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 pl-10 text-base"
                />
              </div>
              <Button type="submit" className="h-12 px-8 text-base">Search</Button>
            </form>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="h-9 px-4"
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="h-9 px-4 capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Rating and Price Filters */}
          <div className="flex flex-wrap gap-6 items-center">
            {/* Rating Filter */}
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Min Rating:</span>
              <div className="flex gap-2">
                {[4, 3, 2, 1].map((rating) => (
                  <Button
                    key={rating}
                    variant={minRating === rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMinRating(minRating === rating ? null : rating)}
                    className="h-9 px-3"
                  >
                    {rating}+ ⭐
                  </Button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Price Range:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min || ""}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-28 h-9"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max || ""}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value ? Number(e.target.value) : null })
                  }
                  className="w-28 h-9"
                />
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(selectedCategory !== "all" || searchQuery || location || minRating !== null || priceRange.min !== null || priceRange.max !== null) && (
            <div className="flex items-center gap-2 flex-wrap rounded-lg border bg-muted/50 p-4">
              <span className="text-sm font-medium">Active filters:</span>
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="gap-1">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {location && (
              <Badge variant="secondary" className="gap-1">
                Location: {location}
                <button
                  onClick={() => setLocation("")}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {minRating !== null && (
              <Badge variant="secondary" className="gap-1">
                Rating: {minRating}+ ⭐
                <button
                  onClick={() => setMinRating(null)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(priceRange.min !== null || priceRange.max !== null) && (
              <Badge variant="secondary" className="gap-1">
                Price: ₹{priceRange.min || 0} - ₹{priceRange.max || "∞"}
                <button
                  onClick={() => setPriceRange({ min: null, max: null })}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs"
            >
              Clear all
            </Button>
          </div>
        )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              <span className="text-foreground font-semibold">{services.length}</span> service{services.length !== 1 ? "s" : ""} found
            </p>
            {(selectedCategory !== "all" || searchQuery || location || minRating !== null || priceRange.min !== null || priceRange.max !== null) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <ServiceCardSkeleton key={i} />
          ))}
        </div>
      ) : services.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              description={service.description}
              category={service.category}
              basePrice={service.base_price}
              durationMinutes={service.duration_minutes}
              imageUrl={service.image_url}
              rating={service.rating}
              reviewCount={service.reviewCount}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-xl font-semibold mb-2">No services found</p>
          <p className="mb-6 text-sm text-muted-foreground max-w-md">
            Try adjusting your search or filters to find what you're looking for
          </p>
          <Button
            variant="outline"
            className="h-11 px-6"
            onClick={clearFilters}
          >
            Clear All Filters
          </Button>
        </div>
      )}
      </div>
    </div>
  );
}
