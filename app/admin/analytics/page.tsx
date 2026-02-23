"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, DollarSign, Users } from "lucide-react";

interface BookingData {
  date: string;
  count: number;
  totalAmount: number;
}

interface PaymentData {
  professionalId: string;
  professionalName: string;
  amount: number;
  count: number;
}

export default function AnalyticsPage() {
  const [bookingsData, setBookingsData] = useState<BookingData[]>([]);
  const [paymentsData, setPaymentsData] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsPeriod, setBookingsPeriod] = useState<"date" | "month" | "quarter" | "half" | "annual">("date");
  const [paymentsPeriod, setPaymentsPeriod] = useState<"monthly" | "quarterly" | "half" | "annual" | "consolidated">("monthly");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const supabase = createClient();

  useEffect(() => {
    fetchBookingsData();
  }, [bookingsPeriod, selectedDate, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchPaymentsData();
  }, [paymentsPeriod, selectedMonth, selectedYear]);

  const fetchBookingsData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("bookings")
        .select("id, created_at, final_amount, scheduled_at");

      // Apply date filters based on period
      if (bookingsPeriod === "date") {
        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      } else if (bookingsPeriod === "month") {
        const [year, month] = selectedMonth.split("-").map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      } else if (bookingsPeriod === "quarter") {
        const [year, month] = selectedMonth.split("-").map(Number);
        const quarter = Math.floor((month - 1) / 3);
        const startDate = new Date(year, quarter * 3, 1);
        const endDate = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      } else if (bookingsPeriod === "half") {
        const [year, month] = selectedMonth.split("-").map(Number);
        const half = month <= 6 ? 0 : 1;
        const startDate = new Date(year, half * 6, 1);
        const endDate = new Date(year, (half + 1) * 6, 0, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      } else if (bookingsPeriod === "annual") {
        const year = parseInt(selectedYear);
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }

      const { data: bookings, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching bookings:", error);
        return;
      }

      // Group bookings by period
      const grouped: { [key: string]: { count: number; totalAmount: number } } = {};

      bookings?.forEach((booking: any) => {
        let key = "";
        const date = new Date(booking.created_at);

        if (bookingsPeriod === "date") {
          key = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
        } else if (bookingsPeriod === "month") {
          key = date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
        } else if (bookingsPeriod === "quarter") {
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          const monthName = date.toLocaleDateString("en-IN", { month: "short" });
          key = `Q${quarter} - ${monthName}`;
        } else if (bookingsPeriod === "half") {
          const half = date.getMonth() < 6 ? "H1" : "H2";
          const monthName = date.toLocaleDateString("en-IN", { month: "short" });
          key = `${half} - ${monthName}`;
        } else if (bookingsPeriod === "annual") {
          const monthName = date.toLocaleDateString("en-IN", { month: "short" });
          key = monthName;
        }

        if (!grouped[key]) {
          grouped[key] = { count: 0, totalAmount: 0 };
        }
        grouped[key].count++;
        grouped[key].totalAmount += parseFloat(booking.final_amount || 0);
      });

      const result = Object.entries(grouped).map(([date, data]) => ({
        date,
        count: data.count,
        totalAmount: data.totalAmount,
      })).sort((a, b) => {
        // For date and month, try to parse as date, otherwise use string comparison
        if (bookingsPeriod === "date" || bookingsPeriod === "month") {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
            return dateA.getTime() - dateB.getTime();
          }
        }
        return a.date.localeCompare(b.date);
      });

      setBookingsData(result);
    } catch (error) {
      console.error("Error fetching bookings data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentsData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from("payments")
        .select(`
          id,
          amount,
          created_at,
          booking:bookings!inner(
            professional:profiles!bookings_professional_id_fkey(id, full_name)
          )
        `)
        .eq("status", "completed");

      // Apply date filters based on period
      if (paymentsPeriod === "monthly") {
        const [year, month] = selectedMonth.split("-").map(Number);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      } else if (paymentsPeriod === "quarterly") {
        const [year, month] = selectedMonth.split("-").map(Number);
        const quarter = Math.floor((month - 1) / 3);
        const startDate = new Date(year, quarter * 3, 1);
        const endDate = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      } else if (paymentsPeriod === "half") {
        const [year, month] = selectedMonth.split("-").map(Number);
        const half = month <= 6 ? 0 : 1;
        const startDate = new Date(year, half * 6, 1);
        const endDate = new Date(year, (half + 1) * 6, 0, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      } else if (paymentsPeriod === "annual") {
        const year = parseInt(selectedYear);
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
        query = query.gte("created_at", startDate.toISOString())
          .lte("created_at", endDate.toISOString());
      }
      // consolidated doesn't need date filter

      const { data: payments, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payments:", error);
        return;
      }

      // Group payments by professional
      const grouped: { [key: string]: { professionalId: string; professionalName: string; amount: number; count: number } } = {};

      payments?.forEach((payment: any) => {
        const professional = payment.booking?.professional;
        if (!professional) return;

        const profId = professional.id;
        const profName = professional.full_name || "Unknown";

        if (!grouped[profId]) {
          grouped[profId] = {
            professionalId: profId,
            professionalName: profName,
            amount: 0,
            count: 0,
          };
        }

        grouped[profId].amount += parseFloat(payment.amount || 0);
        grouped[profId].count++;
      });

      const result = Object.values(grouped)
        .sort((a, b) => b.amount - a.amount);

      setPaymentsData(result);
    } catch (error) {
      console.error("Error fetching payments data:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalBookings = bookingsData.reduce((sum, item) => sum + item.count, 0);
  const totalBookingsAmount = bookingsData.reduce((sum, item) => sum + item.totalAmount, 0);
  const totalPayments = paymentsData.reduce((sum, item) => sum + item.amount, 0);
  const totalPaymentCount = paymentsData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">Analytics & Reports</h1>
        <p className="text-blue-50 mt-1">Comprehensive booking and payment analytics</p>
      </div>

      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings">📅 Bookings Analytics</TabsTrigger>
          <TabsTrigger value="payments">💰 Payments Analytics</TabsTrigger>
        </TabsList>

        {/* Bookings Analytics Tab */}
        <TabsContent value="bookings" className="space-y-6 mt-6">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
              <CardTitle className="text-xl font-bold">Bookings Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Period Selection */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Type
                  </label>
                  <Select
                    value={bookingsPeriod}
                    onValueChange={(value: any) => setBookingsPeriod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date-wise</SelectItem>
                      <SelectItem value="month">Month-wise</SelectItem>
                      <SelectItem value="quarter">Quarter-wise</SelectItem>
                      <SelectItem value="half">Half-yearly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {bookingsPeriod === "date" && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>
                )}

                {(bookingsPeriod === "month" || bookingsPeriod === "quarter" || bookingsPeriod === "half") && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Month
                    </label>
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </div>
                )}

                {bookingsPeriod === "annual" && (
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Year
                    </label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      min="2020"
                      max={new Date().getFullYear()}
                    />
                  </div>
                )}

                <Button onClick={fetchBookingsData} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-blue-50 border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Bookings</p>
                        <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
                      </div>
                      <Calendar className="h-12 w-12 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ₹{totalBookingsAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <TrendingUp className="h-12 w-12 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bookings Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="text-left p-3 text-gray-700 font-semibold">
                        {bookingsPeriod === "date" ? "Date" :
                         bookingsPeriod === "month" ? "Date" :
                         bookingsPeriod === "quarter" ? "Quarter" :
                         bookingsPeriod === "half" ? "Half Year" : "Year"}
                      </th>
                      <th className="text-left p-3 text-gray-700 font-semibold">Bookings Count</th>
                      <th className="text-left p-3 text-gray-700 font-semibold">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : bookingsData.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-4 text-center text-gray-500">
                          No bookings found for the selected period
                        </td>
                      </tr>
                    ) : (
                      bookingsData.map((item, index) => (
                        <tr
                          key={index}
                          className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                        >
                          <td className="p-3 font-medium">{item.date}</td>
                          <td className="p-3">{item.count}</td>
                          <td className="p-3 font-semibold">
                            ₹{item.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Analytics Tab */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
              <CardTitle className="text-xl font-bold">Payments Analytics (Professional-wise)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Period Selection */}
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Type
                  </label>
                  <Select
                    value={paymentsPeriod}
                    onValueChange={(value: any) => setPaymentsPeriod(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half">Half-yearly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="consolidated">Consolidated (All Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentsPeriod !== "consolidated" && (
                  <>
                    {(paymentsPeriod === "monthly" || paymentsPeriod === "quarterly" || paymentsPeriod === "half") && (
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Month
                        </label>
                        <Input
                          type="month"
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                      </div>
                    )}

                    {paymentsPeriod === "annual" && (
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Year
                        </label>
                        <Input
                          type="number"
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          min="2020"
                          max={new Date().getFullYear()}
                        />
                      </div>
                    )}
                  </>
                )}

                <Button onClick={fetchPaymentsData} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-amber-50 border border-amber-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Payments</p>
                        <p className="text-3xl font-bold text-gray-900">
                          ₹{totalPayments.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <DollarSign className="h-12 w-12 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50 border border-purple-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Transactions</p>
                        <p className="text-3xl font-bold text-gray-900">{totalPaymentCount}</p>
                      </div>
                      <Users className="h-12 w-12 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payments Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="text-left p-3 text-gray-700 font-semibold">Professional</th>
                      <th className="text-left p-3 text-gray-700 font-semibold">Total Amount</th>
                      <th className="text-left p-3 text-gray-700 font-semibold">Transaction Count</th>
                      <th className="text-left p-3 text-gray-700 font-semibold">Average Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          Loading...
                        </td>
                      </tr>
                    ) : paymentsData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          No payments found for the selected period
                        </td>
                      </tr>
                    ) : (
                      paymentsData.map((item, index) => (
                        <tr
                          key={item.professionalId}
                          className={`border-b ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}
                        >
                          <td className="p-3 font-medium">{item.professionalName}</td>
                          <td className="p-3 font-semibold">
                            ₹{item.amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>
                          <td className="p-3">{item.count}</td>
                          <td className="p-3">
                            ₹{(item.amount / item.count).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
