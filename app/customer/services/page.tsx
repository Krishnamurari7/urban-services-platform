"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Service } from "@/lib/types/database";
import { 
  Package, 
  Search, 
  Clock, 
  ArrowRight,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";

interface ServiceWithRating extends Service {
  rating?: number;
  reviewCount?: number;
}

export default function CustomerServicesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<ServiceWithRating[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceWithRating[]>([]);
  const [trendingServices, setTrendingServices] = useState<ServiceWithRating[]>([]);
  const [servicesByCategory, setServicesByCategory] = useState<Record<string, ServiceWithRating[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  // Booking form state
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [location, setLocation] = useState("");

  // Read search query from URL params on mount
  useEffect(() => {
    const searchParam = searchParams.get("search");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchServices();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterServices();
  }, [searchQuery, categoryFilter, services]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      let finalServices: ServiceWithRating[] = data || [];

      // Get ratings
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
      }

      setServices(finalServices);
      setFilteredServices(finalServices);
      
      // Get trending services (top 4 by review count or rating)
      const trending = [...finalServices]
        .sort((a, b) => {
          // Sort by review count first, then by rating
          const reviewDiff = (b.reviewCount || 0) - (a.reviewCount || 0);
          if (reviewDiff !== 0) return reviewDiff;
          return (b.rating || 0) - (a.rating || 0);
        })
        .slice(0, 4);
      setTrendingServices(trending);

      // Group services by category
      const grouped: Record<string, ServiceWithRating[]> = {};
      finalServices.forEach((service) => {
        const category = service.category || "Other";
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(service);
      });
      setServicesByCategory(grouped);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    if (categoryFilter !== "all") {
      filtered = filtered.filter((s) => s.category === categoryFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.description?.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const handleCheckAvailability = () => {
    if (selectedService) {
      const params = new URLSearchParams();
      params.set("serviceId", selectedService);
      if (selectedDate) params.set("date", selectedDate);
      if (selectedTime) params.set("time", selectedTime);
      if (location) params.set("location", location);
      router.push(`/customer/book-service?${params.toString()}`);
    } else {
      const params = new URLSearchParams();
      if (location) params.set("search", location);
      router.push(`/customer/services?${params.toString()}`);
    }
  };

  const timeSlots = [
    "Morning (9-12)",
    "Afternoon (12-5)",
    "Evening (5-9)",
  ];

  const categories = Array.from(new Set(services.map((s) => s.category)));

  if (authLoading || loading) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-purple-50/40 to-teal-50/40 py-12 sm:py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Side - Headline */}
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-100 to-purple-50 rounded-full text-xs sm:text-sm font-semibold text-purple-700 mb-3 sm:mb-4 shadow-sm border border-purple-100">
                <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Browse All Services</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Find the perfect</span>{" "}
                <span className="bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent">service for you.</span>
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed">
                Explore our wide range of professional home services. Book instantly with verified professionals.
              </p>
            </div>

            {/* Right Side - Quick Booking Form */}
            <div className="lg:pl-8 order-1 lg:order-2">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 border border-gray-100/80 hover:shadow-3xl transition-shadow duration-300">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-5 sm:mb-6">Quick Book</h2>
                
                <div className="space-y-4">
                  {/* Service Select */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      SELECT SERVICE
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Sparkles className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                      >
                        <option value="">Select a service</option>
                        {services.slice(0, 10).map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Date Select */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      SELECT DATE
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {/* Time Select */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      PREFERRED TIME
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white"
                      >
                        <option value="">Select time</option>
                        {timeSlots.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      YOUR LOCATION
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        value={location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                        placeholder="Enter your address"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCheckAvailability}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-6 text-lg font-semibold rounded-lg mt-2 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Check Availability
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Services Section */}
      {trendingServices.length > 0 && !searchQuery && categoryFilter === "all" && (
        <section className="py-12 sm:py-16 md:py-20 bg-white relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-1.5 sm:p-2 shadow-md">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  Trending Services
                </h2>
              </div>
              <p className="text-gray-600 text-base sm:text-lg">
                The most popular services right now
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {trendingServices.map((service) => (
                <div key={service.id} className="relative group w-full">
                  <Link href={`/customer/services/${service.id}`} className="block w-full">
                    <div className="relative h-56 sm:h-64 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 w-full">
                      {service.image_url ? (
                        <Image
                          src={service.image_url}
                          alt={service.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-100 via-purple-50 to-teal-100 flex items-center justify-center">
                          <span className="text-5xl font-bold text-purple-300">
                            {service.name[0]}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-all" />
                      <div className="absolute top-3 right-3">
                        <Badge className="capitalize shadow-lg bg-gradient-to-r from-purple-600 to-purple-700 text-white border-0">
                          {service.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        <p className="text-sm font-semibold mb-1.5 opacity-90">
                          Starting at ₹{service.base_price}
                        </p>
                        <h3 className="text-lg font-bold mb-2.5 group-hover:text-purple-200 transition-colors">{service.name}</h3>
                        <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration_minutes} min</span>
                        </div>
                        {service.rating !== undefined && service.reviewCount !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">
                              {service.rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-300 opacity-80">
                              ({service.reviewCount.toLocaleString()} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters Section */}
      <section className="py-4 sm:py-6 md:py-8 bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-16 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 h-11 sm:h-12 border-gray-200 focus:border-purple-400 focus:ring-purple-400 rounded-lg text-sm sm:text-base w-full"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white w-full md:w-auto md:min-w-[200px] h-11 sm:h-12 font-medium text-sm sm:text-base"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section - Category-wise or Filtered */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Show filtered results when search or category filter is active */}
          {(searchQuery || categoryFilter !== "all") ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Search Results
                  </h2>
                  <p className="text-gray-600">
                    {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} found
                  </p>
                </div>
                {(searchQuery || categoryFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {filteredServices.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No services found</h3>
                    <p className="text-gray-600 mb-4">
                      No services match your search criteria.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="relative group">
                      <Link href={`/customer/services/${service.id}`}>
                        <div className="relative h-64 rounded-xl overflow-hidden cursor-pointer">
                          {service.image_url ? (
                            <Image
                              src={service.image_url}
                              alt={service.name}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-100 to-teal-100 flex items-center justify-center">
                              <span className="text-4xl font-bold text-purple-300">
                                {service.name[0]}
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                          <div className="absolute top-3 right-3">
                            <Badge className="capitalize shadow-md">
                              {service.category}
                            </Badge>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <p className="text-sm font-medium mb-1">
                              Starting at ₹{service.base_price}
                            </p>
                            <h3 className="text-lg font-bold mb-2">{service.name}</h3>
                            <div className="flex items-center gap-2 text-sm mb-2">
                              <Clock className="h-4 w-4" />
                              <span>{service.duration_minutes} min</span>
                            </div>
                            {service.rating !== undefined && service.reviewCount !== undefined && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-semibold">
                                  {service.rating.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-300">
                                  ({service.reviewCount.toLocaleString()} reviews)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Show category-wise sections when no filters are active */
            <>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  All Services
                </h2>
                <p className="text-lg text-gray-600">
                  Explore our complete range of professional services organized by category
                </p>
              </div>

              {Object.keys(servicesByCategory).length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">No services found</h3>
                    <p className="text-gray-600">
                      No services are currently available.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-16">
                  {Object.entries(servicesByCategory)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([category, categoryServices]) => (
                      <div key={category} className="space-y-6">
                        <div className="relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 via-purple-400 to-teal-500 rounded-full shadow-lg"></div>
                          <div className="pl-10 py-5 border-l-4 border-purple-200/50 bg-gradient-to-r from-purple-50/60 via-white to-white rounded-r-xl hover:shadow-lg transition-all duration-300 border border-gray-100/50">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl p-3 shadow-lg">
                                  <Package className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                                    {category}
                                  </h3>
                                  <p className="text-gray-600 mt-1.5 text-sm md:text-base font-medium">
                                    {categoryServices.length} {categoryServices.length === 1 ? "service" : "services"} available
                                  </p>
                                </div>
                              </div>
                              <Badge className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200 text-sm px-5 py-2 font-semibold hover:from-purple-200 hover:to-purple-100 transition-all shadow-sm">
                                {categoryServices.length} Services
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                          {categoryServices.map((service) => (
                            <div key={service.id} className="relative group">
                              <Link href={`/customer/services/${service.id}`}>
                                <div className="relative h-64 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100">
                                  {service.image_url ? (
                                    <Image
                                      src={service.image_url}
                                      alt={service.name}
                                      fill
                                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-100 via-purple-50 to-teal-100 flex items-center justify-center">
                                      <span className="text-5xl font-bold text-purple-300">
                                        {service.name[0]}
                                      </span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/95 transition-all" />
                                  <div className="absolute top-3 right-3">
                                    <Badge className="capitalize shadow-lg bg-white/90 backdrop-blur-sm text-gray-700 border-0">
                                      {service.category}
                                    </Badge>
                                  </div>
                                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                                    <p className="text-sm font-semibold mb-1.5 opacity-90">
                                      Starting at ₹{service.base_price}
                                    </p>
                                    <h3 className="text-lg font-bold mb-2.5 group-hover:text-purple-200 transition-colors">{service.name}</h3>
                                    <div className="flex items-center gap-2 text-sm mb-2 opacity-90">
                                      <Clock className="h-4 w-4" />
                                      <span>{service.duration_minutes} min</span>
                                    </div>
                                    {service.rating !== undefined && service.reviewCount !== undefined && (
                                      <div className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-semibold">
                                          {service.rating.toFixed(1)}
                                        </span>
                                        <span className="text-sm text-gray-300 opacity-80">
                                          ({service.reviewCount.toLocaleString()} reviews)
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
