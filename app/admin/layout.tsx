import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminSidebar } from "./sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />

        {/* Main Content */}
        <div className="md:pl-64 pt-16 md:pt-0">
          <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
