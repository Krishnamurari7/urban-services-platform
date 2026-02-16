"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ServiceCard } from "@/components/public/service-card";
import { ServiceCardSkeleton } from "@/components/public/service-card-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Apple,
  Play
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";

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
    const router = useRouter();
    const searchParams = useSearchParams();

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [popularServices, setPopularServices] = useState<Service[]>([]);

    // Booking form state
    const [selectedService, setSelectedService] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [location, setLocation] = useState("");

    const supabase = createClient();

    // Fetch all services
    const fetchServices = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .eq("status", "active")
                .order("created_at", { ascending: false });

            if (error) throw error;

            let finalServices: any[] = data || [];

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
            
            // Get popular services (top 4 by review count or rating)
            const popular = [...finalServices]
                .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
                .slice(0, 4);
            setPopularServices(popular);
        } catch (error) {
            console.error("Error fetching services:", error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleCheckAvailability = () => {
        if (selectedService) {
            router.push(`/services/${selectedService}?date=${selectedDate}&time=${selectedTime}&location=${location}`);
        } else {
            router.push(`/services?search=${location}`);
        }
    };

    const timeSlots = [
        "Morning (9-12)",
        "Afternoon (12-5)",
        "Evening (5-9)",
    ];

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
                                <span>#1 Rated Service Platform</span>
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                                <span className="text-gray-900">Expert help,</span>{" "}
                                <span className="text-purple-600">Instantly booked.</span>
                            </h1>
                            
                            <p className="text-lg md:text-xl text-gray-600 max-w-lg">
                                Reliable, background-checked professionals for all your home needs. Book in 60 seconds.
                            </p>
                            
                            <div className="flex items-center gap-3 pt-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-teal-400 border-2 border-white"
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-gray-600">
                                    Trusted by <span className="font-semibold text-gray-900">10k+</span> local homeowners
                                </p>
                            </div>
                        </div>

                        {/* Right Side - Booking Form */}
                        <div className="lg:pl-8">
                            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Book a Service</h2>
                                
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
                                                <option value="">Full Home Cleaning</option>
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
                                                onChange={(e) => setSelectedDate(e.target.value)}
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
                                                <option value="">Morning (9-12)</option>
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
                                                onChange={(e) => setLocation(e.target.value)}
                                                placeholder="Enter your zipcode"
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

            {/* Popular Services Section */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                Popular Services
                            </h2>
                            <p className="text-gray-600">
                                The most booked services in your neighborhood
                            </p>
                        </div>
                        <Link href="/services" className="text-purple-600 hover:text-purple-700 font-medium hidden md:flex items-center gap-2">
                            View All Services <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <ServiceCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {popularServices.map((service) => (
                                <div key={service.id} className="relative group">
                                    <Link href={`/services/${service.id}`}>
                                        <div className="relative h-64 rounded-xl overflow-hidden">
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
                                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                                <p className="text-sm font-medium mb-1">
                                                    Starting at ₹{service.base_price}
                                                </p>
                                                <h3 className="text-lg font-bold mb-2">{service.name}</h3>
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

            {/* Booking Made Simple Section */}
            <section className="py-16 md:py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            Booking made simple
                        </h2>
                        <p className="text-lg text-gray-600">
                            Follow three easy steps to get your house in order
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            {
                                step: 1,
                                title: "Choose a Service",
                                description: "Select from over 50+ background checked home services.",
                                icon: Search,
                            },
                            {
                                step: 2,
                                title: "Book Instantly",
                                description: "Pick a time that works for you. No phone calls required.",
                                icon: Calendar,
                            },
                            {
                                step: 3,
                                title: "Relax & Enjoy",
                                description: "Our experts will arrive and handle everything for you.",
                                icon: CheckCircle2,
                            },
                        ].map((item) => (
                            <div key={item.step} className="text-center">
                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center relative">
                                        <item.icon className="h-10 w-10 text-white" />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-white text-sm font-bold">
                                            {item.step}
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* See What We Can Do Section */}
            <section className="py-16 md:py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            See what we can do
                        </h2>
                        <p className="text-lg text-gray-600">
                            Real results from our expert cleaning professionals
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                title: "Kitchen Deep Clean",
                                description: "Professional sanitization and degreasing for a luxury kitchen.",
                                before: "/api/placeholder/400/300",
                                after: "/api/placeholder/400/300",
                            },
                            {
                                title: "Luxury Bathroom Polish",
                                description: "Removal of calcium deposits and high-gloss floor polishing.",
                                before: "/api/placeholder/400/300",
                                after: "/api/placeholder/400/300",
                            },
                        ].map((item, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center mb-2">
                                            <span className="text-gray-500 font-medium">BEFORE</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="bg-teal-100 rounded-lg h-48 flex items-center justify-center mb-2">
                                            <span className="text-teal-700 font-medium">AFTER</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">{item.title}</h3>
                                    <p className="text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* App Promotion Section */}
            <section className="py-16 md:py-20 bg-purple-600 rounded-t-3xl">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="text-white space-y-6">
                            <h2 className="text-3xl md:text-4xl font-bold">
                                Experience better living on our app
                            </h2>
                            <p className="text-lg text-purple-100">
                                Get $20 off your first booking when you use the ServiceNow mobile app. Manage bookings on the go.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    size="lg"
                                    className="bg-black hover:bg-gray-900 text-white h-14 px-6"
                                >
                                    <Apple className="h-6 w-6 mr-2" />
                                    Download on the App Store
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="bg-black hover:bg-gray-900 text-white border-black h-14 px-6"
                                >
                                    <Play className="h-6 w-6 mr-2" />
                                    Get it on Google Play
                                </Button>
                            </div>
                        </div>
                        <div className="hidden md:flex justify-end">
                            <div className="relative">
                                <div className="w-64 h-96 bg-black rounded-3xl p-4 shadow-2xl">
                                    <div className="w-full h-full bg-white rounded-2xl flex flex-col items-center justify-center p-6 space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
                                            <Sparkles className="h-8 w-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Quick Book</h3>
                                        <p className="text-sm text-gray-600 text-center">
                                            Book with one tap from your saved services.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
