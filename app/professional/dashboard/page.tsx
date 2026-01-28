"use client";

import { useEffect, useState } from "react";
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
import type {
  Booking,
  Profile,
  Payment,
  AvailabilitySlot,
} from "@/lib/types/database";
import {
  Calendar,
  Clock,
  DollarSign,
  Package,
  CheckCircle,
  XCircle,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { JobRequestsSection } from "@/components/professional/job-requests-section";
import { AvailabilityCalendar } from "@/components/professional/availability-calendar";
import { EarningsDashboard } from "@/components/professional/earnings-dashboard";
import { DocumentVerification } from "@/components/professional/document-verification";
import { PaymentSection } from "@/components/professional/payment-section";
import { VerificationSection } from "@/components/professional/verification-section";

interface DashboardStats {
  totalBookings: number;
  pendingRequests: number;
  confirmedBookings: number;
  completedBookings: number;
  totalEarnings: number;
  monthlyEarnings: number;
  recentBookings: Booking[];
}

type TabType =
  | "overview"
  | "requests"
  | "calendar"
  | "earnings"
  | "documents"
  | "payments"
  | "verification";

export default function ProfessionalDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingRequests: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    recentBookings: [],
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        window.location.href = "/login";
        return;
      }
      // Check if user has professional role
      if (role !== "professional") {
        // Redirect based on actual role
        if (role === "admin") {
          window.location.href = "/admin/dashboard";
        } else if (role === "customer") {
          window.location.href = "/customer/dashboard";
        } else {
          window.location.href = "/login?error=unauthorized";
        }
        return;
      }
      fetchDashboardData();
    }
  }, [user, role, authLoading]);

  // Check for tab query parameter
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (
        tab &&
        [
          "overview",
          "requests",
          "calendar",
          "earnings",
          "documents",
          "payments",
          "verification",
        ].includes(tab)
      ) {
        setActiveTab(tab as TabType);
      }
    }
  }, []);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      // Fetch completed payments
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, created_at")
        .eq("status", "completed")
        .in("booking_id", bookings?.map((b) => b.id) || []);

      // Calculate stats
      const totalBookings = bookings?.length || 0;
      const pendingRequests =
        bookings?.filter((b) => b.status === "pending").length || 0;
      const confirmedBookings =
        bookings?.filter((b) => b.status === "confirmed").length || 0;
      const completedBookings =
        bookings?.filter((b) => b.status === "completed").length || 0;

      // Calculate earnings (assuming professional gets 80% of final_amount)
      const totalEarnings =
        bookings
          ?.filter((b) => b.status === "completed")
          .reduce((sum, b) => sum + Number(b.final_amount) * 0.8, 0) || 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings =
        bookings
          ?.filter((b) => {
            if (b.status !== "completed" || !b.completed_at) return false;
            const completedDate = new Date(b.completed_at);
            return (
              completedDate.getMonth() === currentMonth &&
              completedDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, b) => sum + Number(b.final_amount) * 0.8, 0) || 0;

      setStats({
        totalBookings,
        pendingRequests,
        confirmedBookings,
        completedBookings,
        totalEarnings,
        monthlyEarnings,
        recentBookings: bookings?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
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

  if (!user || role !== "professional") {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {profile?.full_name || "Professional"}!
        </h1>
        <p className="text-gray-600">
          Manage your job requests, availability, and earnings.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "overview"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
              activeTab === "requests"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Job Requests
            {stats.pendingRequests > 0 && (
              <Badge className="ml-2 bg-red-500">{stats.pendingRequests}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "calendar"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Availability
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "earnings"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "payments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "verification"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Verification
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <>
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
                <p className="text-xs text-muted-foreground">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.pendingRequests}
                </div>
                <p className="text-xs text-muted-foreground">
                  Awaiting your response
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.confirmedBookings}
                </div>
                <p className="text-xs text-muted-foreground">Upcoming jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${stats.totalEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Lifetime earnings
                </p>
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
                    Your latest job requests and bookings
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("requests")}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No bookings yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
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
                                  : booking.status === "pending"
                                    ? "secondary"
                                    : "default"
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
                          ${Number(booking.final_amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "requests" && (
        <JobRequestsSection onRefresh={fetchDashboardData} />
      )}

      {activeTab === "calendar" && <AvailabilityCalendar />}

      {activeTab === "earnings" && <EarningsDashboard />}

      {activeTab === "documents" && <DocumentVerification />}

      {activeTab === "payments" && <PaymentSection />}

      {activeTab === "verification" && <VerificationSection />}
    </div>
  );
}
