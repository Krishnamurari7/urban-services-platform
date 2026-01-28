import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { suspendUser, activateUser } from "../actions";

async function getUser(id: string) {
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

  // Get user profile
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!userProfile) {
    return null;
  }

  // Get email from auth.users
  let email = "N/A";
  try {
    const { data: authUser, error } = await supabase.auth.admin.getUserById(id);
    if (!error && authUser?.user?.email) {
      email = authUser.user.email;
    }
  } catch (error) {
    console.error("Error fetching email:", error);
  }

  // Get booking stats
  const { data: customerBookings } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      final_amount,
      scheduled_at,
      created_at,
      service:services(name, category),
      professional:profiles!bookings_professional_id_fkey(full_name)
    `
    )
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: professionalBookings } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      final_amount,
      scheduled_at,
      created_at,
      service:services(name, category),
      customer:profiles!bookings_customer_id_fkey(full_name)
    `
    )
    .eq("professional_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Get booking counts
  const { count: totalCustomerBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", id);

  const { count: totalProfessionalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("professional_id", id);

  // Get addresses
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", id)
    .order("is_default", { ascending: false });

  // Get reviews given (if customer)
  const { data: reviewsGiven } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      booking:bookings(
        service:services(name),
        professional:profiles!bookings_professional_id_fkey(full_name)
      )
    `
    )
    .eq("customer_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Get reviews received (if professional)
  const { data: reviewsReceived } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      customer:profiles!reviews_customer_id_fkey(full_name),
      booking:bookings(
        service:services(name)
      )
    `
    )
    .eq("professional_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    profile: userProfile,
    email,
    customerBookings: customerBookings || [],
    professionalBookings: professionalBookings || [],
    totalCustomerBookings: totalCustomerBookings || 0,
    totalProfessionalBookings: totalProfessionalBookings || 0,
    addresses: addresses || [],
    reviewsGiven: reviewsGiven || [],
    reviewsReceived: reviewsReceived || [],
  };
}

export default async function UserDetailPage(
  props: PageProps<"/admin/users/[id]">
) {
  const { id } = await props.params;
  const data = await getUser(id);

  if (!data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">User not found</p>
            <Link href="/admin/users">
              <Button variant="outline" className="mt-4">
                Back to Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    profile,
    email,
    customerBookings,
    professionalBookings,
    addresses,
    reviewsGiven,
    reviewsReceived,
  } = data;
  const isCustomer = profile.role === "customer";
  const isProfessional = profile.role === "professional";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {profile.full_name}
          </h1>
          <p className="text-gray-600 mt-1">
            {profile.role === "customer"
              ? "Customer"
              : profile.role === "professional"
                ? "Professional"
                : "Admin"}{" "}
            Profile
          </p>
        </div>
        <Link href="/admin/users">
          <Button variant="outline">Back to Users</Button>
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
                  <p className="mt-1 font-medium">{profile.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1">{email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="mt-1">{profile.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        profile.is_verified && profile.is_active
                          ? "bg-green-100 text-green-700"
                          : profile.is_active
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {profile.is_verified && profile.is_active
                        ? "Active & Verified"
                        : profile.is_active
                          ? "Pending Verification"
                          : "Suspended"}
                    </span>
                  </div>
                </div>
                {isProfessional && (
                  <>
                    {profile.rating_average && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Rating
                        </label>
                        <p className="mt-1">
                          {profile.rating_average.toFixed(1)} ⭐ (
                          {profile.total_reviews || 0} reviews)
                        </p>
                      </div>
                    )}
                    {profile.experience_years && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Experience
                        </label>
                        <p className="mt-1">{profile.experience_years} years</p>
                      </div>
                    )}
                    {profile.hourly_rate && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Hourly Rate
                        </label>
                        <p className="mt-1">₹{profile.hourly_rate}</p>
                      </div>
                    )}
                  </>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Joined
                  </label>
                  <p className="mt-1">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {profile.bio && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Bio
                  </label>
                  <p className="mt-1 text-sm">{profile.bio}</p>
                </div>
              )}
              {isProfessional &&
                profile.skills &&
                profile.skills.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Skills
                    </label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {profile.skills.map((skill: string, idx: number) => (
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

          {/* Customer Bookings */}
          {isCustomer && customerBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Recent Bookings ({data.totalCustomerBookings} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customerBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.service?.name}</p>
                          <p className="text-sm text-gray-500">
                            {booking.professional?.full_name} •{" "}
                            {booking.service?.category}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(booking.scheduled_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{booking.final_amount}</p>
                          <span
                            className={`px-2 py-1 rounded text-xs mt-1 inline-block ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Professional Bookings */}
          {isProfessional && professionalBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Recent Jobs ({data.totalProfessionalBookings} total)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {professionalBookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{booking.service?.name}</p>
                          <p className="text-sm text-gray-500">
                            {booking.customer?.full_name} •{" "}
                            {booking.service?.category}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(booking.scheduled_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{booking.final_amount}</p>
                          <span
                            className={`px-2 py-1 rounded text-xs mt-1 inline-block ${
                              booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Addresses */}
          {isCustomer && addresses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Addresses ({addresses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {addresses.map((address: any) => (
                    <div
                      key={address.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {address.label}
                            {address.is_default && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-sm">{address.address_line1}</p>
                          {address.address_line2 && (
                            <p className="text-sm">{address.address_line2}</p>
                          )}
                          <p className="text-sm">
                            {address.city}, {address.state}{" "}
                            {address.postal_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Given */}
          {isCustomer && reviewsGiven.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews Given ({reviewsGiven.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewsGiven.map((review: any) => (
                    <div
                      key={review.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">⭐</span>
                            <span className="font-medium">
                              {review.rating}/5
                            </span>
                            <span className="text-sm text-gray-500">
                              for {review.booking?.service?.name}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              {review.comment}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews Received */}
          {isProfessional && reviewsReceived.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Reviews Received ({reviewsReceived.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reviewsReceived.map((review: any) => (
                    <div
                      key={review.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">⭐</span>
                            <span className="font-medium">
                              {review.rating}/5
                            </span>
                            <span className="text-sm text-gray-500">
                              by {review.customer?.full_name}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-gray-600 mt-1">
                              {review.comment}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
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
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isCustomer && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Bookings
                    </span>
                    <span className="font-medium">
                      {data.totalCustomerBookings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reviews Given</span>
                    <span className="font-medium">{reviewsGiven.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Addresses</span>
                    <span className="font-medium">{addresses.length}</span>
                  </div>
                </>
              )}
              {isProfessional && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Jobs</span>
                    <span className="font-medium">
                      {data.totalProfessionalBookings}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rating</span>
                    <span className="font-medium">
                      {profile.rating_average
                        ? `${profile.rating_average.toFixed(1)} ⭐`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Reviews</span>
                    <span className="font-medium">
                      {profile.total_reviews || 0}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {profile.is_active ? (
                <form action={async (formData) => { await suspendUser(formData); }}>
                  <input type="hidden" name="userId" value={profile.id} />
                  <Button type="submit" variant="outline" className="w-full">
                    Suspend User
                  </Button>
                </form>
              ) : (
                <form action={async (formData) => { await activateUser(formData); }}>
                  <input type="hidden" name="userId" value={profile.id} />
                  <Button type="submit" variant="default" className="w-full">
                    Activate User
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
