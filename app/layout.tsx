import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Vera Company - Professional Home Services Marketplace",
    template: "%s | Vera Company",
  },
  description: "Find trusted professionals for all your home service needs. Book plumbers, electricians, cleaners, and more with ease.",
  keywords: ["home services", "professional services", "plumber", "electrician", "home maintenance", "service marketplace"],
  authors: [{ name: "Vera Company" }],
  creator: "Vera Company",
  publisher: "Vera Company",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Vera Company",
    title: "Vera Company - Professional Home Services Marketplace",
    description: "Find trusted professionals for all your home service needs. Book plumbers, electricians, cleaners, and more with ease.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Vera Company Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vera Company - Professional Home Services Marketplace",
    description: "Find trusted professionals for all your home service needs.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster position="top-right" />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
