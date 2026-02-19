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
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">
          Payments & Commission
        </h1>
        <p className="text-blue-50 mt-1">
          Track payments and platform commission
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-amber-50 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Revenue</CardTitle>
            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💰</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50 border border-emerald-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Platform Commission
            </CardTitle>
            <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">💵</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ₹{stats.totalCommission.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Service fees collected</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Completed</CardTitle>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Successful payments</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Refunded</CardTitle>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">↩️</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.refunded}</div>
            <p className="text-xs text-gray-500 mt-1">Refunded payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <CardTitle className="text-xl font-bold">All Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left p-2 text-gray-700 font-semibold">Transaction ID</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Customer</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Service</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Amount</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Commission</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Method</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Status</th>
                  <th className="text-left p-2 text-gray-700 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any, index: number) => {
                  const booking = payment.booking as any;
                  return (
                    <tr key={payment.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
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
