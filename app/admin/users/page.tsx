import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { suspendUser, activateUser } from "./actions";

async function getUsers() {
  const supabase = await createClient();
  const adminClient = require("@/lib/supabase").createAdminClient();

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

  // Get all profiles with detailed information
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      phone,
      role,
      is_verified,
      is_active,
      created_at,
      rating_average,
      total_reviews,
      bio,
      experience_years,
      skills,
      hourly_rate,
      avatar_url
    `
    )
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError);
    return [];
  }

  // Get email from auth.users and booking stats for each user
  const usersWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      let email = "N/A";
      try {
        // Use admin client to get email - much more reliable
        const { data: authUser, error } = await adminClient.auth.admin.getUserById(
          profile.id
        );
        if (!error && authUser?.user?.email) {
          email = authUser.user.email;
        } else {
          // Fallback to RPC if needed
          const { data: emailData } = await supabase.rpc("get_user_email", {
            user_id: profile.id,
          });
          if (emailData) email = emailData;
        }
      } catch (error) {
        console.error("Error fetching email for user:", profile.id, error);
      }

      // Initialize stats with defaults
      let customerBookings = 0;
      let professionalBookings = 0;
      let completedBookings = 0;

      try {
        // Get booking counts safely
        const { count: cCount } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", profile.id);
        customerBookings = cCount || 0;

        const { count: pCount } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("professional_id", profile.id);
        professionalBookings = pCount || 0;

        // Get completed bookings count - using two separate queries for reliability
        const { count: compCCount } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("customer_id", profile.id)
          .eq("status", "completed");

        const { count: compPCount } = await supabase
          .from("bookings")
          .select("id", { count: "exact", head: true })
          .eq("professional_id", profile.id)
          .eq("status", "completed");

        completedBookings = (compCCount || 0) + (compPCount || 0);
      } catch (statError) {
        console.error("Error fetching stats for user:", profile.id, statError);
      }

      const totalBookings = customerBookings + professionalBookings;

      return {
        ...profile,
        email,
        bookingCount: totalBookings,
        customerBookings,
        professionalBookings,
        completedBookings,
      };
    })
  );

  return usersWithStats;
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  const customers = users.filter((u) => u.role === "customer");
  const professionals = users.filter((u) => u.role === "professional");
  const admins = users.filter((u) => u.role === "admin");
  const activeUsers = users.filter((u) => u.is_active);
  const inactiveUsers = users.filter((u) => !u.is_active);

  return (
    <div className="space-y-6 pb-8">
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-blue-50 mt-1">
          Manage all users, customers, and professionals
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-blue-50 border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total Users</CardTitle>
            <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{users.length}</div>
            <p className="text-xs text-gray-500 mt-1">All users</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Customers</CardTitle>
            <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">🛒</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{customers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active customers</p>
          </CardContent>
        </Card>

        <Card className="bg-indigo-50 border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Professionals</CardTitle>
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">👷</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{professionals.length}</div>
            <p className="text-xs text-gray-500 mt-1">Service providers</p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Active</CardTitle>
            <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{activeUsers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Inactive</CardTitle>
            <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-3xl">⏸️</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{inactiveUsers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Suspended accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Section */}
      {customers.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
            <CardTitle className="text-xl font-bold">Customers ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Bookings</th>
                    <th className="text-left p-2">Completed</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Joined</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((user: any, index: number) => (
                    <tr key={user.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                      <td className="p-2 font-medium">
                        {user.full_name || "N/A"}
                      </td>
                      <td className="p-2 text-sm">{user.email || "N/A"}</td>
                      <td className="p-2 text-sm">{user.phone || "N/A"}</td>
                      <td className="p-2 text-sm">
                        {user.customerBookings || 0}
                      </td>
                      <td className="p-2 text-sm text-green-600">
                        {user.completedBookings || 0}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${user.is_active && user.is_verified
                            ? "bg-green-100 text-green-700"
                            : user.is_active
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {user.is_active && user.is_verified
                            ? "Active"
                            : user.is_active
                              ? "Pending"
                              : "Suspended"}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {user.is_active ? (
                            <form action={suspendUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <Button type="submit" variant="outline" size="sm">
                                Suspend
                              </Button>
                            </form>
                          ) : (
                            <form action={activateUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <Button type="submit" variant="default" size="sm">
                                Activate
                              </Button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Professionals Section */}
      {professionals.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
            <CardTitle className="text-xl font-bold">Professionals ({professionals.length})</CardTitle>
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
                  {professionals.map((user: any, index: number) => (
                    <tr key={user.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                      <td className="p-2 font-medium">
                        {user.full_name || "N/A"}
                      </td>
                      <td className="p-2 text-sm">{user.email || "N/A"}</td>
                      <td className="p-2 text-sm">{user.phone || "N/A"}</td>
                      <td className="p-2">
                        {user.rating_average ? (
                          <span className="text-sm font-medium">
                            {user.rating_average.toFixed(1)} ⭐ (
                            {user.total_reviews || 0})
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No ratings
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-sm">
                        {user.professionalBookings || 0}
                      </td>
                      <td className="p-2 text-sm text-green-600">
                        {user.completedBookings || 0}
                      </td>
                      <td className="p-2 text-sm">
                        {user.experience_years
                          ? `${user.experience_years} years`
                          : "N/A"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${user.is_active && user.is_verified
                            ? "bg-green-100 text-green-700"
                            : user.is_active
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {user.is_active && user.is_verified
                            ? "Active"
                            : user.is_active
                              ? "Pending"
                              : "Suspended"}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Link href={`/admin/professionals/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </Link>
                          {user.is_active ? (
                            <form action={suspendUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <Button type="submit" variant="outline" size="sm">
                                Suspend
                              </Button>
                            </form>
                          ) : (
                            <form action={activateUser}>
                              <input
                                type="hidden"
                                name="userId"
                                value={user.id}
                              />
                              <Button type="submit" variant="default" size="sm">
                                Activate
                              </Button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Users Table */}
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-t-lg -m-6 mb-4 p-6 text-white">
          <CardTitle className="text-xl font-bold">All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Email</th>
                  <th className="text-left p-2">Phone</th>
                  <th className="text-left p-2">Role</th>
                  <th className="text-left p-2">Bookings</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Joined</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user: any, index: number) => (
                  <tr key={user.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                    <td className="p-2 font-medium">
                      {user.full_name || "N/A"}
                    </td>
                    <td className="p-2 text-sm">{user.email || "N/A"}</td>
                    <td className="p-2 text-sm">{user.phone || "N/A"}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "professional"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                          }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-2 text-sm">{user.bookingCount || 0}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${user.is_active && user.is_verified
                          ? "bg-green-100 text-green-700"
                          : user.is_active
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {user.is_active && user.is_verified
                          ? "Active"
                          : user.is_active
                            ? "Pending"
                            : "Suspended"}
                      </span>
                    </td>
                    <td className="p-2 text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2">
                      <div className="flex gap-2">
                        {user.role === "professional" ? (
                          <Link href={`/admin/professionals/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        ) : user.role === "customer" ? (
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        ) : null}
                        {user.is_active ? (
                          <form action={suspendUser}>
                            <input
                              type="hidden"
                              name="userId"
                              value={user.id}
                            />
                            <Button type="submit" variant="outline" size="sm">
                              Suspend
                            </Button>
                          </form>
                        ) : (
                          <form action={activateUser}>
                            <input
                              type="hidden"
                              name="userId"
                              value={user.id}
                            />
                            <Button type="submit" variant="default" size="sm">
                              Activate
                            </Button>
                          </form>
                        )}
                      </div>
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
