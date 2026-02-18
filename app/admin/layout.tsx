import { ProtectedRoute } from "@/components/auth/protected-route";
import { AdminSidebar } from "./sidebar";
import { Footer } from "@/components/layout/footer";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex flex-col">
        <AdminSidebar />

        {/* Main Content */}
        <div className="md:pl-64 pt-16 md:pt-0 flex-1 flex flex-col">
          <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto flex-1 w-full">{children}</main>
          
          {/* Footer */}
          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
