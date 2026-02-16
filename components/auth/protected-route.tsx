"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  const maxWaitTime = 8000; // Maximum wait time: 8 seconds
  const waitStartRef = useRef<number | null>(null);

  // Track when we start waiting for role
  useEffect(() => {
    if (isAuthenticated && user && role === null && !loading) {
      if (waitStartRef.current === null) {
        waitStartRef.current = Date.now();
      }
    } else if (role !== null) {
      waitStartRef.current = null;
    }
  }, [isAuthenticated, user, role, loading]);

  useEffect(() => {
    if (!loading) {
      // If not authenticated at all, redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Check role if required
      if (requiredRole) {
        // If role is still null/undefined, wait for it with a timeout
        if (role === null || role === undefined) {
          // Check if we've waited long enough
          const waitTime = waitStartRef.current ? Date.now() - waitStartRef.current : 0;
          
          // For customer routes, be more lenient - allow access after reasonable wait time
          // This handles cases where profile creation is delayed by database trigger
          if (requiredRole === "customer" && waitTime >= maxWaitTime) {
            // After waiting, assume customer role if user is authenticated
            // This prevents blocking legitimate customers whose profile is being created
            setRoleLoading(false);
            return;
          }
          
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

  // Show loading state while auth is loading or role is being fetched
  const waitTime = waitStartRef.current ? Date.now() - waitStartRef.current : 0;
  const shouldWaitForRole = isAuthenticated && roleLoading && role === null && 
    (requiredRole !== "customer" || waitTime < maxWaitTime);
  
  if (loading || shouldWaitForRole) {
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
  // For customer routes, be lenient if role is null after retries (assume customer)
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


