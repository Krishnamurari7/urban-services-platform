"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type {
  Booking,
  Service,
  Profile,
  Address,
  Payment,
} from "@/lib/types/database";
import { cancelBooking } from "./actions";
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  User,
  DollarSign,
  ArrowLeft,
  Phone,
  Mail,
  FileText,
} from "lucide-react";

interface BookingWithDetails extends Booking {
  service: Service;
  professional: Profile;
  address: Address;
  payment?: Payment;
}

export default function BookingDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!authLoading && user && bookingId) {
      fetchBookingDetails();
    }
  }, [user, authLoading, bookingId]);

  const fetchBookingDetails = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("bookings")
        .select(
          `
          *,
          service:services(*),
          professional:profiles!bookings_professional_id_fkey(*),
          address:addresses(*),
          payment:payments(*)
        `
        )
        .eq("id", bookingId)
        .eq("customer_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setBooking({
          ...data,
          service: data.service,
          professional: data.professional,
          address: data.address,
          payment: data.payment?.[0] || undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching booking details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!booking || !user) return;

    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason || reason.trim() === "") {
      return;
    }

    setCancelling(true);
    try {
      const formData = new FormData();
      formData.append("bookingId", booking.id);
      formData.append("reason", reason);

      const result = await cancelBooking(formData);

      if (result.error) {
        alert(`Failed to cancel booking: ${result.error}`);
        return;
      }

      // Refresh the page data
      router.refresh();
      await fetchBookingDetails();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert(
        `Failed to cancel booking: ${error instanceof Error ? error.message : "Please try again."}`
      );
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "cancelled":
      case "refunded":
        return "destructive";
      case "confirmed":
      case "in_progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Booking not found</h2>
            <p className="text-gray-600 mb-4">
              The booking you're looking for doesn't exist or you don't have
              access to it.
            </p>
            <Link href="/customer/bookings">
              <Button>Back to Bookings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/customer/bookings">
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <Badge
            variant={getStatusBadgeVariant(booking.status)}
            className="text-sm"
          >
            {booking.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
        <p className="text-gray-600">Booking ID: {booking.id.slice(0, 8)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {booking.service.name}
                </h3>
                <p className="text-gray-600">{booking.service.description}</p>
                <Badge className="mt-2">{booking.service.category}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold">
                    {booking.service.duration_minutes} minutes
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Base Price</p>
                  <p className="font-semibold">
                    ₹{Number(booking.service.base_price).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Professional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {booking.professional.full_name}
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="font-semibold">
                      {Number(booking.professional.rating_average).toFixed(1)}{" "}
                      ⭐ ({booking.professional.total_reviews} reviews)
                    </p>
                  </div>
                  {booking.professional.experience_years && (
                    <div>
                      <p className="text-sm text-gray-500">Experience</p>
                      <p className="font-semibold">
                        {booking.professional.experience_years} years
                      </p>
                    </div>
                  )}
                </div>
                {booking.professional.phone && (
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      {booking.professional.phone}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Schedule & Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule & Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">
                      Scheduled Date & Time
                    </p>
                    <p className="font-semibold">
                      {new Date(booking.scheduled_at).toLocaleString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {booking.completed_at && (
                <div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Completed At</p>
                      <p className="font-semibold">
                        {new Date(booking.completed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Service Address</p>
                    <p className="font-semibold">{booking.address.label}</p>
                    <p className="text-gray-600">
                      {booking.address.address_line1}
                      {booking.address.address_line2 &&
                        `, ${booking.address.address_line2}`}
                    </p>
                    <p className="text-gray-600">
                      {booking.address.city}, {booking.address.state}{" "}
                      {booking.address.postal_code}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Special Instructions */}
          {booking.special_instructions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Special Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{booking.special_instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancellation Reason */}
          {booking.cancellation_reason && (
            <Card>
              <CardHeader>
                <CardTitle>Cancellation Reason</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{booking.cancellation_reason}</p>
                {booking.cancelled_at && (
                  <p className="text-sm text-gray-500 mt-2">
                    Cancelled on:{" "}
                    {new Date(booking.cancelled_at).toLocaleString()}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Amount</span>
                <span className="font-semibold">
                  ₹{Number(booking.total_amount).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span className="font-semibold">
                  ₹{Number(booking.service_fee).toFixed(2)}
                </span>
              </div>
              {Number(booking.discount_amount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{Number(booking.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg">
                  ₹{Number(booking.final_amount).toFixed(2)}
                </span>
              </div>
              {booking.payment && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                  <Badge
                    variant={
                      booking.payment.status === "completed"
                        ? "default"
                        : booking.payment.status === "failed"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {booking.payment.status}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2">
                    Method: {booking.payment.method.replace("_", " ")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(booking.status === "pending" ||
                booking.status === "confirmed") && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                >
                  {cancelling ? "Cancelling..." : "Cancel Booking"}
                </Button>
              )}
              {booking.status === "completed" && (
                <Link
                  href={`/customer/bookings/${booking.id}/review`}
                  className="block"
                >
                  <Button className="w-full">Leave a Review</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
