"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useRealtimeBookings } from "@/hooks/use-realtime-bookings";
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
import Link from "next/link";
import type { Booking, Payment, Profile, Address, Service, Review } from "@/lib/types/database";
import { CategoriesSection } from "@/components/landing/categories-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CTASection } from "@/components/landing/cta-section";
import {
  Calendar,
  Clock,
  Package,
  Plus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Search,
  Star,
} from "lucide-react";
import Image from "next/image";
import { CustomerDashboardHero } from "@/components/customer/dashboard-hero";
import { CustomerDashboardSectionTitle } from "@/components/customer/dashboard-section-title";


interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalSpent: number;
  recentBookings: Booking[];
}

interface Notification {
  id: string;
  type: "review" | "reminder" | "offer";
  title: string;
  message: string;
  bookingId?: string;
  time: string;
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0,
    recentBookings: [],
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<Address | null>(null);
  const [popularServices, setPopularServices] = useState<Service[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Booking[]>([]);
  const [serviceNames, setServiceNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [authLoadingTimeout, setAuthLoadingTimeout] = useState(false);
  
  // Real-time bookings hook
  const { bookings: realtimeBookings } = useRealtimeBookings({
    userId: user?.id,
    role: "customer",
    enabled: !!user
  });

  // Sync realtime bookings with stats
  useEffect(() => {
    if (realtimeBookings.length > 0 || hasFetchedRef.current) {
      const upcoming = realtimeBookings.filter(
        (b: Booking) =>
          b.status === "pending" ||
          b.status === "confirmed" ||
          b.status === "in_progress"
      ).length;

      const completed = realtimeBookings.filter((b: Booking) => b.status === "completed").length;

      setStats((prev: DashboardStats) => ({
        ...prev,
        totalBookings: realtimeBookings.length,
        upcomingBookings: upcoming,
        completedBookings: completed,
        recentBookings: realtimeBookings.slice(0, 5),
      }));

      // Fetch service names for bookings
      const fetchServiceNames = async () => {
        const bookingServiceIds = [...new Set(realtimeBookings.map((b: Booking) => b.service_id))];
        if (bookingServiceIds.length > 0) {
          const supabase = createClient();
          const { data: servicesData } = await supabase
            .from("services")
            .select("id, name")
            .in("id", bookingServiceIds);
          
          if (servicesData) {
            const nameMap = new Map<string, string>();
            servicesData.forEach((s: { id: string; name: string }) => nameMap.set(s.id, s.name));
            setServiceNames(nameMap);
          }
        }
      };
      fetchServiceNames();
    }
  }, [realtimeBookings]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Parallelize all disjoint data fetches
      const [
        profileResult,
        addressResult,
        paymentsResult,
        popularServicesResult,
        completedBookingsResult,
        reviewsResult
      ] = await Promise.all([
        // 1. Profile
        supabase.from("profiles").select("*").eq("id", user.id).single(),

        // 2. Default address
        supabase
          .from("addresses")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_default", true)
          .single(),

        // 3. Completed payments
        supabase
          .from("payments")
          .select("amount, status")
          .eq("customer_id", user.id)
          .eq("status", "completed"),

        // 4. Popular services with ratings
        supabase.from("services").select("*").eq("status", "active").limit(6),

        // 5. Completed bookings (for review check)
        supabase
          .from("bookings")
          .select("id, created_at, completed_at, status")
          .eq("customer_id", user.id)
          .eq("status", "completed"),

        // 6. Existing reviews
        supabase
          .from("reviews")
          .select("booking_id")
          .eq("customer_id", user.id)
      ]);

      // Process Profile
      if (profileResult.error) {
        console.error("Error fetching profile:", profileResult.error);
      } else if (profileResult.data) {
        setProfile(profileResult.data);
      }

      // Process Address
      if (addressResult.data) {
        setDefaultAddress(addressResult.data);
      }

      // Process Payments
      const payments = paymentsResult.data || [];
      if (paymentsResult.error) {
        console.error("Error fetching payments:", paymentsResult.error);
      }

      // Process Popular Services with ratings
      let finalServices: any[] = popularServicesResult.data || [];
      if (finalServices.length) {
        const serviceIds = finalServices.map((s) => s.id);
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
      setPopularServices(finalServices as Service[]);

      // Process Notifications & Pending Reviews
      const allCompletedBookings = (completedBookingsResult.data || []) as Array<{
        id: string;
        created_at: string;
        completed_at: string | null;
        status: string;
      }>;
      const existingReviews = (reviewsResult?.data || []) as { booking_id: string }[];

      // Calculate pending reviews
      const reviewedBookingIds = new Set(
        existingReviews.map((r: { booking_id: string }) => r.booking_id)
      );

      const bookingsNeedingReview = allCompletedBookings.filter(
        (b) => !reviewedBookingIds.has(b.id)
      );

      setPendingReviews(bookingsNeedingReview.slice(0, 3) as Booking[]);

      // Create notifications for pending reviews
      const reviewNotifications: Notification[] = bookingsNeedingReview
        .slice(0, 2)
        .map((booking) => ({
          id: `review-${booking.id}`,
          type: "review" as const,
          title: "Pending Review",
          message: "Rate your recent service experience",
          bookingId: booking.id,
          time: new Date(booking.completed_at || booking.created_at).toISOString(),
        }));

      // Use realtime bookings to find the next upcoming one for notification
      const upcomingBooking = realtimeBookings.find(
        (b: Booking) =>
          (b.status === "confirmed" || b.status === "pending") &&
          new Date(b.scheduled_at) > new Date()
      );

      const reminderNotifications: Notification[] = upcomingBooking
        ? [
          {
            id: `reminder-${upcomingBooking.id}`,
            type: "reminder" as const,
            title: "Upcoming Service",
            message: `Service scheduled for ${new Date(upcomingBooking.scheduled_at).toLocaleDateString()}`,
            bookingId: upcomingBooking.id,
            time: upcomingBooking.scheduled_at,
          },
        ]
        : [];

      setNotifications([...reviewNotifications, ...reminderNotifications]);

      // Calculate stats (total spent is still from payments)
      const totalSpent = payments.reduce((sum: number, p: { amount: number | string }) => sum + Number(p.amount), 0);

      setStats((prev: DashboardStats) => ({
        ...prev,
        totalSpent,
      }));

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(
        "Failed to load dashboard data. Please try refreshing the page."
      );
    } finally {
      setLoading(false);
      hasFetchedRef.current = true;
    }
  }, [user, realtimeBookings]);

  // Handle auth loading timeout
  useEffect(() => {
    if (authLoadingTimeoutRef.current) {
      clearTimeout(authLoadingTimeoutRef.current);
      authLoadingTimeoutRef.current = null;
    }

    if (authLoading) {
      authLoadingTimeoutRef.current = setTimeout(() => {
        console.warn("Auth loading timeout - proceeding anyway");
        setAuthLoadingTimeout(true);
      }, 15000);
    } else {
      setAuthLoadingTimeout(false);
    }

    return () => {
      if (authLoadingTimeoutRef.current) {
        clearTimeout(authLoadingTimeoutRef.current);
      }
    };
  }, [authLoading]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      if (!hasFetchedRef.current) {
        console.warn("Dashboard loading timeout - forcing loading to false");
        setLoading(false);
        setError(
          "Loading is taking longer than expected. Please refresh the page."
        );
      }
    }, 10000);

    if (!authLoading || authLoadingTimeout) {
      if (user && !hasFetchedRef.current) {
        fetchDashboardData();
      } else if (!user) {
        setLoading(false);
        hasFetchedRef.current = true;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, authLoading, authLoadingTimeout, fetchDashboardData]);

  if ((authLoading || loading) && !error && !authLoadingTimeout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <AlertCircle className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30 py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-4xl">
            {/* Stats & Welcome */}
            <div className="space-y-6">
              <CustomerDashboardHero 
                profileName={profile?.full_name || "Customer"}
              />
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Link href="/customer/bookings" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalBookings}</div>
                  <div className="text-sm text-gray-600">Total Bookings</div>
                </Link>
                <Link href="/customer/bookings?status=upcoming" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer">
                  <div className="text-2xl font-bold text-purple-600">{stats.upcomingBookings}</div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </Link>
                <Link href="/customer/bookings?status=completed" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer">
                  <div className="text-2xl font-bold text-teal-600">{stats.completedBookings}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </Link>
                <Link href="/customer/payments" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer">
                  <div className="text-2xl font-bold text-gray-900">₹{stats.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Similar to Public Dashboard */}
      <CategoriesSection />

      {/* Features Section - Similar to Public Dashboard */}
      <FeaturesSection />

      {/* Popular Services Section */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <CustomerDashboardSectionTitle 
                titleKey="popular_services_title"
                descriptionKey="popular_services_description"
                defaultTitle="Popular Services"
                defaultDescription="The most booked services in your neighborhood"
              />
            </div>
            <Link href="/customer/services" className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2">
              View All Services <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularServices.slice(0, 4).map((service: Service) => (
                <div key={service.id} className="relative group">
                  <Link href={`/customer/book-service?serviceId=${service.id}`}>
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
                        {(service as any).rating !== undefined && (service as any).reviewCount !== undefined && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-semibold">
                              {(service as any).rating.toFixed(1)}
                            </span>
                            <span className="text-sm text-gray-300">
                              ({(service as any).reviewCount.toLocaleString()} reviews)
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

      {/* Testimonials Section - Similar to Public Dashboard */}
      <TestimonialsSection />

      {/* Recent Bookings Section */}
      {stats.recentBookings.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <CustomerDashboardSectionTitle
                  titleKey="recent_bookings_title"
                  descriptionKey="recent_bookings_description"
                  defaultTitle="Recent Bookings"
                  defaultDescription="Your latest service bookings and their status"
                />
              </div>
              <Link href="/customer/bookings" className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.recentBookings.slice(0, 6).map((booking: Booking) => (
                <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{serviceNames.get(booking.service_id) || "Service"}</CardTitle>
                      <Badge
                        variant={
                          booking.status === "completed"
                            ? ("default" as const)
                            : booking.status === "confirmed" || booking.status === "in_progress"
                            ? ("secondary" as const)
                            : ("outline" as const)
                        }
                      >
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(booking.scheduled_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(booking.scheduled_at).toLocaleTimeString()}</span>
                    </div>
                    {booking.total_amount && (
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        <span>₹{Number(booking.total_amount).toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardContent>
                    <Link href={`/customer/bookings/${booking.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Similar to Public Dashboard */}
      <CTASection />
    </div>
  );
}
