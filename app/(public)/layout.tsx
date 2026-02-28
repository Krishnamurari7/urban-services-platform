import { Header } from "@/components/layout/header";
import { FooterServer } from "@/components/layout/footer-server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30 relative overflow-x-hidden">
      {/* Enhanced background pattern with subtle animation */}
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
      
      {/* Subtle gradient orbs for depth - hidden on mobile for performance */}
      <div className="hidden sm:block fixed -z-10 top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="hidden sm:block fixed -z-10 top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="hidden sm:block fixed -z-10 -bottom-8 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      
      <Header />
      <main className="flex-1 relative w-full overflow-x-hidden">{children}</main>
      <FooterServer />
    </div>
  );
}
