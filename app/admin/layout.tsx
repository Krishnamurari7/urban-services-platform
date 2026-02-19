import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";
import { FooterServer } from "@/components/layout/footer-server";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminSidebar />
        <AdminHeader />

        {/* Main Content */}
        <div className="md:pl-64 pt-16 md:pt-16 flex-1 flex flex-col">
          <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto flex-1 w-full">{children}</main>
          
          {/* Footer */}
          <FooterServer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
