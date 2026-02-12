"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/types/auth";
import { getRoleBasedRedirect } from "@/lib/auth/utils";
import { LoadingBar } from "@/components/ui/loading-bar";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, role, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (!loading) {
      // If not authenticated at all, redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role if required
      if (requiredRole) {
        // If role is still null/undefined, we need to wait for it
        if (role === null || role === undefined) {
          // Role is loading, keep showing loading state
          return;
        }

        // Role is loaded and doesn't match
        if (role !== requiredRole) {
          const roleBasedRedirect = getRoleBasedRedirect(role);
          router.push(roleBasedRedirect);
          return;
        }

        // Role matches - stop loading
        setRoleLoading(false);
      } else {
        // No role required - stop loading
        setRoleLoading(false);
      }
    }
  }, [loading, isAuthenticated, role, requiredRole, router, redirectTo]);

  // Update roleLoading when role changes
  useEffect(() => {
    if (role !== null) {
      setRoleLoading(false);
    }
  }, [role]);

  if (loading || (isAuthenticated && roleLoading && role === null)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-full max-w-md px-4">
          <LoadingBar text="Vera Company" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check if user has required role - only show Access Denied if role is loaded and doesn't match
  if (requiredRole && role !== null && role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


