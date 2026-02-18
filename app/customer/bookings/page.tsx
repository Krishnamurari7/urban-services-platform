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
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Booking, Service, Profile, Address } from "@/lib/types/database";
import { Calendar, Clock, MapPin, Package, Search, Filter } from "lucide-react";

interface BookingWithDetails extends Booking {
  service: Service;
  professional: Profile;
  address: Address;
}

export default function CustomerBookingsPage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<
    BookingWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Read status filter from URL params on mount
  useEffect(() => {
    const statusParam = searchParams.get("status");
    if (statusParam) {
      // Map URL param values to actual status values
      const statusMap: Record<string, string> = {
        upcoming: "confirmed",
        pending: "pending",
        completed: "completed",
        cancelled: "cancelled",
        in_progress: "in_progress",
      };
      setStatusFilter(statusMap[statusParam] || statusParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchBookings();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterBookings();
  }, [searchQuery, statusFilter, bookings]);

  const fetchBookings = async () => {
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
          address:addresses(*)
        `
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const bookingsWithDetails = data.map((booking: any) => ({
          ...booking,
          service: booking.service,
          professional: booking.professional,
          address: booking.address,
        }));
        setBookings(bookingsWithDetails);
        setFilteredBookings(bookingsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (statusFilter !== "all") {
      // Handle "upcoming" filter which includes multiple statuses
      if (statusFilter === "upcoming") {
        filtered = filtered.filter(
          (b) =>
            b.status === "pending" ||
            b.status === "confirmed" ||
            b.status === "in_progress"
        );
      } else {
        filtered = filtered.filter((b) => b.status === statusFilter);
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.service?.name?.toLowerCase().includes(query) ||
          b.professional?.full_name?.toLowerCase().includes(query) ||
          b.address?.city?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
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
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-sm sm:text-base text-gray-600">View and manage your service bookings</p>
      </div>

      {/* Filters */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-auto"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 border rounded-md text-sm sm:text-base min-h-[44px] flex-1 sm:flex-none"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">
              {bookings.length === 0
                ? "You haven't made any bookings yet."
                : "No bookings match your filters."}
            </p>
            {bookings.length === 0 && (
              <Link href="/customer/book-service">
                <Button>Book Your First Service</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Link key={booking.id} href={`/customer/bookings/${booking.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-semibold truncate">
                          {booking.service?.name || "Service"}
                        </h3>
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="self-start sm:self-auto">
                          {booking.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>
                            <strong>Professional:</strong>{" "}
                            {booking.professional?.full_name || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            <strong>Scheduled:</strong>{" "}
                            {booking.scheduled_at
                              ? new Date(booking.scheduled_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    weekday: "short",
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            <strong>Location:</strong>{" "}
                            {booking.address?.city || "N/A"}
                            {booking.address?.state && `, ${booking.address.state}`}
                          </span>
                        </div>
                        {booking.completed_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              <strong>Completed:</strong>{" "}
                              {new Date(
                                booking.completed_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold mb-1">
                        ₹{Number(booking.final_amount).toFixed(2)}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Booking ID: {booking.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
