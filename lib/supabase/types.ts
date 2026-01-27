/**
 * Database types can be generated using Supabase CLI:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/types.ts
 *
 * Or use the Supabase dashboard to generate types.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Add your table types here
      // Example:
      // user_roles: {
      //   Row: {
      //     id: string;
      //     user_id: string;
      //     role: "customer" | "professional" | "admin";
      //     created_at: string;
      //   };
      //   Insert: {
      //     id?: string;
      //     user_id: string;
      //     role: "customer" | "professional" | "admin";
      //     created_at?: string;
      //   };
      //   Update: {
      //     id?: string;
      //     user_id?: string;
      //     role?: "customer" | "professional" | "admin";
      //     created_at?: string;
      //   };
      // };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
