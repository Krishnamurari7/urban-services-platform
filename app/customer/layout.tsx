import { ProtectedRoute } from "@/components/auth/protected-route";
import { FooterServer } from "@/components/layout/footer-server";
import { CustomerLayoutContent } from "./customer-layout-content";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole="customer">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex flex-col">
        <CustomerLayoutContent>{children}</CustomerLayoutContent>
        <FooterServer />
      </div>
    </ProtectedRoute>
  );
}
