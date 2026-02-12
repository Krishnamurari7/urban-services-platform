"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth/actions";
import { useRouter } from "next/navigation";

import { getRoleBasedRedirect } from "@/lib/auth/utils";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, role } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-lg supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group min-w-0 flex-shrink">
            <Image
              src="/logo.png"
              alt="Vera Company"
              width={40}
              height={40}
              className="transition-transform group-hover:scale-110 flex-shrink-0"
              priority
            />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text truncate">
              Vera Company
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/services"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Services
            </Link>
            <Link
              href="/become-professional"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Become a Professional
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              About
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href={getRoleBasedRedirect(role || "customer")}>
                  <Button variant="ghost" size="sm">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <form action={signOut}>
                  <Button variant="outline" size="sm" type="submit">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 touch-manipulation"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden animate-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2">
              <Link
                href="/services"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/become-professional"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                Become a Professional
              </Link>
              {user ? (
                <>
                  <Link
                    href={getRoleBasedRedirect(role || "customer")}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <form
                    action={signOut}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      type="submit"
                      className="w-full justify-start"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button size="sm" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
