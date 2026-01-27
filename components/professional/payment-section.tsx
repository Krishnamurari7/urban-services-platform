"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Booking, Payment, ProfessionalBankAccount } from "@/lib/types/database";
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  Building2,
  Calendar,
  Loader2
} from "lucide-react";

interface PaymentWithBooking extends Payment {
  booking: Booking;
}

export function PaymentSection() {
  const { user } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<ProfessionalBankAccount[]>([]);
  const [payments, setPayments] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddBankForm, setShowAddBankForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bankForm, setBankForm] = useState({
    account_holder_name: "",
    account_number: "",
    ifsc_code: "",
    bank_name: "",
    branch_name: "",
    account_type: "savings" as "savings" | "current",
    is_primary: false,
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Fetch bank accounts
      const { data: accounts, error: accountsError } = await supabase
        .from("professional_bank_accounts")
        .select("*")
        .eq("professional_id", user.id)
        .order("is_primary", { ascending: false })
        .order("created_at", { ascending: false });

      if (accountsError) throw accountsError;
      setBankAccounts(accounts || []);

      // Fetch payments for completed bookings
      const { data: bookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("professional_id", user.id)
        .eq("status", "completed");

      if (bookings && bookings.length > 0) {
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("payments")
          .select(`
            *,
            booking:bookings(*)
          `)
          .in("booking_id", bookings.map((b) => b.id))
          .eq("status", "completed")
          .order("created_at", { ascending: false })
          .limit(20);

        if (paymentsError) throw paymentsError;
        setPayments(
          (paymentsData || []).map((p: any) => ({
            ...p,
            booking: p.booking,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankAccount = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const supabase = createClient();

      if (editingAccount) {
        // Update existing account
        const { error } = await supabase
          .from("professional_bank_accounts")
          .update({
            ...bankForm,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingAccount)
          .eq("professional_id", user.id);

        if (error) throw error;
      } else {
        // Create new account
        const { error } = await supabase.from("professional_bank_accounts").insert({
          professional_id: user.id,
          ...bankForm,
        });

        if (error) throw error;
      }

      // Reset form
      setBankForm({
        account_holder_name: "",
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        branch_name: "",
        account_type: "savings",
        is_primary: false,
      });
      setShowAddBankForm(false);
      setEditingAccount(null);
      await fetchData();
    } catch (error) {
      console.error("Error saving bank account:", error);
      alert("Failed to save bank account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditBankAccount = (account: ProfessionalBankAccount) => {
    setEditingAccount(account.id);
    setBankForm({
      account_holder_name: account.account_holder_name,
      account_number: account.account_number,
      ifsc_code: account.ifsc_code,
      bank_name: account.bank_name,
      branch_name: account.branch_name || "",
      account_type: account.account_type,
      is_primary: account.is_primary,
    });
    setShowAddBankForm(true);
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this bank account?")) return;
    if (!user) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("professional_bank_accounts")
        .delete()
        .eq("id", accountId)
        .eq("professional_id", user.id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error("Error deleting bank account:", error);
      alert("Failed to delete bank account. Please try again.");
    }
  };

  const maskAccountNumber = (accountNumber: string) => {
    if (accountNumber.length <= 4) return accountNumber;
    return "****" + accountNumber.slice(-4);
  };

  // Calculate total earnings (80% of completed bookings)
  const totalEarnings = payments.reduce((sum, payment) => {
    const booking = payment.booking as Booking;
    return sum + Number(booking.final_amount) * 0.8;
  }, 0);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Summary
          </CardTitle>
          <CardDescription>Total earnings from completed jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalEarnings.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mt-1">
            Based on {payments.length} completed payments
          </p>
        </CardContent>
      </Card>

      {/* Bank Accounts Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Bank Accounts
              </CardTitle>
              <CardDescription>Manage your bank accounts for payments</CardDescription>
            </div>
            {!showAddBankForm && (
              <Button onClick={() => setShowAddBankForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Bank Account
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {showAddBankForm && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingAccount ? "Edit Bank Account" : "Add New Bank Account"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Account Holder Name</label>
                  <Input
                    value={bankForm.account_holder_name}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, account_holder_name: e.target.value })
                    }
                    placeholder="Enter account holder name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Account Number</label>
                  <Input
                    value={bankForm.account_number}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, account_number: e.target.value })
                    }
                    placeholder="Enter account number"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">IFSC Code</label>
                    <Input
                      value={bankForm.ifsc_code}
                      onChange={(e) =>
                        setBankForm({ ...bankForm, ifsc_code: e.target.value.toUpperCase() })
                      }
                      placeholder="IFSC Code"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Account Type</label>
                    <select
                      value={bankForm.account_type}
                      onChange={(e) =>
                        setBankForm({
                          ...bankForm,
                          account_type: e.target.value as "savings" | "current",
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="savings">Savings</option>
                      <option value="current">Current</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bank Name</label>
                  <Input
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                    placeholder="Enter bank name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Branch Name (Optional)</label>
                  <Input
                    value={bankForm.branch_name}
                    onChange={(e) => setBankForm({ ...bankForm, branch_name: e.target.value })}
                    placeholder="Enter branch name"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={bankForm.is_primary}
                    onChange={(e) =>
                      setBankForm({ ...bankForm, is_primary: e.target.checked })
                    }
                    className="rounded"
                  />
                  <label htmlFor="is_primary" className="text-sm">
                    Set as primary account
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveBankAccount} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {editingAccount ? "Update" : "Add"} Account
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddBankForm(false);
                      setEditingAccount(null);
                      setBankForm({
                        account_holder_name: "",
                        account_number: "",
                        ifsc_code: "",
                        bank_name: "",
                        branch_name: "",
                        account_type: "savings",
                        is_primary: false,
                      });
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {bankAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No bank accounts added yet</p>
              <Button onClick={() => setShowAddBankForm(true)} className="mt-4">
                Add Your First Bank Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <Card key={account.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{account.bank_name}</h3>
                          {account.is_primary && (
                            <Badge variant="default">Primary</Badge>
                          )}
                          {account.is_verified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending Verification</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          <strong>Account Holder:</strong> {account.account_holder_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Account Number:</strong> {maskAccountNumber(account.account_number)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>IFSC:</strong> {account.ifsc_code}
                        </p>
                        {account.branch_name && (
                          <p className="text-sm text-gray-600">
                            <strong>Branch:</strong> {account.branch_name}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <strong>Type:</strong> {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBankAccount(account)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!account.is_primary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBankAccount(account.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
          <CardDescription>Recent payments from completed jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No payments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const booking = payment.booking as Booking;
                const professionalEarning = Number(booking.final_amount) * 0.8;
                return (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="font-medium">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                        <Badge className="bg-green-100 text-green-800">
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Booking #{booking.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Payment Method: {payment.method.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${professionalEarning.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">
                        (80% of ${Number(booking.final_amount).toFixed(2)})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
