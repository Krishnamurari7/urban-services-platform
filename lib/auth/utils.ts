import type { UserRole } from "@/lib/types/auth";

/**
 * Helper function to get role-based redirect path
 */
export function getRoleBasedRedirect(role: UserRole): string {
    switch (role) {
        case "admin":
            return "/admin/dashboard";
        case "professional":
            return "/professional/dashboard";
        case "customer":
            return "/customer/dashboard";
        default:
            return "/dashboard";
    }
}
