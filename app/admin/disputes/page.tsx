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

  // Get bookings that are cancelled or have refund requests
  const { data: bookings } = await supabase
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

  // Get payments that are refunded or have refund requests
  const { data: refundedPayments } = await supabase
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

  return {
    disputes: bookings || [],
    refunds: refundedPayments || [],
  };
}

export default async function AdminDisputesPage() {
  const { disputes, refunds } = await getDisputes();

  const pendingDisputes = disputes.filter((d) => d.status === "cancelled");
  const resolvedDisputes = disputes.filter((d) => d.status === "refunded");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Refund & Dispute Handling</h1>
        <p className="text-gray-600 mt-1">Manage refunds and resolve disputes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Disputes</CardTitle>
            <span className="text-2xl">⏳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDisputes.length}</div>
            <p className="text-xs text-gray-500 mt-1">Requires action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedDisputes.length}</div>
            <p className="text-xs text-gray-500 mt-1">Refunded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunded</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{refunds.reduce((sum, r) => sum + (r.refund_amount || 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Disputes */}
      {pendingDisputes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Disputes ({pendingDisputes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingDisputes.map((dispute: any) => (
                <div
                  key={dispute.id}
                  className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold">Booking #{dispute.id.substring(0, 8)}</h3>
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
                          <span className="text-gray-600">Service:</span> {dispute.service?.name}
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span> ₹{dispute.final_amount}
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
                        <input type="hidden" name="bookingId" value={dispute.id} />
                        <Button type="submit" variant="default">
                          Process Refund
                        </Button>
                      </form>
                      <form action={resolveDispute}>
                        <input type="hidden" name="bookingId" value={dispute.id} />
                        <Button type="submit" variant="outline">
                          Resolve
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refund History */}
      <Card>
        <CardHeader>
          <CardTitle>Refund History ({refunds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Payment ID</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-left p-2">Service</th>
                  <th className="text-left p-2">Original Amount</th>
                  <th className="text-left p-2">Refund Amount</th>
                  <th className="text-left p-2">Reason</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {refunds.map((refund: any) => {
                  const booking = refund.booking as any;
                  return (
                    <tr key={refund.id} className="border-b">
                      <td className="p-2 text-sm font-mono">
                        {refund.id.substring(0, 8)}...
                      </td>
                      <td className="p-2">{booking?.customer?.full_name || "N/A"}</td>
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
