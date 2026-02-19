import { FooterServer } from "@/components/layout/footer-server";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
      <FooterServer />
    </div>
  );
}
