"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  orderId: string;
  amount: number;
  currency?: string;
  keyId: string;
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerContact?: string;
  onSuccess: (paymentId: string, orderId: string, signature: string) => void;
  onError: (error: string) => void;
}

export function RazorpayCheckout({
  orderId,
  amount,
  currency = "INR",
  keyId,
  bookingId,
  customerName,
  customerEmail,
  customerContact,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.Razorpay) {
      handlePayment();
    }
  }, [orderId]);

  const handlePayment = () => {
    if (!window.Razorpay) {
      onError("Razorpay SDK not loaded");
      return;
    }

    const options = {
      key: keyId,
      amount: amount, // Amount in paise
      currency: currency,
      name: "Urban Services Platform",
      description: `Payment for Booking #${bookingId.slice(0, 8)}`,
      order_id: orderId,
      handler: function (response: any) {
        // Verify payment signature on server
        onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerContact || "",
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: function () {
          onError("Payment cancelled by user");
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.Razorpay) {
            handlePayment();
          }
        }}
      />
    </>
  );
}
