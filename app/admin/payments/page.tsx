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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Payments & Commission
        </h1>
        <p className="text-gray-600 mt-1">
          Track payments and platform commission
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Commission
            </CardTitle>
            <span className="text-2xl">💵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalCommission.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Service fees collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Successful payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunded</CardTitle>
            <span className="text-2xl">↩️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.refunded}</div>
            <p className="text-xs text-gray-500 mt-1">Refunded payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Payments ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Transaction ID</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Commission</th>
                  <th className="text-left p-2">Method</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any) => {
                  const booking = payment.booking as any;
                  return (
                    <tr key={payment.id} className="border-b">
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
