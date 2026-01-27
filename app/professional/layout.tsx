"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Calendar,
  User,
  Briefcase,
  FileText,
  LogOut,
  Menu,
  X,
  DollarSign,
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types/database";
import { ProtectedRoute } from "@/components/auth/protected-route";

const navigation = [
  { name: "Dashboard", href: "/professional/dashboard", icon: LayoutDashboard },
  { name: "Job Requests", href: "/professional/bookings", icon: Calendar },
  { name: "My Services", href: "/professional/services", icon: Briefcase },
  { name: "Profile", href: "/professional/profile", icon: User },
];

export default function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="professional">
      <ProfessionalLayoutContent>{children}</ProfessionalLayoutContent>
    </ProtectedRoute>
  );
}

function ProfessionalLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
      <div className="min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white">
          <div className="flex items-center flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <Link href="/professional/dashboard" className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                <span className="text-lg font-bold">U</span>
              </div>
              <span className="ml-2 text-xl font-bold">Professional Portal</span>
            </Link>
          </div>

          {/* Profile Section */}
          {profile && (
            <div className="px-4 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {profile.phone || "No phone"}
                  </p>
                  {profile.rating_average > 0 && (
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-yellow-500">★</span>
                      <span className="text-xs text-gray-600 ml-1">
                        {profile.rating_average.toFixed(1)} ({profile.total_reviews})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="flex-shrink-0 px-2 py-4 border-t border-gray-200">
              <form action={signOut}>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  type="submit"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/professional/dashboard" className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="text-lg font-bold">U</span>
            </div>
            <span className="ml-2 text-lg font-bold">Professional Portal</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Profile Section */}
        {profile && mobileMenuOpen && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {profile.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {profile.phone || "No phone"}
                </p>
                {profile.rating_average > 0 && (
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-yellow-500">★</span>
                    <span className="text-xs text-gray-600 ml-1">
                      {profile.rating_average.toFixed(1)} ({profile.total_reviews})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-blue-500" : "text-gray-400"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
            <form action={signOut} onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full justify-start mt-2"
                type="submit"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="md:pl-64">
        <main>{children}</main>
      </div>
    </div>
  );
}
