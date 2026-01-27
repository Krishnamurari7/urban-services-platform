"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Booking, Payment } from "@/lib/types/database";
import { DollarSign, TrendingUp, Calendar, Package } from "lucide-react";

interface EarningsData {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  completedBookings: number;
  averageEarningPerJob: number;
  monthlyBreakdown: { month: string; earnings: number }[];
  recentPayments: Payment[];
}

export function EarningsDashboard() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<EarningsData>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    weeklyEarnings: 0,
    completedBookings: 0,
    averageEarningPerJob: 0,
    monthlyBreakdown: [],
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    if (user) {
      fetchEarnings();
    }
  }, [user, selectedPeriod]);

  const fetchEarnings = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Fetch completed bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("professional_id", user.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch payments
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("status", "completed")
        .in("booking_id", bookings?.map((b) => b.id) || []);

      if (paymentsError) throw paymentsError;

      // Calculate earnings (assuming professional gets 80% of final_amount)
      const PROFESSIONAL_CUT = 0.8;
      const totalEarnings =
        bookings?.reduce((sum, b) => sum + Number(b.final_amount) * PROFESSIONAL_CUT, 0) || 0;

      // Monthly earnings
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings =
        bookings
          ?.filter((b) => {
            if (!b.completed_at) return false;
            const completedDate = new Date(b.completed_at);
            return (
              completedDate.getMonth() === currentMonth &&
              completedDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, b) => sum + Number(b.final_amount) * PROFESSIONAL_CUT, 0) || 0;

      // Weekly earnings
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyEarnings =
        bookings
          ?.filter((b) => {
            if (!b.completed_at) return false;
            return new Date(b.completed_at) >= oneWeekAgo;
          })
          .reduce((sum, b) => sum + Number(b.final_amount) * PROFESSIONAL_CUT, 0) || 0;

      const completedBookings = bookings?.length || 0;
      const averageEarningPerJob =
        completedBookings > 0 ? totalEarnings / completedBookings : 0;

      // Monthly breakdown (last 6 months)
      const monthlyBreakdown: { month: string; earnings: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthEarnings =
          bookings
            ?.filter((b) => {
              if (!b.completed_at) return false;
              const completedDate = new Date(b.completed_at);
              return completedDate >= monthStart && completedDate <= monthEnd;
            })
            .reduce((sum, b) => sum + Number(b.final_amount) * PROFESSIONAL_CUT, 0) || 0;

        monthlyBreakdown.push({
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          earnings: monthEarnings,
        });
      }

      setEarnings({
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        completedBookings,
        averageEarningPerJob,
        monthlyBreakdown,
        recentPayments: payments?.slice(0, 10) || [],
      });
    } catch (error) {
      console.error("Error fetching earnings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const displayEarnings =
    selectedPeriod === "week"
      ? earnings.weeklyEarnings
      : selectedPeriod === "month"
      ? earnings.monthlyEarnings
      : earnings.totalEarnings;

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {(["week", "month", "year"] as const).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-md font-medium capitalize ${
              selectedPeriod === period
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {selectedPeriod === "week"
                ? "Weekly Earnings"
                : selectedPeriod === "month"
                ? "Monthly Earnings"
                : "Total Earnings"}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${displayEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {selectedPeriod === "week"
                ? "Last 7 days"
                : selectedPeriod === "month"
                ? "This month"
                : "All time"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Jobs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.completedBookings}</div>
            <p className="text-xs text-muted-foreground">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Job</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.averageEarningPerJob.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Average earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
          <CardDescription>Earnings over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.monthlyBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{item.month}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold">${item.earnings.toFixed(2)}</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{
                        width: `${
                          earnings.monthlyBreakdown.reduce(
                            (max, m) => Math.max(max, m.earnings),
                            0
                          ) > 0
                            ? (item.earnings /
                                earnings.monthlyBreakdown.reduce(
                                  (max, m) => Math.max(max, m.earnings),
                                  0
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest completed payments</CardDescription>
        </CardHeader>
        <CardContent>
          {earnings.recentPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No payments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Payment #{payment.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">${Number(payment.amount).toFixed(2)}</p>
                    <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
