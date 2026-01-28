import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { updateBookingStatus, cancelBooking } from "./actions";
import { AssignProfessionalForm } from "@/components/admin/assign-professional-form";

async function getBooking(id: string) {
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

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      `
      *,
      customer:profiles!bookings_customer_id_fkey(
        id,
        full_name,
        phone,
        email
      ),
      professional:profiles!bookings_professional_id_fkey(
        id,
        full_name,
        phone,
        rating_average
      ),
      service:services(
        id,
        name,
        category,
        description
      ),
      address:addresses(
        id,
        label,
        address_line1,
        address_line2,
        city,
        state,
        postal_code
      ),
      payment:payments(
        id,
        amount,
        status,
        method,
        transaction_id,
        refund_amount,
        refund_reason,
        created_at
      ),
      review:reviews(
        id,
        rating,
        comment,
        created_at
      )
    `
    )
    .eq("id", id)
    .single();

  return booking;
}

export default async function BookingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const booking = await getBooking(params.id);

  if (!booking) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Booking not found</p>
            <Link href="/admin/bookings">
              <Button variant="outline" className="mt-4">
                Back to Bookings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookingData = booking as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <p className="text-gray-600 mt-1">
            ID: {params.id.substring(0, 8)}...
          </p>
        </div>
        <Link href="/admin/bookings">
          <Button variant="outline">Back to Bookings</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Info */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        bookingData.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : bookingData.status === "cancelled" ||
                              bookingData.status === "refunded"
                            ? "bg-red-100 text-red-700"
                            : bookingData.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {bookingData.status.replace("_", " ").toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Service
                  </label>
                  <p className="mt-1 font-medium">
                    {bookingData.service?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {bookingData.service?.category}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Scheduled At
                  </label>
                  <p className="mt-1">
                    {new Date(bookingData.scheduled_at).toLocaleString()}
                  </p>
                </div>
                {bookingData.completed_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Completed At
                    </label>
                    <p className="mt-1">
                      {new Date(bookingData.completed_at).toLocaleString()}
                    </p>
                  </div>
                )}
                {bookingData.cancelled_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Cancelled At
                    </label>
                    <p className="mt-1">
                      {new Date(bookingData.cancelled_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {bookingData.special_instructions && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Special Instructions
                  </label>
                  <p className="mt-1 text-sm">
                    {bookingData.special_instructions}
                  </p>
                </div>
              )}

              {bookingData.cancellation_reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cancellation Reason
                  </label>
                  <p className="mt-1 text-sm text-red-600">
                    {bookingData.cancellation_reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{bookingData.customer?.full_name}</p>
                <p className="text-sm text-gray-600">
                  {bookingData.customer?.phone}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingData.professional ? (
                <div className="space-y-2">
                  <p className="font-medium">
                    {bookingData.professional.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bookingData.professional.phone}
                  </p>
                  {bookingData.professional.rating_average && (
                    <p className="text-sm">
                      Rating:{" "}
                      {bookingData.professional.rating_average.toFixed(1)} ⭐
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No professional assigned
                </p>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          {bookingData.address && (
            <Card>
              <CardHeader>
                <CardTitle>Service Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{bookingData.address.label}</p>
                  <p className="text-sm">{bookingData.address.address_line1}</p>
                  {bookingData.address.address_line2 && (
                    <p className="text-sm">
                      {bookingData.address.address_line2}
                    </p>
                  )}
                  <p className="text-sm">
                    {bookingData.address.city}, {bookingData.address.state}{" "}
                    {bookingData.address.postal_code}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review */}
          {bookingData.review && (
            <Card>
              <CardHeader>
                <CardTitle>Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <span className="font-medium">
                      {bookingData.review.rating}/5
                    </span>
                  </div>
                  {bookingData.review.comment && (
                    <p className="text-sm">{bookingData.review.comment}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(
                      bookingData.review.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service Amount</span>
                <span className="font-medium">₹{bookingData.total_amount}</span>
              </div>
              {bookingData.service_fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Service Fee</span>
                  <span className="font-medium">
                    ₹{bookingData.service_fee}
                  </span>
                </div>
              )}
              {bookingData.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-sm">Discount</span>
                  <span className="font-medium">
                    -₹{bookingData.discount_amount}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold text-lg">
                  ₹{bookingData.final_amount}
                </span>
              </div>
              {bookingData.payment && (
                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Status</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        bookingData.payment.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : bookingData.payment.status === "refunded"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {bookingData.payment.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="capitalize">
                      {bookingData.payment.method.replace("_", " ")}
                    </span>
                  </div>
                  {bookingData.payment.transaction_id && (
                    <div className="text-xs text-gray-500 font-mono">
                      {bookingData.payment.transaction_id}
                    </div>
                  )}
                  {bookingData.payment.refund_amount > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm text-red-600">
                        <span>Refund Amount</span>
                        <span className="font-medium">
                          ₹{bookingData.payment.refund_amount}
                        </span>
                      </div>
                      {bookingData.payment.refund_reason && (
                        <p className="text-xs text-gray-500 mt-1">
                          {bookingData.payment.refund_reason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assign Professional */}
          {(!bookingData.professional || bookingData.status === "pending") && (
            <AssignProfessionalForm
              bookingId={bookingData.id}
              serviceId={bookingData.service?.id || ""}
              currentProfessionalId={bookingData.professional?.id}
            />
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {bookingData.status === "pending" && (
                <>
                  <form action={async (formData) => { await updateBookingStatus(formData); }} className="w-full">
                    <input
                      type="hidden"
                      name="bookingId"
                      value={bookingData.id}
                    />
                    <input type="hidden" name="status" value="confirmed" />
                    <Button type="submit" variant="default" className="w-full">
                      Confirm Booking
                    </Button>
                  </form>
                  <form action={async (formData) => { await cancelBooking(formData); }} className="w-full">
                    <input
                      type="hidden"
                      name="bookingId"
                      value={bookingData.id}
                    />
                    <Button type="submit" variant="outline" className="w-full">
                      Cancel Booking
                    </Button>
                  </form>
                </>
              )}
              {bookingData.status === "confirmed" && (
                <form action={async (formData) => { await updateBookingStatus(formData); }} className="w-full">
                  <input
                    type="hidden"
                    name="bookingId"
                    value={bookingData.id}
                  />
                  <input type="hidden" name="status" value="in_progress" />
                  <Button type="submit" variant="default" className="w-full">
                    Mark In Progress
                  </Button>
                </form>
              )}
              {bookingData.status === "in_progress" && (
                <form action={async (formData) => { await updateBookingStatus(formData); }} className="w-full">
                  <input
                    type="hidden"
                    name="bookingId"
                    value={bookingData.id}
                  />
                  <input type="hidden" name="status" value="completed" />
                  <Button type="submit" variant="default" className="w-full">
                    Mark Completed
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
