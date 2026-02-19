"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

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
  ChevronDown,
  Home,
} from "lucide-react";

const primaryLinks = [
  { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { name: "Services", href: "/customer/services", icon: Package },
  { name: "Book Service", href: "/customer/book-service", icon: Plus },
  { name: "My Bookings", href: "/customer/bookings", icon: Calendar },
];

const accountMenu = [
  { name: "Profile", href: "/customer/profile", icon: User },
  { name: "Payments", href: "/customer/payments", icon: CreditCard },
];

export function CustomerLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const accountDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        accountDropdownRef.current &&
        !accountDropdownRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    if (accountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [accountOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.email) {
      const emailName = user.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return "Customer";
  };

  return (
    <>
      {/* Top Navbar - Modern & Clean Design */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: Logo + location selector */}
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/customer/dashboard"
              className="flex items-center gap-2.5 transition-transform hover:scale-105"
            >
              <div className="relative">
                <Image
                  src="/logo.png"
                  alt="Vera Company"
                  width={40}
                  height={40}
                  className="rounded-xl shadow-md ring-2 ring-blue-100"
                />
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="text-base font-bold text-gray-900">
                  Vera Company
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  Home services at your doorstep
                </span>
              </div>
            </Link>

            <button className="hidden items-center gap-2 rounded-full border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md sm:flex">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span>Set location</span>
            </button>
          </div>

          {/* Center: Search */}
          <div className="hidden flex-1 items-center justify-center md:flex">
            <form
              className="relative w-full max-w-2xl"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(
                    `/customer/services?search=${encodeURIComponent(searchQuery.trim())}`
                  );
                  setSearchQuery("");
                }
              }}
            >
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Search services... (e.g., AC service, Salon at home)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 rounded-full border-gray-200 bg-gray-50 pl-11 pr-4 text-sm shadow-sm transition-all focus:bg-white focus:shadow-md focus:ring-2 focus:ring-blue-500/20"
              />
            </form>
          </div>

          {/* Right: Actions + Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <button className="hidden relative rounded-full border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 md:inline-flex">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-1 lg:flex">
              {primaryLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <link.icon className="h-4 w-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Account Dropdown */}
            <div className="relative" ref={accountDropdownRef}>
              <button
                onClick={() => setAccountOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-gradient-to-r from-gray-50 to-white px-3 py-2 text-xs font-semibold text-gray-900 shadow-sm transition-all hover:border-blue-300 hover:shadow-md sm:px-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white shadow-md ring-2 ring-blue-100">
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden flex-col text-left sm:flex">
                  <span className="max-w-[140px] truncate text-xs font-bold">
                    {getUserDisplayName()}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium">
                    Customer Account
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "hidden h-4 w-4 text-gray-400 transition-transform sm:block",
                    accountOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </button>

              {accountOpen && (
                <div className="absolute right-0 mt-2 w-64 animate-in fade-in-0 zoom-in-95 rounded-xl border border-gray-100 bg-white py-2 text-sm shadow-xl ring-1 ring-black/5">
                  {/* User Info Header */}
                  <div className="px-4 pb-3 pt-2 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                        {user?.email?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {getUserDisplayName()}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || "customer@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {accountMenu.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <button
                          key={item.href}
                          onClick={() => {
                            setAccountOpen(false);
                            router.push(item.href);
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors",
                            isActive
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700 hover:bg-gray-50"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Sign Out */}
                  <div className="px-2 pt-2">
                    <form
                      action={signOut}
                      onSubmit={() => setAccountOpen(false)}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="sm"
                        className="flex w-full items-center justify-start gap-3 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </Button>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="inline-flex rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 md:hidden"
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

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="border-t border-gray-200 bg-white px-4 pb-6 pt-4 shadow-lg md:hidden animate-in slide-in-from-top-2"
          >
            {/* Mobile User Info */}
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white shadow-md">
                {user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {user?.email || "customer@example.com"}
                </p>
              </div>
            </div>

            {/* Mobile Search */}
            <form
              className="mb-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  router.push(
                    `/customer/services?search=${encodeURIComponent(searchQuery.trim())}`
                  );
                  setSearchQuery("");
                  setMobileMenuOpen(false);
                }
              }}
            >
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 rounded-full border-gray-200 bg-gray-50 pl-10 pr-4 text-sm shadow-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </form>

            {/* Mobile Navigation Links */}
            <nav className="space-y-1 mb-4">
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
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-700 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Account Menu */}
            <div className="border-t border-gray-200 pt-3 space-y-1">
              {accountMenu.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <form action={signOut} onSubmit={() => setMobileMenuOpen(false)}>
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="flex w-full items-center justify-start gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="mx-auto w-full max-w-7xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </>
  );
}
