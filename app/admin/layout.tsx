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
        <div className="pl-64">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
