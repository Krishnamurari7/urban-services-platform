/**
 * Database types for Urban Services Platform
 * Generated to match the Supabase PostgreSQL schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// ENUM TYPES
// ============================================

export type UserRole = "customer" | "professional" | "admin";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentMethod =
  | "credit_card"
  | "debit_card"
  | "upi"
  | "wallet"
  | "net_banking"
  | "cash";

export type ServiceStatus = "active" | "inactive" | "suspended";

export type AvailabilityStatus = "available" | "booked" | "unavailable";

export type AdminActionType =
  | "user_suspended"
  | "user_activated"
  | "service_created"
  | "service_updated"
  | "service_deleted"
  | "booking_cancelled"
  | "payment_refunded"
  | "review_removed"
  | "other";

// ============================================
// DATABASE TYPES
// ============================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          bio: string | null;
          date_of_birth: string | null;
          is_verified: boolean;
          is_active: boolean;
          rating_average: number;
          total_reviews: number;
          experience_years: number | null;
          skills: string[] | null;
          hourly_rate: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          rating_average?: number;
          total_reviews?: number;
          experience_years?: number | null;
          skills?: string[] | null;
          hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          date_of_birth?: string | null;
          is_verified?: boolean;
          is_active?: boolean;
          rating_average?: number;
          total_reviews?: number;
          experience_years?: number | null;
          skills?: string[] | null;
          hourly_rate?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      services: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          subcategory: string | null;
          base_price: number;
          duration_minutes: number;
          image_url: string | null;
          status: ServiceStatus;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          subcategory?: string | null;
          base_price: number;
          duration_minutes: number;
          image_url?: string | null;
          status?: ServiceStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          subcategory?: string | null;
          base_price?: number;
          duration_minutes?: number;
          image_url?: string | null;
          status?: ServiceStatus;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      professional_services: {
        Row: {
          id: string;
          professional_id: string;
          service_id: string;
          price: number;
          duration_minutes: number | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          service_id: string;
          price: number;
          duration_minutes?: number | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          professional_id?: string;
          service_id?: string;
          price?: number;
          duration_minutes?: number | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          address_line1: string;
          address_line2: string | null;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          latitude: number | null;
          longitude: number | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          address_line1: string;
          address_line2?: string | null;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          label?: string;
          address_line1?: string;
          address_line2?: string | null;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          latitude?: number | null;
          longitude?: number | null;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          professional_id: string;
          service_id: string;
          professional_service_id: string | null;
          address_id: string;
          status: BookingStatus;
          scheduled_at: string;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          total_amount: number;
          service_fee: number;
          discount_amount: number;
          final_amount: number;
          special_instructions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          professional_id: string;
          service_id: string;
          professional_service_id?: string | null;
          address_id: string;
          status?: BookingStatus;
          scheduled_at: string;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          total_amount: number;
          service_fee?: number;
          discount_amount?: number;
          final_amount: number;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          professional_id?: string;
          service_id?: string;
          professional_service_id?: string | null;
          address_id?: string;
          status?: BookingStatus;
          scheduled_at?: string;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          total_amount?: number;
          service_fee?: number;
          discount_amount?: number;
          final_amount?: number;
          special_instructions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          amount: number;
          status: PaymentStatus;
          method: PaymentMethod;
          transaction_id: string | null;
          payment_gateway: string | null;
          gateway_response: Json | null;
          refund_amount: number;
          refund_reason: string | null;
          refunded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          amount: number;
          status?: PaymentStatus;
          method: PaymentMethod;
          transaction_id?: string | null;
          payment_gateway?: string | null;
          gateway_response?: Json | null;
          refund_amount?: number;
          refund_reason?: string | null;
          refunded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          customer_id?: string;
          amount?: number;
          status?: PaymentStatus;
          method?: PaymentMethod;
          transaction_id?: string | null;
          payment_gateway?: string | null;
          gateway_response?: Json | null;
          refund_amount?: number;
          refund_reason?: string | null;
          refunded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          professional_id: string;
          service_id: string;
          rating: number;
          comment: string | null;
          is_verified: boolean;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          customer_id: string;
          professional_id: string;
          service_id: string;
          rating: number;
          comment?: string | null;
          is_verified?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          customer_id?: string;
          professional_id?: string;
          service_id?: string;
          rating?: number;
          comment?: string | null;
          is_verified?: boolean;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      availability_slots: {
        Row: {
          id: string;
          professional_id: string;
          start_time: string;
          end_time: string;
          status: AvailabilityStatus;
          booking_id: string | null;
          is_recurring: boolean;
          recurrence_pattern: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          start_time: string;
          end_time: string;
          status?: AvailabilityStatus;
          booking_id?: string | null;
          is_recurring?: boolean;
          recurrence_pattern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          professional_id?: string;
          start_time?: string;
          end_time?: string;
          status?: AvailabilityStatus;
          booking_id?: string | null;
          is_recurring?: boolean;
          recurrence_pattern?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          action_type: AdminActionType;
          target_type: string | null;
          target_id: string | null;
          description: string;
          metadata: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action_type: AdminActionType;
          target_type?: string | null;
          target_id?: string | null;
          description: string;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action_type?: AdminActionType;
          target_type?: string | null;
          target_id?: string | null;
          description?: string;
          metadata?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      professional_documents: {
        Row: {
          id: string;
          professional_id: string;
          document_type: string;
          document_name: string;
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          status: "pending" | "approved" | "rejected";
          rejection_reason: string | null;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          document_type: string;
          document_name: string;
          file_url: string;
          file_size?: number | null;
          mime_type?: string | null;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          professional_id?: string;
          document_type?: string;
          document_name?: string;
          file_url?: string;
          file_size?: number | null;
          mime_type?: string | null;
          status?: "pending" | "approved" | "rejected";
          rejection_reason?: string | null;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      professional_bank_accounts: {
        Row: {
          id: string;
          professional_id: string;
          account_holder_name: string;
          account_number: string;
          ifsc_code: string;
          bank_name: string;
          branch_name: string | null;
          account_type: "savings" | "current";
          is_primary: boolean;
          is_verified: boolean;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          professional_id: string;
          account_holder_name: string;
          account_number: string;
          ifsc_code: string;
          bank_name: string;
          branch_name?: string | null;
          account_type?: "savings" | "current";
          is_primary?: boolean;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          professional_id?: string;
          account_holder_name?: string;
          account_number?: string;
          ifsc_code?: string;
          bank_name?: string;
          branch_name?: string | null;
          account_type?: "savings" | "current";
          is_primary?: boolean;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      homepage_banners: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          image_url: string;
          link_url: string | null;
          link_text: string | null;
          position: number;
          is_active: boolean;
          start_date: string | null;
          end_date: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          image_url: string;
          link_url?: string | null;
          link_text?: string | null;
          position?: number;
          is_active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          image_url?: string;
          link_url?: string | null;
          link_text?: string | null;
          position?: number;
          is_active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
      payment_method: PaymentMethod;
      service_status: ServiceStatus;
      availability_status: AvailabilityStatus;
      admin_action_type: AdminActionType;
    };
  };
}

// Helper types for common queries
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Service = Database["public"]["Tables"]["services"]["Row"];
export type ProfessionalService =
  Database["public"]["Tables"]["professional_services"]["Row"];
export type Address = Database["public"]["Tables"]["addresses"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type AvailabilitySlot =
  Database["public"]["Tables"]["availability_slots"]["Row"];
export type AdminAction = Database["public"]["Tables"]["admin_actions"]["Row"];
export type ProfessionalDocument =
  Database["public"]["Tables"]["professional_documents"]["Row"];
export type ProfessionalBankAccount =
  Database["public"]["Tables"]["professional_bank_accounts"]["Row"];
export type HomepageBanner =
  Database["public"]["Tables"]["homepage_banners"]["Row"];
