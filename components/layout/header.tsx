"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Bell, Home, Star } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth/actions";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

import { getRoleBasedRedirect } from "@/lib/auth/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role, isAuthenticated, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Handle logout with immediate state update
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Sign out on client side first for immediate UI update
      await supabase.auth.signOut();
      // Refresh the router to update server-side state
      router.refresh();
      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback to server action if client-side fails
      await signOut();
    }
  };

  // Check if a link is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex h-16 md:h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-3 group min-w-0 flex-shrink-0 transition-transform hover:scale-105"
            prefetch={true}
            aria-label="Home"
          >
            <div className="relative">
              <Image
                src="/logo.png"
                alt="Vera Company"
                width={40}
                height={40}
                className="rounded-xl shadow-md ring-2 ring-blue-100/50 group-hover:ring-blue-200 transition-all object-contain"
              />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                Vera Company
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Home services at your doorstep
              </span>
            </div>
            <span className="sm:hidden text-xl font-bold text-gray-900 truncate">
              Vera Company
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
            <Link
              href="/services"
              prefetch={true}
              className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                isActive("/services")
                  ? "text-blue-600 font-semibold bg-blue-50 shadow-sm"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              Services
            </Link>
            {/* Show "Become a Professional" only for non-professionals */}
            {(!isAuthenticated || role !== "professional") && (
              <Link
                href="/become-professional"
                prefetch={true}
                className={`px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  isActive("/become-professional")
                    ? "text-blue-600 font-semibold bg-blue-50 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Become a Professional
              </Link>
            )}
            {!loading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200/60">
                    <button 
                      className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 relative"
                      aria-label="Notifications"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                    </button>
                    <Link 
                      href={getRoleBasedRedirect(role || "customer")}
                      prefetch={true}
                    >
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="gap-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        <User className="h-4 w-4" />
                        <span className="hidden lg:inline">Dashboard</span>
                      </Button>
                    </Link>
                    <form onSubmit={handleLogout}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        type="submit"
                        className="gap-2 border-gray-200 hover:border-gray-300 rounded-lg transition-all"
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden lg:inline">Sign Out</span>
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200/60">
                    <Link href="/login" prefetch={true}>
                      <Button 
                        size="sm"
                        variant="ghost"
                        className="text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link href="/register" prefetch={true}>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg rounded-lg transition-all"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2.5 -mr-2 touch-manipulation rounded-xl hover:bg-gray-100/80 transition-all duration-300 border border-gray-200/50 hover:border-gray-300"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200/60 bg-white/95 backdrop-blur-xl md:hidden animate-in slide-in-from-top-2 duration-300 shadow-lg">
            <nav className="flex flex-col py-3 px-2" aria-label="Mobile navigation">
              <Link
                href="/services"
                prefetch={true}
                className={`px-4 py-3 text-sm font-medium transition-all rounded-lg ${
                  isActive("/services")
                    ? "text-blue-600 font-semibold bg-blue-50 shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              {/* Show "Become a Professional" only for non-professionals */}
              {(!isAuthenticated || role !== "professional") && (
                <Link
                  href="/become-professional"
                  prefetch={true}
                  className={`px-4 py-3 text-sm font-medium transition-all rounded-lg ${
                    isActive("/become-professional")
                      ? "text-blue-600 font-semibold bg-blue-50 shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Become a Professional
                </Link>
              )}
              {!loading && (
                <>
                  {isAuthenticated ? (
                    <div className="mt-2 pt-2 border-t border-gray-200/50 space-y-2">
                      <Link
                        href={getRoleBasedRedirect(role || "customer")}
                        prefetch={true}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <form
                        onSubmit={handleLogout}
                        className="w-full"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          type="submit"
                          className="w-full justify-start gap-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </Button>
                      </form>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2 pt-4 mt-2 border-t border-gray-200/50">
                      <Link 
                        href="/login" 
                        prefetch={true}
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full"
                      >
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="w-full text-gray-700 hover:text-gray-900"
                        >
                          Login
                        </Button>
                      </Link>
                      <Link 
                        href="/register" 
                        prefetch={true}
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full"
                      >
                        <Button 
                          size="sm" 
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Sign Up
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
