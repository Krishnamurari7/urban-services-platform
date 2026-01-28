import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

async function getAnalytics() {
  const supabase = await createClient();

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  // Get analytics data
  const [
    { count: totalUsers },
    { count: totalProfessionals },
    { count: totalBookings },
    { count: totalServices },
    { data: recentBookings },
    { data: revenueData },
    { data: topServices },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "professional"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("services").select("*", { count: "exact", head: true }),
    supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        final_amount,
        scheduled_at,
        created_at,
        customer:profiles!bookings_customer_id_fkey(full_name),
        professional:profiles!bookings_professional_id_fkey(full_name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("payments")
      .select("amount, status, created_at")
      .eq("status", "completed")
      .gte(
        "created_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      ),
    supabase
      .from("bookings")
      .select(
        `
        service_id,
        services(name),
        count
      `
      )
      .limit(5),
  ]);

  // Calculate revenue metrics
  const totalRevenue =
    revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const monthlyRevenue =
    revenueData
      ?.filter(
        (p) =>
          new Date(p.created_at).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000
      )
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  // Get booking status counts
  const { data: bookingStatuses } = await supabase
    .from("bookings")
    .select("status");

  const statusCounts = {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
  };

  bookingStatuses?.forEach((booking) => {
    statusCounts[booking.status as keyof typeof statusCounts]++;
  });

  return {
    totalUsers: totalUsers || 0,
    totalProfessionals: totalProfessionals || 0,
    totalBookings: totalBookings || 0,
    totalServices: totalServices || 0,
    totalRevenue,
    monthlyRevenue,
    recentBookings: recentBookings || [],
    statusCounts,
  };
}

export default async function AdminDashboard() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of platform metrics and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.totalProfessionals} professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <span className="text-2xl">📅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.statusCounts.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{analytics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ₹{analytics.monthlyRevenue.toLocaleString()} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Services
            </CardTitle>
            <span className="text-2xl">🔧</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalServices}</div>
            <p className="text-xs text-gray-500 mt-1">Available on platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentBookings.length > 0 ? (
                analytics.recentBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {booking.customer?.full_name || "Customer"} →{" "}
                        {booking.professional?.full_name || "Professional"}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{booking.final_amount} • {booking.status}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent bookings</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
