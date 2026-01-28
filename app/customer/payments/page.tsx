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
import type { Payment, Booking, Service } from "@/lib/types/database";
import {
  DollarSign,
  Calendar,
  CreditCard,
  Search,
  Download,
  Filter,
} from "lucide-react";

interface PaymentWithDetails extends Payment {
  booking: Booking & {
    service: Service;
  };
}

export default function PaymentHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<
    PaymentWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  useEffect(() => {
    if (!authLoading && user) {
      fetchPayments();
    }
  }, [user, authLoading]);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, statusFilter, methodFilter, payments]);

  const fetchPayments = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("payments")
        .select(
          `
          *,
          booking:bookings(
            *,
            service:services(*)
          )
        `
        )
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const paymentsWithDetails = data.map((payment: any) => ({
          ...payment,
          booking: payment.booking,
        }));
        setPayments(paymentsWithDetails);
        setFilteredPayments(paymentsWithDetails);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    if (methodFilter !== "all") {
      filtered = filtered.filter((p) => p.method === methodFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.transaction_id?.toLowerCase().includes(query) ||
          p.booking?.service?.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "failed":
      case "cancelled":
        return "destructive";
      case "processing":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTotalStats = () => {
    const completed = payments.filter((p) => p.status === "completed");
    const totalSpent = completed.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalRefunded = payments
      .filter((p) => p.status === "refunded")
      .reduce((sum, p) => sum + Number(p.refund_amount), 0);

    return {
      totalTransactions: payments.length,
      completedTransactions: completed.length,
      totalSpent,
      totalRefunded,
    };
  };

  const stats = getTotalStats();

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment History</h1>
        <p className="text-gray-600">View all your payment transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.completedTransactions}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalSpent.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Refunded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.totalRefunded.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by transaction ID or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              <option value="all">All Methods</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="upi">UPI</option>
              <option value="wallet">Wallet</option>
              <option value="net_banking">Net Banking</option>
              <option value="cash">Cash</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No payments found</h3>
            <p className="text-gray-600 mb-4">
              {payments.length === 0
                ? "You haven't made any payments yet."
                : "No payments match your filters."}
            </p>
            {payments.length === 0 && (
              <Link href="/customer/book-service">
                <Button>Book a Service</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card
              key={payment.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {payment.booking?.service?.name || "Service"}
                      </h3>
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          <strong>Date:</strong>{" "}
                          {new Date(payment.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>
                          <strong>Method:</strong>{" "}
                          {payment.method.replace("_", " ").toUpperCase()}
                        </span>
                      </div>
                      {payment.transaction_id && (
                        <div>
                          <span className="text-gray-500">
                            Transaction ID:{" "}
                          </span>
                          <span className="font-mono text-xs">
                            {payment.transaction_id}
                          </span>
                        </div>
                      )}
                      {payment.status === "refunded" &&
                        payment.refund_amount > 0 && (
                          <div>
                            <span className="text-green-600">
                              <strong>Refunded:</strong> ₹
                              {Number(payment.refund_amount).toFixed(2)}
                            </span>
                            {payment.refund_reason && (
                              <p className="text-xs text-gray-500 mt-1">
                                Reason: {payment.refund_reason}
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold mb-1">
                      ₹{Number(payment.amount).toFixed(2)}
                    </div>
                    {payment.booking && (
                      <Link href={`/customer/bookings/${payment.booking.id}`}>
                        <Button variant="outline" size="sm" className="mt-2">
                          View Booking
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
