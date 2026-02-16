"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { getRoleBasedRedirect } from "@/lib/auth/utils";
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
import type { Booking, Profile, Service, Address } from "@/lib/types/database";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Loader2,
  Package,
  Filter,
} from "lucide-react";


interface BookingWithDetails extends Booking {
  service: Service;
  customer: Profile;
  address: Address;
}

export default function ProfessionalBookingsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "in_progress" | "completed" | "cancelled"
  >("all");
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      // Check if user has professional role
      if (role === "admin" || role === "customer") {
        router.push(getRoleBasedRedirect(role));
      } else {
        router.push("/login?error=unauthorized");
      }
      fetchBookings();
    }
  }, [user, role, authLoading, router, filter]);

  const fetchBookings = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      let query = supabase
        .from("bookings")
        .select(
          `
          *,
          service:services(*),
          customer:profiles!bookings_customer_id_fkey(*),
          address:addresses(*)
        `
        )
        .eq("professional_id", user.id)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const bookingsWithDetails = data.map((booking: any) => ({
          ...booking,
          service: booking.service,
          customer: booking.customer,
          address: booking.address,
        }));
        setBookings(bookingsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: "confirmed" | "cancelled" | "in_progress" | "completed"
  ) => {
    if (!user) return;

    setUpdating(bookingId);
    try {
      const supabase = createClient();
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "completed") {
        updateData.completed_at = new Date().toISOString();
      } else if (status === "cancelled") {
        updateData.cancelled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", bookingId)
        .eq("professional_id", user.id);

      if (error) throw error;

      await fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to update booking status. Please try again.");
    } finally {
      setUpdating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-[#FEF3C7] text-[#92400E]";
      case "confirmed":
        return "bg-[#DBEAFE] text-[#1E3A8A]";
      case "in_progress":
        return "bg-[#E9D5FF] text-[#6B21A8]";
      case "completed":
        return "bg-[#D1FAE5] text-[#065F46]";
      case "cancelled":
        return "bg-[#FEE2E2] text-[#991B1B]";
      default:
        return "bg-[#F1F5F9] text-[#475569]";
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || role !== "professional") {
    return null; // Will redirect via useEffect
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    return booking.status === filter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-600">View and manage all your job bookings.</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {(
          [
            "all",
            "pending",
            "confirmed",
            "in_progress",
            "completed",
            "cancelled",
          ] as const
        ).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? "default" : "outline"}
            onClick={() => setFilter(filterOption)}
            className="capitalize"
          >
            <Filter className="h-4 w-4 mr-2" />
            {filterOption.replace("_", " ")}
          </Button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>Booking #{booking.id.slice(0, 8)}</CardTitle>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription>
                      {booking.service?.name || "Service"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-start gap-2">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {booking.customer?.full_name || "Customer"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.customer?.phone || "No phone"}
                      </p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(booking.scheduled_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(booking.scheduled_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  {booking.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          {booking.address.label}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.address.address_line1},{" "}
                          {booking.address.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Amount */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-lg font-bold">
                        ${Number(booking.final_amount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {booking.special_instructions && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">
                        Special Instructions:
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.special_instructions}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {booking.status === "pending" && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() =>
                          updateBookingStatus(booking.id, "confirmed")
                        }
                        disabled={updating === booking.id}
                        className="flex-1"
                      >
                        {updating === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Accept
                      </Button>
                      <Button
                        onClick={() =>
                          updateBookingStatus(booking.id, "cancelled")
                        }
                        disabled={updating === booking.id}
                        variant="destructive"
                        className="flex-1"
                      >
                        {updating === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-2" />
                        )}
                        Reject
                      </Button>
                    </div>
                  )}

                  {booking.status === "confirmed" && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() =>
                          updateBookingStatus(booking.id, "in_progress")
                        }
                        disabled={updating === booking.id}
                        className="flex-1"
                      >
                        {updating === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Clock className="h-4 w-4 mr-2" />
                        )}
                        Start Job
                      </Button>
                    </div>
                  )}

                  {booking.status === "in_progress" && (
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() =>
                          updateBookingStatus(booking.id, "completed")
                        }
                        disabled={updating === booking.id}
                        className="flex-1"
                      >
                        {updating === booking.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark as Completed
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
