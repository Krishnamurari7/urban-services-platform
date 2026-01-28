import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { approveProfessional, rejectProfessional } from "./actions";

async function getProfessionals() {
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

  // Get all professionals with their documents
  const { data: professionals } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      phone,
      bio,
      is_verified,
      is_active,
      rating_average,
      total_reviews,
      experience_years,
      skills,
      hourly_rate,
      created_at,
      documents:professional_documents(
        id,
        document_type,
        document_name,
        file_url,
        status,
        rejection_reason
      )
    `
    )
    .eq("role", "professional")
    .order("created_at", { ascending: false });

  // Get email and booking stats for each professional
  const professionalsWithDetails = await Promise.all(
    (professionals || []).map(async (professional) => {
      // Get email
      let email = "N/A";
      try {
        const { data: authUser, error } = await supabase.auth.admin.getUserById(
          professional.id
        );
        if (!error && authUser?.user?.email) {
          email = authUser.user.email;
        }
      } catch (error) {
        console.error("Error fetching email:", error);
      }

      // Get booking stats
      const { count: totalBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", professional.id);

      const { count: completedBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", professional.id)
        .eq("status", "completed");

      return {
        ...professional,
        email,
        totalBookings: totalBookings || 0,
        completedBookings: completedBookings || 0,
      };
    })
  );

  return professionalsWithDetails;
}

export default async function AdminProfessionalsPage() {
  const professionals = await getProfessionals();

  const pendingProfessionals = professionals.filter(
    (p) =>
      !p.is_verified ||
      (p.documents && p.documents.some((d: any) => d.status === "pending"))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Professional Management
        </h1>
        <p className="text-gray-600 mt-1">Approve and manage professionals</p>
      </div>

      {/* Pending Approvals */}
      {pendingProfessionals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Pending Approvals ({pendingProfessionals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingProfessionals.map((professional: any) => (
                <div
                  key={professional.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {professional.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {professional.email || "Email N/A"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {professional.phone || "Phone N/A"}
                      </p>
                      {professional.bio && (
                        <p className="text-sm text-gray-500 mt-1">
                          {professional.bio}
                        </p>
                      )}

                      {professional.experience_years && (
                        <p className="text-sm text-gray-500 mt-1">
                          Experience: {professional.experience_years} years
                        </p>
                      )}

                      {professional.documents &&
                        professional.documents.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium mb-2">
                              Documents:
                            </p>
                            <div className="space-y-2">
                              {professional.documents.map((doc: any) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center gap-2 text-sm"
                                >
                                  <span className="capitalize">
                                    {doc.document_type}:
                                  </span>
                                  <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {doc.document_name}
                                  </a>
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      doc.status === "approved"
                                        ? "bg-green-100 text-green-700"
                                        : doc.status === "rejected"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"
                                    }`}
                                  >
                                    {doc.status}
                                  </span>
                                  {doc.rejection_reason && (
                                    <span className="text-red-600 text-xs">
                                      {doc.rejection_reason}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <form action={async (formData) => { await approveProfessional(formData); }}>
                        <input
                          type="hidden"
                          name="professionalId"
                          value={professional.id}
                        />
                        <Button type="submit" variant="default">
                          Approve
                        </Button>
                      </form>
                      <form action={async (formData) => { await rejectProfessional(formData); }}>
                        <input
                          type="hidden"
                          name="professionalId"
                          value={professional.id}
                        />
                        <Button type="submit" variant="outline">
                          Reject
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Professionals */}
      <Card>
        <CardHeader>
          <CardTitle>All Professionals ({professionals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Rating</th>
                  <th className="text-left p-2">Jobs</th>
                  <th className="text-left p-2">Completed</th>
                  <th className="text-left p-2">Experience</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {professionals.map((professional: any) => (
                  <tr
                    key={professional.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="p-2 font-medium">
                      {professional.full_name}
                    </td>
                    <td className="p-2 text-sm">
                      {professional.email || "N/A"}
                    </td>
                    <td className="p-2 text-sm">
                      {professional.phone || "N/A"}
                    </td>
                    <td className="p-2">
                      {professional.rating_average ? (
                        <span className="text-sm font-medium">
                          {professional.rating_average.toFixed(1)} ⭐ (
                          {professional.total_reviews || 0})
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">
                          No ratings
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-sm">
                      {professional.totalBookings || 0}
                    </td>
                    <td className="p-2 text-sm text-green-600">
                      {professional.completedBookings || 0}
                    </td>
                    <td className="p-2 text-sm">
                      {professional.experience_years
                        ? `${professional.experience_years} years`
                        : "N/A"}
                    </td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          professional.is_verified && professional.is_active
                            ? "bg-green-100 text-green-700"
                            : professional.is_active
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {professional.is_verified && professional.is_active
                          ? "Active"
                          : professional.is_active
                            ? "Pending"
                            : "Suspended"}
                      </span>
                    </td>
                    <td className="p-2">
                      <Link href={`/admin/professionals/${professional.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
