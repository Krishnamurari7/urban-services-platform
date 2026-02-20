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
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  User,
  ArrowRight,
  TrendingUp
} from "lucide-react";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-700 border-red-200";
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "cancelled":
      case "refunded":
        return <XCircle className="h-3.5 w-3.5" />;
      case "in_progress":
        return <Loader2 className="h-3.5 w-3.5 animate-spin" />;
      default:
        return <Clock className="h-3.5 w-3.5" />;
    }
  };

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => 
      b.status === "pending" || b.status === "confirmed" || b.status === "in_progress"
    ).length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  if (authLoading || loading) {
    return (
      <div className="w-full">
        <div className="bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="animate-pulse space-y-6">
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-purple-50/30 to-teal-50/30 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 rounded-full text-sm font-medium text-purple-700 mb-4">
              <Package className="h-4 w-4" />
              <span>Your Bookings</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-3">
              <span className="text-gray-900">Manage Your</span>{" "}
              <span className="text-purple-600">Bookings</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
              Track and manage all your service bookings in one place
            </p>
          </div>

          {/* Stats Cards */}
          {bookings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Bookings</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-3">
                      <Package className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Upcoming</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.upcoming}</p>
                    </div>
                    <div className="bg-blue-100 rounded-lg p-3">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="bg-green-100 rounded-lg p-3">
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Search by service, professional, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none bg-white min-w-[200px] h-12"
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
        </div>
      </section>

      {/* Bookings List */}
      <section className="py-12 md:py-16 bg-gray-50/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {filteredBookings.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 md:p-16 text-center">
                <div className="bg-gradient-to-br from-purple-100 to-teal-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Package className="h-12 w-12 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {bookings.length === 0
                    ? "You haven't made any bookings yet. Start by booking your first service!"
                    : "No bookings match your current filters. Try adjusting your search criteria."}
                </p>
                {bookings.length === 0 && (
                  <Link href="/customer/services">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-6 text-base font-semibold rounded-lg">
                      Browse Services
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
                {(searchQuery || statusFilter !== "all") && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <Link key={booking.id} href={`/customer/bookings/${booking.id}`}>
                  <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Left Section - Main Info */}
                        <div className="flex-1 min-w-0 space-y-4">
                          {/* Header with Service Name and Status */}
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1">
                              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                                {booking.service?.name || "Service"}
                              </h3>
                              <Badge 
                                className={`${getStatusColor(booking.status)} border flex items-center gap-1.5 w-fit px-3 py-1 font-semibold`}
                              >
                                {getStatusIcon(booking.status)}
                                <span className="capitalize">{booking.status.replace("_", " ")}</span>
                              </Badge>
                            </div>
                            <div className="text-left sm:text-right">
                              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                                ₹{Number(booking.final_amount).toFixed(2)}
                              </div>
                              <p className="text-xs text-gray-500 font-mono">
                                ID: {booking.id.slice(0, 8).toUpperCase()}
                              </p>
                            </div>
                          </div>

                          {/* Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                            <div className="flex items-start gap-3">
                              <div className="bg-purple-100 rounded-lg p-2 mt-0.5">
                                <User className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Professional
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {booking.professional?.full_name || "N/A"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="bg-blue-100 rounded-lg p-2 mt-0.5">
                                <Calendar className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Scheduled
                                </p>
                                <p className="text-sm font-medium text-gray-900">
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
                                    : "Not scheduled"}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <div className="bg-teal-100 rounded-lg p-2 mt-0.5">
                                <MapPin className="h-4 w-4 text-teal-600" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                  Location
                                </p>
                                <p className="text-sm font-medium text-gray-900">
                                  {booking.address?.city || "N/A"}
                                  {booking.address?.state && `, ${booking.address.state}`}
                                </p>
                              </div>
                            </div>

                            {booking.completed_at && (
                              <div className="flex items-start gap-3">
                                <div className="bg-green-100 rounded-lg p-2 mt-0.5">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                    Completed
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {new Date(booking.completed_at).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Section - Action Arrow */}
                        <div className="flex items-center justify-end lg:pl-6">
                          <div className="bg-purple-100 group-hover:bg-purple-600 rounded-full p-3 transition-colors">
                            <ArrowRight className="h-5 w-5 text-purple-600 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
