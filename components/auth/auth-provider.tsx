"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserRole } from "@/lib/types/auth";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchUserRole = async (userId: string, retryCount = 0): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!error && data && data.role) {
        setRole(data.role as UserRole);
      } else {
        // If profile doesn't exist yet and it's a new user, retry a few times
        // This handles the case where profile creation is delayed by database trigger
        if (retryCount < 3 && error?.code === "PGRST116") {
          // PGRST116 = no rows returned
          setTimeout(() => {
            fetchUserRole(userId, retryCount + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff: 1s, 2s, 3s
        } else {
          setRole(null);
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      // Retry on network errors
      if (retryCount < 2) {
        setTimeout(() => {
          fetchUserRole(userId, retryCount + 1);
        }, 1000 * (retryCount + 1));
      } else {
        setRole(null);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;

    // Get initial session - use getSession() to read from cookies immediately
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (mounted) {
          const currentUser = session?.user ?? null;
          setUser(currentUser);
          if (currentUser) {
            // Fetch role - it will retry internally if needed
            try {
              await Promise.race([
                fetchUserRole(currentUser.id),
                new Promise<void>((resolve) =>
                  setTimeout(() => resolve(), 10000) // Increased timeout to 10s
                ),
              ]);
            } catch (roleError) {
              console.error("Error fetching role:", roleError);
              setRole(null);
            }
          } else {
            setRole(null);
          }
          setLoading(false);
          hasInitialized = true;
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setLoading(false);
          hasInitialized = true;
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      // Don't show loading screen for token refresh events (happens on tab/window focus)
      // Only show loading for actual auth state changes (SIGNED_IN, SIGNED_OUT)
      if (event === 'TOKEN_REFRESHED' && hasInitialized) {
        // Just silently update user without showing loading screen
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        return; // Don't fetch role again or show loading
      }

      // For real auth changes (login/logout), show loading
      const isRealAuthChange = event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED';
      if (isRealAuthChange && hasInitialized) {
        setLoading(true);
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        try {
          await Promise.race([
            fetchUserRole(currentUser.id),
            new Promise<void>((resolve) => setTimeout(() => resolve(), 8000)), // Increased timeout to 8s
          ]);
        } catch (roleError) {
          console.error("Error fetching role:", roleError);
          setRole(null);
        }
      } else {
        setRole(null);
      }
      
      if (isRealAuthChange && hasInitialized) {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
