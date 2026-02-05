import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import { getRoleBasedRedirect } from "@/lib/auth/utils";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get user role to redirect appropriately
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role =
          (profile?.role as "admin" | "professional" | "customer") ||
          "customer";
        const redirectPath = getRoleBasedRedirect(role);
        return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
      }
    }
  }

  // If there's an error or no code, redirect to login
  return NextResponse.redirect(
    new URL("/login?error=Authentication failed", requestUrl.origin)
  );
}


