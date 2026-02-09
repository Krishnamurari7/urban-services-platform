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

  // Initialize data with defaults
  let totalUsers = 0;
  let totalProfessionals = 0;
  let totalBookings = 0;
  let totalServices = 0;
  let recentBookings: any[] = [];
  let revenueData: any[] = [];
  let topServices: any[] = [];

  try {
    // Get analytics data with individual error handling
    const [
      usersRes,
      profsRes,
      bookingsRes,
      servicesRes,
      recentRes,
      revenueRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "professional"),
      supabase.from("bookings").select("id", { count: "exact", head: true }),
      supabase.from("services").select("id", { count: "exact", head: true }),
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
    ]);

    totalUsers = usersRes.count || 0;
    totalProfessionals = profsRes.count || 0;
    totalBookings = bookingsRes.count || 0;
    totalServices = servicesRes.count || 0;
    recentBookings = recentRes.data || [];
    revenueData = revenueRes.data || [];
  } catch (error) {
    console.error("Error fetching analytics data:", error);
  }

  // Calculate revenue metrics safely
  const totalRevenue =
    revenueData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const weeklyRevenue =
    revenueData
      ?.filter(
        (p) =>
          new Date(p.created_at).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000
      )
      .reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

  // Get booking status counts
  const statusCounts = {
    pending: 0,
    confirmed: 0,
    in_progress: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0,
  };

  try {
    const { data: bookingStatuses } = await supabase
      .from("bookings")
      .select("status");

    bookingStatuses?.forEach((booking) => {
      if (booking.status in statusCounts) {
        statusCounts[booking.status as keyof typeof statusCounts]++;
      }
    });
  } catch (statusError) {
    console.error("Error fetching booking statuses:", statusError);
  }

  return {
    totalUsers,
    totalProfessionals,
    totalBookings,
    totalServices,
    totalRevenue,
    weeklyRevenue,
    recentBookings,
    statusCounts,
  };
}

export default async function AdminDashboard() {
  const analytics = await getAnalytics();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Overview of platform metrics and performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Users</CardTitle>
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-blue-900 mb-1">{analytics.totalUsers}</div>
            <p className="text-xs text-gray-500">
              {analytics.totalProfessionals} professionals
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100 bg-gradient-to-br from-purple-50 via-white to-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Total Bookings
            </CardTitle>
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">📅</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-purple-900 mb-1">{analytics.totalBookings}</div>
            <p className="text-xs text-gray-500">
              {analytics.statusCounts.completed} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-100 bg-gradient-to-br from-green-50 via-white to-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">Total Revenue</CardTitle>
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">💰</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-green-900 mb-1">
              ₹{analytics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">
              ₹{analytics.weeklyRevenue.toLocaleString()} this week
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700">
              Active Services
            </CardTitle>
            <div className="h-12 w-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-2xl">🔧</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-orange-900 mb-1">{analytics.totalServices}</div>
            <p className="text-xs text-gray-500">Available on platform</p>
          </CardContent>
        </Card>
      </div>

      {/* Booking Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-semibold capitalize text-gray-700">
                    {status.replace("_", " ")}
                  </span>
                  <span className="text-sm font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentBookings.length > 0 ? (
                analytics.recentBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {booking.customer?.full_name || "Customer"} →{" "}
                        {booking.professional?.full_name || "Professional"}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        ₹{booking.final_amount} • <span className="capitalize">{booking.status}</span>
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No recent bookings</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
