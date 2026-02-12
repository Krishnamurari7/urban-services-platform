"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { useAuth } from "@/components/auth/auth-provider";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  LayoutDashboard,
  Calendar,
  User,
  CreditCard,
  Plus,
  LogOut,
  Menu,
  X,
  Package,
  MapPin,
  Search,
  Bell,
} from "lucide-react";

const primaryLinks = [
  { name: "Dashboard", href: "/customer/dashboard" },
  { name: "Services", href: "/customer/services" },
  { name: "Book Service", href: "/customer/book-service" },
  { name: "My Bookings", href: "/customer/bookings" },
];

const accountMenu = [
  { name: "Profile", href: "/customer/profile", icon: User },
  { name: "Payments", href: "/customer/payments", icon: CreditCard },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerLayoutContent>{children}</CustomerLayoutContent>
    </ProtectedRoute>
  );
}

function CustomerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar - inspired by Urban Company style */}
      <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4">
          {/* Left: Logo + location selector */}
          <div className="flex items-center gap-6">
            <Link
              href="/customer/dashboard"
              className="flex items-center gap-2"
            >
              <Image
                src="/logo.png"
                alt="Vera Company"
                width={36}
                height={36}
                className="rounded-lg shadow-sm"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-gray-900">
                  Vera Company
                </span>
                <span className="text-xs text-gray-500">
                  Home services at your doorstep
                </span>
              </div>
            </Link>

            <button className="hidden items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm hover:border-gray-300 hover:bg-gray-50 sm:flex">
              <MapPin className="h-3.5 w-3.5 text-blue-600" />
              <span>Set your location</span>
            </button>
          </div>

          {/* Center: Search */}
          <div className="hidden flex-1 items-center md:flex">
            <form
              className="relative w-full max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/customer/services?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                }
              }}
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search for 'AC service', 'Salon at home'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-full border-gray-200 bg-gray-50 pl-9 pr-4 text-sm shadow-inner focus:bg-white"
              />
            </form>
          </div>

          {/* Right: primary links + account */}
          <div className="flex items-center gap-3">
            <button className="hidden rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 md:inline-flex">
              <Bell className="h-4 w-4" />
            </button>

            {/* Desktop primary links */}
            <nav className="hidden items-center gap-3 lg:flex">
              {primaryLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isActive
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Account dropdown */}
            <div className="relative">
              <button
                onClick={() => setAccountOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:border-gray-300 hover:bg-white"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden flex-col text-left sm:flex">
                  <span className="max-w-[120px] truncate text-xs font-semibold">
                    {user?.email || "Account"}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Customer
                  </span>
                </span>
                <X
                  className={cn(
                    "h-3 w-3 text-gray-400 transition-transform",
                    accountOpen ? "rotate-45" : "rotate-0"
                  )}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 text-sm shadow-lg">
                  <div className="px-3 pb-2 pt-1">
                    <p className="text-xs font-semibold text-gray-800">
                      Hi, {user?.email?.split("@")[0] || "Customer"}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Manage your account & bookings
                    </p>
                  </div>
                  <div className="my-1 border-t border-gray-100" />
                  {accountMenu.map((item) => (
                    <button
                      key={item.href}
                      onClick={() => {
                        setAccountOpen(false);
                        router.push(item.href);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50"
                    >
                      <item.icon className="h-4 w-4 text-gray-400" />
                      <span>{item.name}</span>
                    </button>
                  ))}
                  <div className="my-1 border-t border-gray-100" />
                  <form
                    action={signOut}
                    className="px-3 pt-1"
                    onSubmit={() => setAccountOpen(false)}
                  >
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      className="flex w-full items-center justify-start gap-2 text-xs"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </form>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="inline-flex rounded-full border border-gray-200 p-2 text-gray-600 hover:bg-gray-50 md:hidden"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile nav sheet */}
        {mobileMenuOpen && (
          <div className="border-t bg-white px-4 pb-4 pt-2 md:hidden">
            {/* Mobile Search */}
            <form
              className="mb-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(`/customer/services?search=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                  setMobileMenuOpen(false);
                }
              }}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for 'AC service', 'Salon at home'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-full border-gray-200 bg-gray-50 pl-9 pr-4 text-sm shadow-inner focus:bg-white"
                />
              </div>
            </form>
            <nav className="space-y-1 text-sm">
              {primaryLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 pb-10 pt-6">{children}</main>
    </div>
  );
}
