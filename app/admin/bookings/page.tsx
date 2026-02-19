import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import Link from "next/link";

async function getBookings() {
  const supabase = await createClient();

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

  try {
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        scheduled_at,
        completed_at,
        cancelled_at,
        total_amount,
        service_fee,
        final_amount,
        created_at,
        customer:profiles!bookings_customer_id_fkey(id, full_name, phone),
        professional:profiles!bookings_professional_id_fkey(id, full_name, phone),
        service:services(id, name, category),
        payment:payments(id, status, amount, method)
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching bookings:", error);
      return [];
    }

    return bookings || [];
  } catch (error) {
    console.error("Unexpected error fetching bookings:", error);
    return [];
  }
}

export default async function AdminBookingsPage() {
  const bookings = await getBookings();

  const statusCounts = {
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    in_progress: bookings.filter((b) => b.status === "in_progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    refunded: bookings.filter((b) => b.status === "refunded").length,
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-blue-50 mt-1">View and manage all bookings</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {Object.entries(statusCounts).map(([status, count], index) => {
          const colorClasses = [
            { bg: "bg-yellow-50", border: "border-yellow-200" }, // pending
            { bg: "bg-blue-50", border: "border-blue-200" }, // confirmed
            { bg: "bg-purple-50", border: "border-purple-200" }, // in_progress
            { bg: "bg-green-50", border: "border-green-200" }, // completed
            { bg: "bg-red-50", border: "border-red-200" }, // cancelled
            { bg: "bg-indigo-50", border: "border-indigo-200" }, // refunded
          ];
          const colors = colorClasses[index % colorClasses.length];
          return (
            <Card key={status} className={`${colors.bg} border ${colors.border} shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-4">
                <div className="text-3xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600 capitalize mt-1">
                  {status.replace("_", " ")}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bookings Table */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <CardTitle className="text-xl sm:text-2xl font-bold">
            <span className="inline-flex items-center gap-2">
              All Bookings
              <span className="px-3 py-1 rounded-full bg-white text-cyan-600 text-sm font-semibold">
                ({bookings.length})
              </span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: Card View */}
          <div className="md:hidden space-y-4">
            {bookings.map((booking: any, index: number) => {
              const gradients = [
                "from-pink-400 to-rose-500",
                "from-blue-400 to-indigo-500",
                "from-purple-400 to-pink-500",
                "from-cyan-400 to-blue-500",
                "from-orange-400 to-red-500",
              ];
              const gradient = gradients[index % gradients.length];
              return (
              <Card key={booking.id} className="border border-gray-200 bg-white shadow-lg">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-gray-500 mb-1">
                        {booking.id.substring(0, 8)}...
                      </div>
                      <h3 className="font-semibold text-sm mb-2">{booking.service?.name}</h3>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Customer:</span> {booking.customer?.full_name}
                        </div>
                        <div>
                          <span className="font-medium">Professional:</span> {booking.professional?.full_name || "Unassigned"}
                        </div>
                        <div>
                          <span className="font-medium">Scheduled:</span> {new Date(booking.scheduled_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="font-bold text-lg">₹{booking.final_amount}</div>
                      <span
                        className={`inline-block mt-1 px-2 py-1 rounded text-xs ${booking.status === "completed"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : booking.status === "cancelled" || booking.status === "refunded"
                              ? "bg-[#FEE2E2] text-[#991B1B]"
                              : booking.status === "in_progress"
                                ? "bg-[#DBEAFE] text-[#1E3A8A]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                          }`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/30">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="block w-full text-center px-3 py-2 text-sm font-medium bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>

          {/* Desktop: Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left p-2 text-gray-700 font-semibold">ID</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Customer</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Professional</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Service</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Scheduled</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Amount</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Status</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Payment</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any, index: number) => (
                  <tr key={booking.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                    <td className="p-2 text-sm font-mono">
                      {booking.id.substring(0, 8)}...
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">
                          {booking.customer?.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.customer?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div>
                        <div className="font-medium">
                          {booking.professional?.full_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {booking.professional?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-sm">{booking.service?.name}</div>
                      <div className="text-xs text-gray-500">
                        {booking.service?.category}
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      {new Date(booking.scheduled_at).toLocaleDateString()}
                      <div className="text-xs text-gray-500">
                        {new Date(booking.scheduled_at).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="font-medium">₹{booking.final_amount}</div>
                      {booking.service_fee > 0 && (
                        <div className="text-xs text-gray-500">
                          Fee: ₹{booking.service_fee}
                        </div>
                      )}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${booking.status === "completed"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : booking.status === "cancelled" ||
                              booking.status === "refunded"
                              ? "bg-[#FEE2E2] text-[#991B1B]"
                              : booking.status === "in_progress"
                                ? "bg-[#DBEAFE] text-[#1E3A8A]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                          }`}
                      >
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-2">
                      {booking.payment ? (
                        <span
                          className={`px-2 py-1 rounded text-xs ${booking.payment.status === "completed"
                              ? "bg-[#D1FAE5] text-[#065F46]"
                              : booking.payment.status === "refunded"
                                ? "bg-[#FEE2E2] text-[#991B1B]"
                                : "bg-[#FEF3C7] text-[#92400E]"
                            }`}
                        >
                          {booking.payment.status}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          No payment
                        </span>
                      )}
                    </td>
                    <td className="p-2">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
