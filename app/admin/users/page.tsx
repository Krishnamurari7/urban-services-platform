import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import Link from "next/link";
import { suspendUser, activateUser } from "./actions";

async function getUsers() {
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

  // Get all profiles with detailed information
  const { data: profiles } = await supabase
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

  // Get email from auth.users and booking stats for each user
  const usersWithStats = await Promise.all(
    (profiles || []).map(async (profile) => {
      // Get email from auth.users using SQL query (admin can access this)
      let email = "N/A";
      try {
        // Try to get email using admin API
        const { data: authUser, error } = await supabase.auth.admin.getUserById(profile.id);
        if (!error && authUser?.user?.email) {
          email = authUser.user.email;
        } else {
          // Fallback: Use SQL query if admin API doesn't work
          const { data: emailData } = await supabase.rpc('get_user_email', { user_id: profile.id });
          if (emailData) email = emailData;
        }
      } catch (error) {
        // If admin API fails, email will remain "N/A"
        console.error("Error fetching email:", error);
      }

      // Get booking counts
      const { count: customerBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("customer_id", profile.id);

      const { count: professionalBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", profile.id);

      const totalBookings = (customerBookings || 0) + (professionalBookings || 0);

      // Get completed bookings count
      const { count: completedBookings } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .or(`customer_id.eq.${profile.id},professional_id.eq.${profile.id}`)
        .eq("status", "completed");

      return {
        ...profile,
        email,
        bookingCount: totalBookings,
        customerBookings: customerBookings || 0,
        professionalBookings: professionalBookings || 0,
        completedBookings: completedBookings || 0,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">Manage all users, customers, and professionals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-gray-500 mt-1">All users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <span className="text-2xl">🛒</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionals</CardTitle>
            <span className="text-2xl">👷</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{professionals.length}</div>
            <p className="text-xs text-gray-500 mt-1">Service providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <span className="text-2xl">⏸️</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUsers.length}</div>
            <p className="text-xs text-gray-500 mt-1">Suspended accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Customers Section */}
      {customers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Customers ({customers.length})</CardTitle>
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
                  {customers.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{user.full_name || "N/A"}</td>
                      <td className="p-2 text-sm">{user.email || "N/A"}</td>
                      <td className="p-2 text-sm">{user.phone || "N/A"}</td>
                      <td className="p-2 text-sm">{user.customerBookings || 0}</td>
                      <td className="p-2 text-sm text-green-600">{user.completedBookings || 0}</td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.is_active && user.is_verified
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
                              <input type="hidden" name="userId" value={user.id} />
                              <Button type="submit" variant="outline" size="sm">
                                Suspend
                              </Button>
                            </form>
                          ) : (
                            <form action={activateUser}>
                              <input type="hidden" name="userId" value={user.id} />
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
        <Card>
          <CardHeader>
            <CardTitle>Professionals ({professionals.length})</CardTitle>
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
                  {professionals.map((user: any) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{user.full_name || "N/A"}</td>
                      <td className="p-2 text-sm">{user.email || "N/A"}</td>
                      <td className="p-2 text-sm">{user.phone || "N/A"}</td>
                      <td className="p-2">
                        {user.rating_average ? (
                          <span className="text-sm font-medium">
                            {user.rating_average.toFixed(1)} ⭐ ({user.total_reviews || 0})
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No ratings</span>
                        )}
                      </td>
                      <td className="p-2 text-sm">{user.professionalBookings || 0}</td>
                      <td className="p-2 text-sm text-green-600">{user.completedBookings || 0}</td>
                      <td className="p-2 text-sm">
                        {user.experience_years ? `${user.experience_years} years` : "N/A"}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            user.is_active && user.is_verified
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
                              <input type="hidden" name="userId" value={user.id} />
                              <Button type="submit" variant="outline" size="sm">
                                Suspend
                              </Button>
                            </form>
                          ) : (
                            <form action={activateUser}>
                              <input type="hidden" name="userId" value={user.id} />
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
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
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
                {users.map((user: any) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{user.full_name || "N/A"}</td>
                    <td className="p-2 text-sm">{user.email || "N/A"}</td>
                    <td className="p-2 text-sm">{user.phone || "N/A"}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === "admin"
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
                        className={`px-2 py-1 rounded text-xs ${
                          user.is_active && user.is_verified
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
                            <input type="hidden" name="userId" value={user.id} />
                            <Button type="submit" variant="outline" size="sm">
                              Suspend
                            </Button>
                          </form>
                        ) : (
                          <form action={activateUser}>
                            <input type="hidden" name="userId" value={user.id} />
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
