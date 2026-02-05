"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import {
  Calendar,
  Clock,
  DollarSign,
  Package,
  Plus,
  MapPin,
  Home,
  Wallet,
  Bell,
  Star,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Settings,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { CategoriesSection } from "@/components/landing/categories-section";
import { CTASection } from "@/components/landing/cta-section";


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
        (b) =>
          b.status === "pending" ||
          b.status === "confirmed" ||
          b.status === "in_progress"
      ).length;

      const completed = realtimeBookings.filter((b) => b.status === "completed").length;

      setStats((prev) => ({
        ...prev,
        totalBookings: realtimeBookings.length,
        upcomingBookings: upcoming,
        completedBookings: completed,
        recentBookings: realtimeBookings.slice(0, 5),
      }));
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

        // 4. Popular services
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

      // Process Popular Services
      if (popularServicesResult.data) {
        setPopularServices(popularServicesResult.data as Service[]);
      }

      // Process Notifications & Pending Reviews
      const allCompletedBookings = completedBookingsResult.data || [];
      const existingReviews = (reviewsResult?.data || []) as { booking_id: string }[];

      // Calculate pending reviews
      const reviewedBookingIds = new Set(
        existingReviews.map((r) => r.booking_id)
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
        (b) =>
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
      const totalSpent = payments.reduce((sum, p) => sum + Number(p.amount), 0);

      setStats((prev) => ({
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
  }, [user]);

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
    <div className="flex flex-col">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {profile?.full_name || "Customer"}!
              </h1>
              <p className="text-gray-600 text-lg">
                Here's an overview of your service bookings and activity.
              </p>
            </div>
            {profile?.is_verified && (
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Verified Account
              </Badge>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/customer/book-service">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:scale-105">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-blue-900">Book Service</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/bookings">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 hover:scale-105">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-purple-900">My Bookings</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/customer/profile">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:scale-105">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-green-900">Manage Profile</p>
              </CardContent>
            </Card>
          </Link>

          <a href="mailto:support@urbanservices.com">
            <Card className="hover:shadow-lg transition-all cursor-pointer border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:scale-105">
              <CardContent className="pt-6 text-center">
                <div className="h-12 w-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <p className="font-semibold text-orange-900">Get Help</p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Bookings
              </CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{stats.totalBookings}</div>
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                All time bookings
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-100 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming
              </CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">{stats.upcomingBookings}</div>
              <p className="text-xs text-gray-500 mt-1">Scheduled services</p>
            </CardContent>
          </Card>

          <Card className="border-green-100 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Completed
              </CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{stats.completedBookings}</div>
              <p className="text-xs text-gray-500 mt-1">Finished services</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Spent
              </CardTitle>
              <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">
                ₹{stats.totalSpent.toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Lifetime spending</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Default Address */}
          <Card className="border-blue-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Default Address
                </CardTitle>
                <Link href="/customer/profile">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {defaultAddress ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">{defaultAddress.label}</p>
                      <p className="text-sm text-gray-600">{defaultAddress.address_line1}</p>
                      {defaultAddress.address_line2 && (
                        <p className="text-sm text-gray-600">{defaultAddress.address_line2}</p>
                      )}
                      <p className="text-sm text-gray-600">
                        {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postal_code}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-3">No address saved</p>
                  <Link href="/customer/profile">
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Address
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Wallet Summary */}
          <Card className="border-green-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="h-5 w-5 text-green-600" />
                Wallet Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-2xl font-bold text-green-900">₹{stats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Completed Payments</span>
                    <span className="font-semibold">{stats.completedBookings}</span>
                  </div>
                </div>
                <Link href="/customer/payments">
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Payment History
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-purple-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bell className="h-5 w-5 text-purple-600" />
                Notifications
                {notifications.length > 0 && (
                  <Badge className="bg-purple-600">{notifications.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 bg-purple-50 rounded-lg border border-purple-100"
                    >
                      <div className="flex items-start gap-2">
                        {notif.type === "review" && (
                          <Star className="h-4 w-4 text-purple-600 mt-0.5" />
                        )}
                        {notif.type === "reminder" && (
                          <Clock className="h-4 w-4 text-purple-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notif.title}</p>
                          <p className="text-xs text-gray-600">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popular Services */}
        {popularServices.length > 0 && (
          <Card className="mb-8 border-indigo-100">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    Popular Services
                  </CardTitle>
                  <CardDescription>Explore our most requested services</CardDescription>
                </div>
                <Link href="/customer/services">
                  <Button variant="outline">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularServices.map((service) => (
                  <Link key={service.id} href={`/customer/book-service?service=${service.id}`}>
                    <Card className="hover:shadow-md transition-all cursor-pointer border-gray-200 hover:border-indigo-300">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{service.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {service.category}
                            </Badge>
                          </div>
                        </div>
                        {service.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-indigo-600">
                              ₹{Number(service.base_price).toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {service.duration_minutes} mins
                            </p>
                          </div>
                          <Button size="sm">Book Now</Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>
                  Your latest service bookings and their status
                </CardDescription>
              </div>
              <Link href="/customer/bookings">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentBookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg text-gray-500 mb-2">No bookings yet</p>
                <p className="text-sm text-gray-400 mb-4">
                  Start by booking your first service
                </p>
                <Link href="/customer/book-service">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Your First Service
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/customer/bookings/${booking.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 hover:shadow-md transition-all">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            Booking #{booking.id.slice(0, 8)}
                          </h3>
                          <Badge
                            variant={
                              booking.status === "completed"
                                ? "default"
                                : booking.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={
                              booking.status === "confirmed"
                                ? "bg-blue-100 text-blue-700"
                                : booking.status === "in_progress"
                                  ? "bg-purple-100 text-purple-700"
                                  : ""
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(booking.scheduled_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {new Date(booking.scheduled_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          ₹{Number(booking.final_amount).toFixed(2)}
                        </p>
                        <Button variant="ghost" size="sm" className="mt-1">
                          View Details
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="w-full">
        <HeroSection />
        <FeaturesSection />
        <CategoriesSection />
        <CTASection />
      </div>
    </div>
  );
}
