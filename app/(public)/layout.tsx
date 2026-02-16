import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <Header />
      <main className="flex-1 relative">{children}</main>
      <Footer />
    </div>
  );
}
