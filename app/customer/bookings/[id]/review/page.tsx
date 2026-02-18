"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { ReviewForm } from "@/components/customer/review-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface BookingDetails {
  id: string;
  service_id: string;
  professional_id: string;
  status: string;
  service: {
    name: string;
  };
  professional: {
    full_name: string;
  };
}

export default function ReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!authLoading && user && bookingId) {
      fetchBookingDetails();
    }
  }, [user, authLoading, bookingId]);

  const fetchBookingDetails = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();

      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(
          `
          id,
          service_id,
          professional_id,
          status,
          service:services(name),
          professional:profiles!bookings_professional_id_fkey(full_name)
        `
        )
        .eq("id", bookingId)
        .eq("customer_id", user.id)
        .single();

      if (fetchError) throw fetchError;

      if (data) {
        setBooking({
          id: data.id,
          service_id: data.service_id,
          professional_id: data.professional_id,
          status: data.status,
          service: data.service as any,
          professional: data.professional as any,
        });
      } else {
        setError("Booking not found");
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load booking details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSuccess = () => {
    setReviewSubmitted(true);
    setTimeout(() => {
      router.push(`/customer/bookings/${bookingId}`);
    }, 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || (!loading && !booking)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">
              {error || "Booking not found"}
            </h2>
            <p className="text-gray-600 mb-4">
              {error ||
                "The booking you're looking for doesn't exist or you don't have access to it."}
            </p>
            <Link href="/customer/bookings">
              <Button>Back to Bookings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  if (booking.status !== "completed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Cannot Review</h2>
            <p className="text-gray-600 mb-4">
              You can only review completed bookings.
            </p>
            <Link href={`/customer/bookings/${bookingId}`}>
              <Button>Back to Booking</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (reviewSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Review Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Thank you for your feedback. Your review has been submitted
              successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to booking details...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link href={`/customer/bookings/${bookingId}`}>
        <Button variant="outline" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Booking
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Write a Review</h1>
        <div className="text-gray-600">
          <p>
            <strong>Service:</strong> {booking.service?.name || "Service"}
          </p>
          <p>
            <strong>Professional:</strong>{" "}
            {booking.professional?.full_name || "Professional"}
          </p>
        </div>
      </div>

      <ReviewForm
        bookingId={booking.id}
        serviceId={booking.service_id}
        professionalId={booking.professional_id}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
