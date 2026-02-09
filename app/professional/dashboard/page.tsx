"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { getRoleBasedRedirect } from "@/lib/auth/utils";
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
import type {
  Booking,
  Profile,
} from "@/lib/types/database";
import {
  Calendar,
  DollarSign,
  Package,
  CheckCircle,
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
  const router = useRouter();
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
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Real-time bookings hook
  const { bookings: realtimeBookings } = useRealtimeBookings({
    userId: user?.id,
    role: "professional",
    enabled: !!user && role === "professional"
  });

  // Sync realtime bookings with stats
  useEffect(() => {
    if (realtimeBookings.length > 0) {
      const pending = realtimeBookings.filter((b) => b.status === "pending").length;
      const confirmed = realtimeBookings.filter((b) => b.status === "confirmed").length;
      const completed = realtimeBookings.filter((b) => b.status === "completed").length;

      // Calculate earnings (assuming professional gets 80% of final_amount)
      const totalEarnings = realtimeBookings
        .filter((b) => b.status === "completed")
        .reduce((sum, b) => sum + Number(b.final_amount) * 0.8, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings = realtimeBookings
        .filter((b) => {
          if (b.status !== "completed" || !b.completed_at) return false;
          const completedDate = new Date(b.completed_at);
          return (
            completedDate.getMonth() === currentMonth &&
            completedDate.getFullYear() === currentYear
          );
        })
        .reduce((sum, b) => sum + Number(b.final_amount) * 0.8, 0);

      setStats((prev) => ({
        ...prev,
        totalBookings: realtimeBookings.length,
        pendingRequests: pending,
        confirmedBookings: confirmed,
        completedBookings: completed,
        totalEarnings,
        monthlyEarnings,
        recentBookings: realtimeBookings.slice(0, 5),
      }));
    }
  }, [realtimeBookings]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

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

      // Note: Bookings and stats are now synchronized via the useRealtimeBookings hook
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (authLoading || statsLoading) {
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Welcome back, {profile?.full_name || "Professional"}!
        </h1>
        <p className="text-gray-600 text-lg">
          Manage your job requests, availability, and earnings.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 sm:mb-8 border-b border-gray-200 overflow-x-auto">
        <nav className="flex flex-nowrap gap-2 sm:gap-4 md:gap-8 min-w-max sm:min-w-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 touch-manipulation ${activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap relative transition-all duration-200 touch-manipulation ${activeTab === "requests"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Job Requests
            {stats.pendingRequests > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">{stats.pendingRequests}</Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 touch-manipulation ${activeTab === "calendar"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Availability
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 touch-manipulation ${activeTab === "earnings"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Earnings
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 touch-manipulation ${activeTab === "documents"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 touch-manipulation ${activeTab === "payments"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Payments
          </button>
          <button
            onClick={() => setActiveTab("verification")}
            className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-semibold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 touch-manipulation ${activeTab === "verification"
              ? "border-blue-600 text-blue-600"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Total Bookings
                </CardTitle>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Package className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-blue-900 mb-1">{stats.totalBookings}</div>
                <p className="text-xs text-gray-500">
                  All time bookings
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Pending Requests
                </CardTitle>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                  <AlertCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-1">
                  {stats.pendingRequests}
                </div>
                <p className="text-xs text-gray-500">
                  Awaiting your response
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 bg-gradient-to-br from-green-50 via-white to-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Confirmed</CardTitle>
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-green-600 mb-1">
                  {stats.confirmedBookings}
                </div>
                <p className="text-xs text-gray-500">Upcoming jobs</p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-gradient-to-br from-purple-50 via-white to-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Total Earnings
                </CardTitle>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl md:text-4xl font-bold text-purple-900 mb-1">
                  ₹{stats.totalEarnings.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500">
                  Lifetime earnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Recent Bookings</CardTitle>
                  <CardDescription className="mt-1">
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
                <div className="text-center py-12 text-gray-500">
                  <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No bookings yet</p>
                  <p className="text-sm text-gray-400 mt-1">Start accepting jobs to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-5 border-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-lg hover:border-blue-200 transition-all duration-300 cursor-pointer group"
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
                          ₹{Number(booking.final_amount).toFixed(2)}
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
