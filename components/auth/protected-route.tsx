"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/types/auth";

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
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role if required
      if (requiredRole && role !== requiredRole) {
        // Only redirect if role is loaded and doesn't match
        // Don't redirect if role is still null (loading)
        if (role !== null) {
          // Redirect to appropriate dashboard based on user's actual role
          const roleBasedRedirect = getRoleBasedRedirect(role);
          router.push(roleBasedRedirect);
        }
      } else {
        // Role matches or no role required - stop loading
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
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

/**
 * Get role-based redirect path
 */
function getRoleBasedRedirect(role: UserRole | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "professional":
      return "/professional/dashboard";
    case "customer":
      return "/customer/dashboard";
    default:
      return "/login";
  }
}
