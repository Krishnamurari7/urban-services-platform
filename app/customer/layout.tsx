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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/20 flex flex-col relative overflow-x-hidden">
        {/* Subtle background pattern */}
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808006_1px,transparent_1px),linear-gradient(to_bottom,#80808006_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        
        {/* Animated gradient orbs - hidden on mobile for performance */}
        <div className="hidden sm:block fixed -z-10 top-0 -left-4 w-96 h-96 bg-purple-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="hidden sm:block fixed -z-10 top-0 -right-4 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="hidden sm:block fixed -z-10 -bottom-8 left-20 w-96 h-96 bg-teal-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <CustomerLayoutContent>{children}</CustomerLayoutContent>
        <FooterServer />
      </div>
    </ProtectedRoute>
  );
}
