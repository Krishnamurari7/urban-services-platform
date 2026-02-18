import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { processRefund, resolveDispute } from "./actions";

// For now, we'll use bookings with refund status as disputes
// In a full implementation, you'd have a separate disputes table
async function getDisputes() {
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
  let disputes: any[] = [];
  let refunds: any[] = [];

  try {
    // Get bookings that are cancelled or have refund requests
    const { data: bookingsData, error: bookingsError } = await supabase
      .from("bookings")
      .select(
        `
        id,
        status,
        cancellation_reason,
        final_amount,
        cancelled_at,
        created_at,
        customer:profiles!bookings_customer_id_fkey(id, full_name, phone),
        professional:profiles!bookings_professional_id_fkey(id, full_name, phone),
        service:services(name),
        payment:payments(id, status, refund_amount, refund_reason)
      `
      )
      .in("status", ["cancelled", "refunded"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (bookingsError) {
      console.error("Error fetching disputes:", bookingsError);
    } else {
      disputes = bookingsData || [];
    }

    // Get payments that are refunded or have refund requests
    const { data: refundsData, error: refundsError } = await supabase
      .from("payments")
      .select(
        `
        id,
        booking_id,
        amount,
        refund_amount,
        refund_reason,
        refunded_at,
        status,
        booking:bookings(
          id,
          customer:profiles!bookings_customer_id_fkey(full_name),
          professional:profiles!bookings_professional_id_fkey(full_name),
          service:services(name)
        )
      `
      )
      .eq("status", "refunded")
      .order("refunded_at", { ascending: false })
      .limit(50);

    if (refundsError) {
      console.error("Error fetching refunds:", refundsError);
    } else {
      refunds = refundsData || [];
    }
  } catch (error) {
    console.error("Unexpected error fetching disputes/refunds:", error);
  }

  return {
    disputes,
    refunds,
  };
}

export default async function AdminDisputesPage() {
  const { disputes, refunds } = await getDisputes();

  const pendingDisputes = disputes.filter((d) => d.status === "cancelled");
  const resolvedDisputes = disputes.filter((d) => d.status === "refunded");

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold">
          Refund & Dispute Handling
        </h1>
        <p className="text-rose-100 mt-1">
          Manage refunds and resolve disputes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Pending Disputes
            </CardTitle>
            <span className="text-3xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingDisputes.length}</div>
            <p className="text-xs text-orange-100 mt-1">Requires action</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Resolved</CardTitle>
            <span className="text-3xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resolvedDisputes.length}</div>
            <p className="text-xs text-green-100 mt-1">Refunded</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-rose-500 text-white border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Total Refunded
            </CardTitle>
            <span className="text-3xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹
              {refunds
                .reduce((sum, r) => sum + (r.refund_amount || 0), 0)
                .toLocaleString()}
            </div>
            <p className="text-xs text-red-100 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Disputes */}
      {pendingDisputes.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-t-lg -m-6 mb-4 p-6 text-white">
            <CardTitle className="text-xl font-bold">Pending Disputes ({pendingDisputes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDisputes.map((dispute: any, index: number) => {
                const gradients = [
                  "from-orange-400 to-red-500",
                  "from-amber-400 to-orange-500",
                  "from-yellow-400 to-amber-500",
                ];
                const gradient = gradients[index % gradients.length];
                return (
                <div
                  key={dispute.id}
                  className={`p-4 border-2 border-orange-300 bg-gradient-to-br ${gradient} text-white rounded-xl shadow-md hover:shadow-xl transform hover:scale-105 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold">
                          Booking #{dispute.id.substring(0, 8)}
                        </h3>
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          Cancelled
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Customer:</span>{" "}
                          {dispute.customer?.full_name}
                        </div>
                        <div>
                          <span className="text-gray-600">Professional:</span>{" "}
                          {dispute.professional?.full_name}
                        </div>
                        <div>
                          <span className="text-gray-600">Service:</span>{" "}
                          {dispute.service?.name}
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span> ₹
                          {dispute.final_amount}
                        </div>
                      </div>
                      {dispute.cancellation_reason && (
                        <div className="mt-2">
                          <span className="text-sm font-medium">Reason:</span>
                          <p className="text-sm text-gray-600 mt-1">
                            {dispute.cancellation_reason}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <form action={processRefund}>
                        <input
                          type="hidden"
                          name="bookingId"
                          value={dispute.id}
                        />
                        <Button type="submit" variant="default">
                          Process Refund
                        </Button>
                      </form>
                      <form action={resolveDispute}>
                        <input
                          type="hidden"
                          name="bookingId"
                          value={dispute.id}
                        />
                        <Button type="submit" variant="outline">
                          Resolve
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund History */}
      <Card className="bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 border-2 border-red-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-600 to-rose-600 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <CardTitle className="text-xl font-bold">Refund History ({refunds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gradient-to-r from-red-500 to-rose-500 text-white">
                  <th className="text-left p-2 text-white font-semibold">Payment ID</th>
                  <th className="text-left p-2 text-white font-semibold">Customer</th>
                  <th className="text-left p-2 text-white font-semibold">Service</th>
                  <th className="text-left p-2 text-white font-semibold">Original Amount</th>
                  <th className="text-left p-2 text-white font-semibold">Refund Amount</th>
                  <th className="text-left p-2 text-white font-semibold">Reason</th>
                  <th className="text-left p-2 text-white font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund: any, index: number) => {
                  const booking = refund.booking as any;
                  return (
                    <tr key={refund.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-red-50'} hover:bg-red-100 transition-colors`}>
                      <td className="p-2 text-sm font-mono">
                        {refund.id.substring(0, 8)}...
                      </td>
                      <td className="p-2">
                        <span className="text-red-600 font-medium">
                          {booking?.customer?.full_name || "N/A"}
                        </span>
                      </td>
                      <td className="p-2">{booking?.service?.name || "N/A"}</td>
                      <td className="p-2">₹{refund.amount}</td>
                      <td className="p-2 font-medium text-red-600">
                        ₹{refund.refund_amount || refund.amount}
                      </td>
                      <td className="p-2 text-sm text-gray-600">
                        {refund.refund_reason || "N/A"}
                      </td>
                      <td className="p-2 text-sm">
                        {refund.refunded_at
                          ? new Date(refund.refunded_at).toLocaleDateString()
                          : "N/A"}
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
