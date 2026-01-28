"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types/database";

interface UseRealtimeBookingOptions {
  bookingId: string;
  enabled?: boolean;
}

export function useRealtimeBooking({
  bookingId,
  enabled = true,
}: UseRealtimeBookingOptions) {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled || !bookingId) return;

    const supabase = createClient();

    // Fetch initial booking
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (!error && data) {
        setBooking(data as Booking);
      }
      setLoading(false);
    };

    fetchBooking();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bookings",
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          setBooking(payload.new as Booking);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, enabled]);

  return { booking, loading };
}
