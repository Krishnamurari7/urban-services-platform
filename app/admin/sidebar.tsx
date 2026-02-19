"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect, useMemo } from "react";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Professionals", href: "/admin/professionals", icon: "👤" },
    { name: "Services", href: "/admin/services", icon: "🔧" },
    { name: "Bookings", href: "/admin/bookings", icon: "📅" },
    { name: "Payments", href: "/admin/payments", icon: "💰" },
    { name: "Reviews", href: "/admin/reviews", icon: "⭐" },
    { name: "Disputes", href: "/admin/disputes", icon: "⚖️" },
    { name: "Banners", href: "/admin/banners", icon: "🎨" },
    { name: "Page Content", href: "/admin/page-content", icon: "✏️" },
    { name: "Footer Settings", href: "/admin/footer", icon: "🦶" },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: "📋" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Handle logout with immediate state update
    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Sign out on client side first for immediate UI update
            await supabase.auth.signOut();
            // Use window.location for full page reload to bypass ProtectedRoute redirects
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
            // Even on error, redirect to public page
            window.location.href = "/";
        }
    };

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gray-100 border-b border-gray-200 shadow-sm">
                <div className="flex items-center justify-between h-16 px-4">
                    <Link 
                        href="/admin/dashboard" 
                        className="flex items-center space-x-2"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <Image
                            src="/logo.png"
                            alt="Vera Company"
                            width={48}
                            height={48}
                            className="object-contain"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                        <span className="text-sm font-bold text-gray-900">Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 touch-manipulation rounded-md hover:bg-gray-200 transition-colors"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6 text-gray-700" />
                        ) : (
                            <Menu className="h-6 w-6 text-gray-700" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    "md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
                    mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Desktop Sidebar */}
            <div className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700 z-30 shadow-lg" style={{ pointerEvents: 'auto' }}>
                <div className="flex flex-col h-full w-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-20 border-b border-slate-700 px-4 bg-slate-800">
                        <Link href="/admin/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                            <div className="relative w-12 h-12">
                                <Image
                                    src="/logo.png"
                                    alt="Vera Company"
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-base font-bold text-white">Admin Panel</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                    )}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-700">
                        <form onSubmit={handleLogout}>
                            <Button type="submit" variant="outline" className="w-full bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:text-white transition-colors">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "md:hidden fixed inset-y-0 left-0 w-64 bg-slate-800 border-r border-slate-700 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-20 border-b border-slate-700 px-4 bg-slate-800">
                        <Link 
                            href="/admin/dashboard" 
                            className="flex items-center space-x-3"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <div className="relative w-12 h-12">
                                <Image
                                    src="/logo.png"
                                    alt="Vera Company"
                                    width={48}
                                    height={48}
                                    className="object-contain"
                                />
                            </div>
                            <span className="text-base font-bold text-white">Admin Panel</span>
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 touch-manipulation text-white hover:bg-slate-700 rounded-md transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto overscroll-contain">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation active:scale-95 cursor-pointer",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                    )}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-700">
                        <form onSubmit={handleLogout}>
                            <Button 
                                type="submit" 
                                variant="outline" 
                                className="w-full bg-slate-700 text-white border-slate-600 hover:bg-slate-600 hover:text-white touch-manipulation"
                            >
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
