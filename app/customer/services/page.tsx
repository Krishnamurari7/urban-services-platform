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
  DollarSign, 
  ArrowRight,
  Star,
  CheckCircle2,
  Calendar,
  Sparkles,
  MapPin,
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
      <section className="bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Headline */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full text-sm font-medium text-purple-700 mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <span>Browse All Services</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-900">Find the perfect</span>{" "}
                <span className="text-purple-600">service for you.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                Explore our wide range of professional home services. Book instantly with verified professionals.
              </p>
            </div>

            {/* Right Side - Quick Booking Form */}
            <div className="lg:pl-8">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Book</h2>
                
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-semibold rounded-lg mt-2"
                  >
                    Check Availability
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white min-w-[200px]"
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

      {/* All Services Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                All Services
              </h2>
              <p className="text-gray-600">
                {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} available
              </p>
            </div>
          </div>

          {/* Services Grid */}
          {filteredServices.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-semibold mb-2">No services found</h3>
                <p className="text-gray-600 mb-4">
                  {services.length === 0
                    ? "No services are currently available."
                    : "No services match your search criteria."}
                </p>
                {searchQuery && (
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
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredServices.map((service) => (
                <div key={service.id} className="relative group">
                  <Link href={`/customer/book-service?serviceId=${service.id}`}>
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
        </div>
      </section>
    </div>
  );
}
