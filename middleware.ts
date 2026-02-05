import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import type { UserRole } from "@/lib/types/auth";
import { getRoleBasedRedirect } from "@/lib/auth/utils";

export async function middleware(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);

  // Define protected routes
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/about",
    "/login",
    "/register",
    "/auth",
    "/services",
    "/become-professional",
  ];
  // Check if route matches public routes (including dynamic routes like /services/[id])
  const isPublicRoute = publicRoutes.some((route) => {
    if (route === "/services") {
      // Allow /services and /services/[id] routes
      return pathname === route || pathname.startsWith(route + "/");
    }
    return pathname.startsWith(route);
  });

  // Auth routes (login, register) - redirect if already authenticated
  const authRoutes = ["/login", "/register"];
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get user role from profile if authenticated
  let userRole: UserRole | null = null;
  if (user) {
    // SECURITY: Prioritize database profile over metadata to prevent stale roles
    if (supabase) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role) {
        userRole = profile.role as UserRole;
      }
    }

    // Fallback to metadata only if DB check fails or is unavailable
    if (!userRole) {
      userRole = (user.user_metadata?.role as UserRole) || null;
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const redirectUrl = request.nextUrl.clone();
    // Redirect based on role
    if (userRole) {
      redirectUrl.pathname = getRoleBasedRedirect(userRole);
    } else {
      redirectUrl.pathname = "/dashboard";
    }
    // Preserve query parameters (like messages) when redirecting
    const message = request.nextUrl.searchParams.get("message");
    if (message) {
      redirectUrl.searchParams.set("message", message);
    }
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based route protection
  const adminRoutes = ["/users"]; // Admin-only routes
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Role-specific routes that require authentication
  const roleRoutes = ["/customer", "/professional", "/admin"];
  const isRoleRoute = roleRoutes.some((route) => pathname.startsWith(route));

  // Protected routes that require authentication (but not role-specific)
  const protectedRoutes = ["/dashboard", "/bookings", "/profile"];
  const isProtectedRoute =
    protectedRoutes.some((route) => pathname.startsWith(route)) && !isRoleRoute;

  // Protect admin routes
  if (isAdminRoute) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
    if (userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/dashboard";
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Protect role-specific routes
  if (isRoleRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is authenticated but doesn't have a role, redirect to profile setup
  if (isRoleRoute && user && !userRole) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("error", "role_not_set");
    return NextResponse.redirect(redirectUrl);
  }

  // Protect role-specific routes based on user role
  if (isRoleRoute && user && userRole) {
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getRoleBasedRedirect(userRole);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith("/professional") && userRole !== "professional") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getRoleBasedRedirect(userRole);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
    if (pathname.startsWith("/customer") && userRole !== "customer") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = getRoleBasedRedirect(userRole);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // If user is authenticated but role check didn't happen yet (userRole is null),
  // we let it pass to the role-specific pages which have their own client-side 
  // ProtectedRoute checks. This prevents the "unauthorized" redirect loop
  // while the role-based profile is still being synchronized.

  // Protect all protected routes
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
