import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

async function getPayments() {
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

  // Initialize data with defaults
  let payments: any[] = [];
  let totalRevenue = 0;
  let totalCommission = 0;
  let completedCount = 0;
  let pendingCount = 0;
  let refundedCount = 0;

  try {
    // Get all payments
    const { data: paymentsData, error } = await supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        status,
        method,
        transaction_id,
        refund_amount,
        created_at,
        booking:bookings(
          id,
          final_amount,
          service_fee,
          customer:profiles!bookings_customer_id_fkey(full_name),
          professional:profiles!bookings_professional_id_fkey(full_name),
          service:services(name)
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Error fetching payments:", error);
    } else {
      payments = paymentsData || [];

      // Calculate metrics safely
      totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      totalCommission = payments.reduce(
        (sum, p) => sum + ((p.booking as any)?.service_fee || 0),
        0
      );
      completedCount = payments.filter((p) => p.status === "completed").length;
      pendingCount = payments.filter((p) => p.status === "pending").length;
      refundedCount = payments.filter((p) => p.status === "refunded").length;
    }
  } catch (error) {
    console.error("Unexpected error fetching payments:", error);
  }

  return {
    payments,
    stats: {
      totalRevenue,
      totalCommission,
      completed: completedCount,
      pending: pendingCount,
      refunded: refundedCount,
    },
  };
}

export default async function AdminPaymentsPage() {
  const { payments, stats } = await getPayments();

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold">
          Payments & Commission
        </h1>
        <p className="text-emerald-100 mt-1">
          Track payments and platform commission
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
            <span className="text-3xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-green-100 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Platform Commission
            </CardTitle>
            <span className="text-3xl">💵</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{stats.totalCommission.toLocaleString()}
            </div>
            <p className="text-xs text-blue-100 mt-1">Service fees collected</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Completed</CardTitle>
            <span className="text-3xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.completed}</div>
            <p className="text-xs text-teal-100 mt-1">Successful payments</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Refunded</CardTitle>
            <span className="text-3xl">↩️</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.refunded}</div>
            <p className="text-xs text-orange-100 mt-1">Refunded payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <CardTitle className="text-xl font-bold">All Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <th className="text-left p-2 text-white font-semibold">Transaction ID</th>
                  <th className="text-left p-2 text-white font-semibold">Customer</th>
                  <th className="text-left p-2 text-white font-semibold">Service</th>
                  <th className="text-left p-2 text-white font-semibold">Amount</th>
                  <th className="text-left p-2 text-white font-semibold">Commission</th>
                  <th className="text-left p-2 text-white font-semibold">Method</th>
                  <th className="text-left p-2 text-white font-semibold">Status</th>
                  <th className="text-left p-2 text-white font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any, index: number) => {
                  const booking = payment.booking as any;
                  return (
                    <tr key={payment.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-green-50'} hover:bg-green-100 transition-colors`}>
                      <td className="p-2 text-sm font-mono">
                        {payment.transaction_id || payment.id.substring(0, 8)}
                      </td>
                      <td className="p-2">
                        {booking?.customer?.full_name || "N/A"}
                      </td>
                      <td className="p-2">{booking?.service?.name || "N/A"}</td>
                      <td className="p-2 font-medium">₹{payment.amount}</td>
                      <td className="p-2 text-sm text-gray-600">
                        ₹{booking?.service_fee || 0}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs capitalize">
                          {payment.method.replace("_", " ")}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${payment.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : payment.status === "refunded"
                                ? "bg-red-100 text-red-700"
                                : payment.status === "failed"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="p-2 text-sm">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
