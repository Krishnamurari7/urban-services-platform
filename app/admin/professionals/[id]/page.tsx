import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { approveProfessional, rejectProfessional } from "../actions";

async function getProfessional(id: string) {
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

  const { data: professional } = await supabase
    .from("profiles")
    .select(
      `
      *,
      documents:professional_documents(
        id,
        document_type,
        document_name,
        file_url,
        file_size,
        mime_type,
        status,
        rejection_reason,
        verified_by,
        verified_at,
        created_at
      ),
      bank_accounts:professional_bank_accounts(
        id,
        account_holder_name,
        bank_name,
        account_type,
        is_primary,
        is_verified
      ),
      services:professional_services(
        id,
        price,
        duration_minutes,
        is_available,
        service:services(
          id,
          name,
          category
        )
      )
    `
    )
    .eq("id", id)
    .eq("role", "professional")
    .single();

  return professional;
}

export default async function ProfessionalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const professional = await getProfessional(id);

  if (!professional) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Professional not found</p>
            <Link href="/admin/professionals">
              <Button variant="outline" className="mt-4">
                Back to Professionals
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profData = professional as any;
  const pendingDocs =
    profData.documents?.filter((d: any) => d.status === "pending") || [];
  const approvedDocs =
    profData.documents?.filter((d: any) => d.status === "approved") || [];
  const rejectedDocs =
    profData.documents?.filter((d: any) => d.status === "rejected") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {profData.full_name}
          </h1>
          <p className="text-gray-600 mt-1">Professional Profile</p>
        </div>
        <Link href="/admin/professionals">
          <Button variant="outline">Back to Professionals</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <p className="mt-1 font-medium">{profData.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="mt-1">{profData.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profData.is_verified && profData.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {profData.is_verified && profData.is_active
                        ? "Active & Verified"
                        : "Pending Verification"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Rating
                  </label>
                  <p className="mt-1">
                    {profData.rating_average
                      ? `${profData.rating_average.toFixed(1)} ⭐ (${profData.total_reviews} reviews)`
                      : "No ratings yet"}
                  </p>
                </div>
                {profData.experience_years && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Experience
                    </label>
                    <p className="mt-1">{profData.experience_years} years</p>
                  </div>
                )}
                {profData.hourly_rate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Hourly Rate
                    </label>
                    <p className="mt-1">₹{profData.hourly_rate}</p>
                  </div>
                )}
              </div>
              {profData.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Bio
                  </label>
                  <p className="mt-1 text-sm">{profData.bio}</p>
                </div>
              )}
              {profData.skills && profData.skills.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Skills
                  </label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {profData.skills.map((skill: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>
                Documents ({profData.documents?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingDocs.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-700 mb-2">
                    Pending Review
                  </h4>
                  <div className="space-y-2">
                    {pendingDocs.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-3 border border-yellow-200 bg-yellow-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">
                              {doc.document_type}
                            </p>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {doc.document_name}
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {approvedDocs.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Approved</h4>
                  <div className="space-y-2">
                    {approvedDocs.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-3 border border-green-200 bg-green-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">
                              {doc.document_type}
                            </p>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {doc.document_name}
                            </a>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            Approved
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {rejectedDocs.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">Rejected</h4>
                  <div className="space-y-2">
                    {rejectedDocs.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-3 border border-red-200 bg-red-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium capitalize">
                              {doc.document_type}
                            </p>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {doc.document_name}
                            </a>
                            {doc.rejection_reason && (
                              <p className="text-sm text-red-600 mt-1">
                                Reason: {doc.rejection_reason}
                              </p>
                            )}
                          </div>
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                            Rejected
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profData.documents?.length === 0 && (
                <p className="text-sm text-gray-500">No documents uploaded</p>
              )}
            </CardContent>
          </Card>

          {/* Services */}
          {profData.services && profData.services.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Services Offered ({profData.services.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profData.services.map((ps: any) => (
                    <div
                      key={ps.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{ps.service?.name}</p>
                        <p className="text-sm text-gray-500">
                          {ps.service?.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{ps.price}</p>
                        {ps.duration_minutes && (
                          <p className="text-xs text-gray-500">
                            {ps.duration_minutes} min
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Bank Accounts */}
          {profData.bank_accounts && profData.bank_accounts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bank Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profData.bank_accounts.map((account: any) => (
                    <div
                      key={account.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{account.bank_name}</p>
                        {account.is_primary && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {account.account_holder_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {account.account_type} Account
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Verified: {account.is_verified ? "Yes" : "No"}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {(!profData.is_verified || pendingDocs.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <form action={async (formData) => { await approveProfessional(formData); }}>
                  <input
                    type="hidden"
                    name="professionalId"
                    value={profData.id}
                  />
                  <Button type="submit" variant="default" className="w-full">
                    Approve Professional
                  </Button>
                </form>
                <form action={async (formData) => { await rejectProfessional(formData); }}>
                  <input
                    type="hidden"
                    name="professionalId"
                    value={profData.id}
                  />
                  <Button type="submit" variant="outline" className="w-full">
                    Reject Professional
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
