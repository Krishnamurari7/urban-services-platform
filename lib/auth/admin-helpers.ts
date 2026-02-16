"use server";

import { redirect } from "next/navigation";
import { requireRole } from "./session";

/**
 * Helper function for admin pages to check admin access
 * Redirects to login if not authenticated, or to dashboard if not admin
 * Use this in server components (pages) that need admin access
 */
export async function requireAdminPage() {
  try {
    await requireRole("admin");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    if (message.includes("Authentication required")) {
      redirect("/login");
    } else {
      redirect("/dashboard");
    }
  }
}
