"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types/database";

interface UseRealtimeBookingsOptions {
  userId?: string;
  role?: "customer" | "professional";
  enabled?: boolean;
}

export function useRealtimeBookings({
  userId,
  role = "customer",
  enabled = true,
}: UseRealtimeBookingsOptions) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !userId) return;

    const supabase = createClient();

    // Fetch initial bookings
    const fetchBookings = async () => {
      let query = supabase.from("bookings").select("*");

      if (role === "customer") {
        query = query.eq("customer_id", userId);
      } else if (role === "professional") {
        query = query.eq("professional_id", userId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (!error && data) {
        setBookings(data as Booking[]);
      }
      setLoading(false);
    };

    fetchBookings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`bookings:${userId}:${role}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
          filter:
            role === "customer"
              ? `customer_id=eq.${userId}`
              : `professional_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setBookings((prev) => [payload.new as Booking, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setBookings((prev) =>
              prev.map((booking) =>
                booking.id === payload.new.id
                  ? (payload.new as Booking)
                  : booking
              )
            );
          } else if (payload.eventType === "DELETE") {
            setBookings((prev) =>
              prev.filter((booking) => booking.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, enabled]);

  return { bookings, loading };
}
