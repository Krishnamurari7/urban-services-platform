"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
import Link from "next/link";
import type { Booking, Payment, Profile } from "@/lib/types/database";
import { Calendar, Clock, DollarSign, Package, Plus } from "lucide-react";

interface DashboardStats {
  totalBookings: number;
  upcomingBookings: number;
  completedBookings: number;
  totalSpent: number;
  recentBookings: Booking[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const authLoadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [authLoadingTimeout, setAuthLoadingTimeout] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (bookingsError) {
        console.error("Error fetching bookings:", bookingsError);
      }

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("amount, status")
        .eq("customer_id", user.id)
        .eq("status", "completed");

      if (paymentsError) {
        console.error("Error fetching payments:", paymentsError);
      }

      // Calculate stats
      const totalBookings = bookings?.length || 0;
      const upcomingBookings =
        bookings?.filter(
          (b) =>
            b.status === "pending" ||
            b.status === "confirmed" ||
            b.status === "in_progress"
        ).length || 0;
      const completedBookings =
        bookings?.filter((b) => b.status === "completed").length || 0;
      const totalSpent =
        payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      setStats({
        totalBookings,
        upcomingBookings,
        completedBookings,
        totalSpent,
        recentBookings: bookings || [],
      });
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
      // Set timeout for auth loading (15 seconds)
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
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set a timeout fallback to prevent infinite loading
    timeoutRef.current = setTimeout(() => {
      if (!hasFetchedRef.current) {
        console.warn("Dashboard loading timeout - forcing loading to false");
        setLoading(false);
        setError(
          "Loading is taking longer than expected. Please refresh the page."
        );
      }
    }, 10000); // 10 second timeout

    // Proceed if auth is not loading OR if auth loading timeout occurred
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

  // Show loading only if auth is loading OR data is loading (but not if timeout occurred)
  if ((authLoading || loading) && !error && !authLoadingTimeout) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name || "Customer"}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your service bookings and activity.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Link href="/customer/book-service">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Book a New Service
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">Scheduled services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">Finished services</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
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
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bookings yet</p>
              <Link href="/customer/book-service">
                <Button variant="outline" className="mt-4">
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
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">
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
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Scheduled:{" "}
                        {new Date(booking.scheduled_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm font-medium mt-1">
                        ₹{Number(booking.final_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
