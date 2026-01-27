import { User } from "@supabase/supabase-js";

export type UserRole = "customer" | "professional" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role?: UserRole;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
  role?: UserRole;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends SignInCredentials {
  full_name?: string;
  role?: UserRole;
}
