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
import type { Profile } from "@/lib/types/database";
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Award,
  Shield,
  AlertCircle,
} from "lucide-react";

interface VerificationStatus {
  profile: boolean;
  documents: boolean;
  bankAccount: boolean;
  overall: "verified" | "pending" | "rejected";
}

export function VerificationSection() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>({
      profile: false,
      documents: false,
      bankAccount: false,
      overall: "pending",
    });
  const [loading, setLoading] = useState(true);
  const [documentCount, setDocumentCount] = useState(0);
  const [approvedDocuments, setApprovedDocuments] = useState(0);
  const [bankAccountCount, setBankAccountCount] = useState(0);
  const [verifiedBankAccount, setVerifiedBankAccount] = useState(false);

  useEffect(() => {
    if (user) {
      fetchVerificationData();
    }
  }, [user]);

  const fetchVerificationData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch documents
      const { data: documents } = await supabase
        .from("professional_documents")
        .select("status")
        .eq("professional_id", user.id);

      const totalDocs = documents?.length || 0;
      const approvedDocs =
        documents?.filter((d) => d.status === "approved").length || 0;
      setDocumentCount(totalDocs);
      setApprovedDocuments(approvedDocs);

      // Fetch bank accounts
      const { data: bankAccounts } = await supabase
        .from("professional_bank_accounts")
        .select("is_verified")
        .eq("professional_id", user.id);

      const totalAccounts = bankAccounts?.length || 0;
      const hasVerifiedAccount =
        bankAccounts?.some((a) => a.is_verified) || false;
      setBankAccountCount(totalAccounts);
      setVerifiedBankAccount(hasVerifiedAccount);

      // Calculate verification status
      const profileComplete =
        profileData?.full_name &&
        profileData?.phone &&
        profileData?.bio &&
        profileData?.experience_years &&
        profileData?.hourly_rate;

      const status: VerificationStatus = {
        profile: !!profileComplete,
        documents: approvedDocs > 0,
        bankAccount: hasVerifiedAccount,
        overall: profileData?.is_verified ? "verified" : "pending",
      };

      setVerificationStatus(status);
    } catch (error) {
      console.error("Error fetching verification data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    if (status) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Verification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Status
          </CardTitle>
          <CardDescription>
            Your professional verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2">
                {verificationStatus.overall === "verified"
                  ? "Verified Professional"
                  : "Verification Pending"}
              </h3>
              <p className="text-gray-600">
                {verificationStatus.overall === "verified"
                  ? "Your profile is verified and active"
                  : "Complete the requirements below to get verified"}
              </p>
            </div>
            {verificationStatus.overall === "verified" ? (
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                <CheckCircle className="h-5 w-5 mr-2" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Clock className="h-5 w-5 mr-2" />
                Pending
              </Badge>
            )}
          </div>

          {/* Verification Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(verificationStatus.profile)}
                <div>
                  <p className="font-medium">Profile Information</p>
                  <p className="text-sm text-gray-600">
                    Complete your profile with all required details
                  </p>
                </div>
              </div>
              {getStatusBadge(verificationStatus.profile)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(verificationStatus.documents)}
                <div>
                  <p className="font-medium">Document Verification</p>
                  <p className="text-sm text-gray-600">
                    {approvedDocuments > 0
                      ? `${approvedDocuments} document(s) approved`
                      : documentCount > 0
                        ? `${documentCount} document(s) pending approval`
                        : "Upload verification documents"}
                  </p>
                </div>
              </div>
              {getStatusBadge(verificationStatus.documents)}
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(verificationStatus.bankAccount)}
                <div>
                  <p className="font-medium">Bank Account Verification</p>
                  <p className="text-sm text-gray-600">
                    {verifiedBankAccount
                      ? "Bank account verified"
                      : bankAccountCount > 0
                        ? "Bank account pending verification"
                        : "Add and verify your bank account"}
                  </p>
                </div>
              </div>
              {getStatusBadge(verificationStatus.bankAccount)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Completeness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Completeness
          </CardTitle>
          <CardDescription>
            Required information for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Full Name</span>
              {profile?.full_name ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Phone Number</span>
              {profile?.phone ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Bio</span>
              {profile?.bio ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Experience Years</span>
              {profile?.experience_years ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Hourly Rate</span>
              {profile?.hourly_rate ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Skills</span>
              {profile?.skills && profile.skills.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => (window.location.href = "/professional/profile")}
            >
              <User className="h-4 w-4 mr-2" />
              Complete Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Complete verification requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => {
                // Navigate to documents tab
                window.location.href = "/professional/dashboard?tab=documents";
              }}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="font-medium">Upload Documents</span>
              <span className="text-xs text-gray-500 mt-1">
                {documentCount > 0
                  ? `${documentCount} uploaded`
                  : "No documents"}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex-col"
              onClick={() => {
                // Navigate to payment tab
                window.location.href = "/professional/dashboard?tab=payments";
              }}
            >
              <Shield className="h-6 w-6 mb-2" />
              <span className="font-medium">Add Bank Account</span>
              <span className="text-xs text-gray-500 mt-1">
                {bankAccountCount > 0
                  ? `${bankAccountCount} account(s)`
                  : "No accounts"}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
