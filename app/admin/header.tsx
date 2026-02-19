"use client";

import { useState, useRef, useEffect } from "react";
import { Search, RefreshCw, Bell, MessageSquare, ChevronDown, User, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function AdminHeader() {
    const [searchQuery, setSearchQuery] = useState("");
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [messagesOpen, setMessagesOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const supabase = createClient();
    const { user } = useAuth();

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
                setNotificationsOpen(false);
                setMessagesOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            // Use window.location for full page reload to bypass ProtectedRoute redirects
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error:", error);
            // Even on error, redirect to public page
            window.location.href = "/";
        }
    };

    const getUserDisplayName = () => {
        if (user?.email) {
            const emailName = user.email.split("@")[0];
            return emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        return "Admin";
    };

    const handleRefresh = () => {
        router.refresh();
    };

    return (
        <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-gray-100 border-b border-gray-200 z-40">
            <div className="h-full px-4 sm:px-6 flex items-center justify-between">
                {/* Left side - Logo and Search */}
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-blue-700 hidden sm:inline">Vira Company</span>
                    </div>
                   
                </div>

                {/* Right side - Icons and User Menu */}
                <div className="flex items-center gap-3">
                    {/* Refresh Button */}
                    <Button
                        variant="ghost"
                        onClick={handleRefresh}
                        className="h-9 w-9 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                        aria-label="Refresh"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </Button>

                  

                 

                    {/* User Profile Dropdown */}
                    <div className="relative" ref={userMenuRef}>
                        <button
                            onClick={() => {
                                setUserMenuOpen(!userMenuOpen);
                                setNotificationsOpen(false);
                                setMessagesOpen(false);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                                {user?.email?.[0]?.toUpperCase() || "A"}
                            </div>
                            <span className="hidden sm:inline text-sm font-medium text-gray-700">
                                {getUserDisplayName()}
                            </span>
                            <ChevronDown
                                className={cn(
                                    "h-4 w-4 text-gray-500 transition-transform",
                                    userMenuOpen ? "rotate-180" : "rotate-0"
                                )}
                            />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-gray-900">{getUserDisplayName()}</p>
                                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                                </div>
                                <div className="py-1">
                                    <button
                                        onClick={() => {
                                            router.push("/admin/profile");
                                            setUserMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <User className="h-4 w-4" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
