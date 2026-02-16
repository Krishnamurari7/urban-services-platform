"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Menu, X } from "lucide-react";

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
    { name: "Sections", href: "/admin/sections", icon: "📄" },
    { name: "Page Content", href: "/admin/page-content", icon: "✏️" },
    { name: "Audit Logs", href: "/admin/audit-logs", icon: "📋" },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
                <div className="flex items-center justify-between h-16 px-4">
                    <Link href="/admin/dashboard" className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="Vera Company"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                        <span className="text-sm font-bold text-gray-900">Admin Panel</span>
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 touch-manipulation"
                        aria-label="Toggle menu"
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Desktop Sidebar */}
            <div className="hidden md:flex fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-30">
                <div className="flex flex-col h-full w-full">
                    {/* Logo */}
                    <div className="flex items-center justify-center h-16 border-b border-gray-800 px-4">
                        <Link href="/admin/dashboard" className="flex items-center space-x-2">
                            <Image
                                src="/logo.png"
                                alt="Vera Company"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                            <span className="text-sm font-bold text-white">Admin Panel</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    )}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-800">
                        <form action={signOut}>
                            <Button type="submit" variant="outline" className="w-full bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <div
                className={cn(
                    "md:hidden fixed inset-y-0 left-0 w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between h-16 border-b border-gray-800 px-4">
                        <Link href="/admin/dashboard" className="flex items-center space-x-2">
                            <Image
                                src="/logo.png"
                                alt="Vera Company"
                                width={32}
                                height={32}
                                className="object-contain"
                            />
                            <span className="text-sm font-bold text-white">Admin Panel</span>
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 touch-manipulation text-white"
                            aria-label="Close menu"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    )}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-800">
                        <form action={signOut}>
                            <Button type="submit" variant="outline" className="w-full bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
