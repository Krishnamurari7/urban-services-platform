"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type {
  Service,
  Address,
  Profile,
  ProfessionalService,
} from "@/lib/types/database";
import { LoadingBar } from "@/components/ui/loading-bar";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  MapPin,
  CreditCard,
  Package,
} from "lucide-react";

type BookingStep =
  | "service"
  | "professional"
  | "datetime"
  | "address"
  | "review"
  | "payment";

interface BookingFormData {
  serviceId: string;
  professionalId: string;
  professionalServiceId: string | null;
  scheduledAt: string;
  addressId: string;
  specialInstructions: string;
  totalAmount: number;
  serviceFee: number;
  discountAmount: number;
  finalAmount: number;
}

export default function BookServicePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<BookingStep>("service");
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<
    (Profile & { professionalService?: ProfessionalService })[]
  >([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    serviceId: "",
    professionalId: "",
    professionalServiceId: null,
    scheduledAt: "",
    addressId: "",
    specialInstructions: "",
    totalAmount: 0,
    serviceFee: 50,
    discountAmount: 0,
    finalAmount: 0,
  });

  const steps: { id: BookingStep; label: string; icon: React.ReactNode }[] = [
    {
      id: "service",
      label: "Select Service",
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "professional",
      label: "Choose Professional",
      icon: <Check className="h-4 w-4" />,
    },
    {
      id: "datetime",
      label: "Date & Time",
      icon: <Calendar className="h-4 w-4" />,
    },
    { id: "address", label: "Address", icon: <MapPin className="h-4 w-4" /> },
    { id: "review", label: "Review", icon: <Check className="h-4 w-4" /> },
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="h-4 w-4" />,
    },
  ];

  useEffect(() => {
    if (!authLoading && user) {
      fetchInitialData();
    }
  }, [user, authLoading]);

  // Handle serviceId from query params
  useEffect(() => {
    const serviceId = searchParams.get("serviceId");
    if (serviceId && services.length > 0 && !formData.serviceId) {
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        setFormData((prev) => ({
          ...prev,
          serviceId: service.id,
          totalAmount: Number(service.base_price),
          finalAmount:
            Number(service.base_price) + prev.serviceFee - prev.discountAmount,
        }));
        fetchProfessionals(service.id);
        setCurrentStep("professional");
      }
    }
  }, [searchParams, services, formData.serviceId]);

  const fetchInitialData = async () => {
    if (!user) return;

    try {
      const supabase = createClient();

      // Fetch services
      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (servicesData) {
        setServices(servicesData);
      }

      // Fetch addresses
      const { data: addressesData } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (addressesData) {
        setAddresses(addressesData);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async (serviceId: string) => {
    try {
      const supabase = createClient();

      // First get professional services
      const { data: professionalServices, error: psError } = await supabase
        .from("professional_services")
        .select("*")
        .eq("service_id", serviceId)
        .eq("is_available", true);

      if (psError) throw psError;

      if (!professionalServices || professionalServices.length === 0) {
        setProfessionals([]);
        return;
      }

      // Get professional IDs
      const professionalIds = professionalServices.map(
        (ps) => ps.professional_id
      );

      // Fetch professional profiles
      const { data: professionalsData, error: profError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", professionalIds)
        .eq("role", "professional")
        .eq("is_active", true);

      if (profError) throw profError;

      // Combine data
      if (professionalsData) {
        const professionalsList = professionalsData.map((prof) => {
          const profService = professionalServices.find(
            (ps) => ps.professional_id === prof.id
          );
          return {
            ...prof,
            professionalService: profService,
          };
        });
        setProfessionals(professionalsList);
      }
    } catch (error) {
      console.error("Error fetching professionals:", error);
      setProfessionals([]);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setFormData((prev) => ({
      ...prev,
      serviceId: service.id,
      totalAmount: Number(service.base_price),
      finalAmount:
        Number(service.base_price) + prev.serviceFee - prev.discountAmount,
    }));
    fetchProfessionals(service.id);
    setCurrentStep("professional");
  };

  const handleProfessionalSelect = (
    professional: Profile & { professionalService?: ProfessionalService }
  ) => {
    const price = professional.professionalService
      ? Number(professional.professionalService.price)
      : formData.totalAmount;

    setFormData((prev) => ({
      ...prev,
      professionalId: professional.id,
      professionalServiceId: professional.professionalService?.id || null,
      totalAmount: price,
      finalAmount: price + prev.serviceFee - prev.discountAmount,
    }));
    setCurrentStep("datetime");
  };

  const handleDateTimeSelect = (dateTime: string) => {
    setFormData((prev) => ({
      ...prev,
      scheduledAt: dateTime,
    }));
    setCurrentStep("address");
  };

  const handleAddressSelect = (addressId: string) => {
    setFormData((prev) => ({
      ...prev,
      addressId,
    }));
    setCurrentStep("review");
  };

  const handlePayment = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      const supabase = createClient();

      // First create the booking
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          professional_id: formData.professionalId,
          service_id: formData.serviceId,
          professional_service_id: formData.professionalServiceId,
          address_id: formData.addressId,
          scheduled_at: formData.scheduledAt,
          total_amount: formData.totalAmount,
          service_fee: formData.serviceFee,
          discount_amount: formData.discountAmount,
          final_amount: formData.finalAmount,
          special_instructions: formData.specialInstructions || null,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Create Razorpay order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingData.id,
          amount: formData.finalAmount,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay checkout
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: "Urban Services Platform",
          description: `Payment for Booking #${bookingData.id.slice(0, 8)}`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            // Verify payment on server
            const verifyResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                bookingId: bookingData.id,
              }),
            });

            if (verifyResponse.ok) {
              router.push(
                `/customer/bookings/${bookingData.id}?payment=success`
              );
            } else {
              const errorData = await verifyResponse.json();
              alert(`Payment verification failed: ${errorData.error}`);
              router.push(
                `/customer/bookings/${bookingData.id}?payment=failed`
              );
            }
          },
          prefill: {
            name:
              user.user_metadata?.full_name || user.email?.split("@")[0] || "",
            email: user.email || "",
          },
          theme: {
            color: "#2563eb",
          },
          modal: {
            ondismiss: function () {
              alert(
                "Payment cancelled. Booking created but payment is pending."
              );
              router.push(`/customer/bookings/${bookingData.id}`);
            },
          },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } else {
        // Load Razorpay script dynamically
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          const options = {
            key: orderData.key,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "Urban Services Platform",
            description: `Payment for Booking #${bookingData.id.slice(0, 8)}`,
            order_id: orderData.orderId,
            handler: async function (response: any) {
              const verifyResponse = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  bookingId: bookingData.id,
                }),
              });

              if (verifyResponse.ok) {
                router.push(
                  `/customer/bookings/${bookingData.id}?payment=success`
                );
              } else {
                const errorData = await verifyResponse.json();
                alert(`Payment verification failed: ${errorData.error}`);
                router.push(
                  `/customer/bookings/${bookingData.id}?payment=failed`
                );
              }
            },
            prefill: {
              name:
                user.user_metadata?.full_name ||
                user.email?.split("@")[0] ||
                "",
              email: user.email || "",
            },
            theme: {
              color: "#2563eb",
            },
            modal: {
              ondismiss: function () {
                alert(
                  "Payment cancelled. Booking created but payment is pending."
                );
                router.push(`/customer/bookings/${bookingData.id}`);
              },
            },
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        };
        document.body.appendChild(script);
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      alert(
        `Failed to process payment: ${error.message || "Please try again."}`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    // This will now trigger payment flow
    await handlePayment();
  };

  const getSelectedService = () =>
    services.find((s) => s.id === formData.serviceId);
  const getSelectedProfessional = () =>
    professionals.find((p) => p.id === formData.professionalId);
  const getSelectedAddress = () =>
    addresses.find((a) => a.id === formData.addressId);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <LoadingBar text="Vera Company" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">Book a Service</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        {/* Mobile: Simplified step indicator */}
        <div className="md:hidden mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              Step {steps.findIndex((s) => s.id === currentStep) + 1} of {steps.length}
            </span>
            <span className="text-sm font-semibold text-[#2563EB]">
              {steps.find((s) => s.id === currentStep)?.label}
            </span>
          </div>
          <div className="mt-2 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2563EB] transition-all duration-300"
              style={{
                width: `${((steps.findIndex((s) => s.id === currentStep) + 1) / steps.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Desktop: Full step indicator */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => {
            const stepIndex = steps.findIndex((s) => s.id === currentStep);
            const isActive = step.id === currentStep;
            const isCompleted = stepIndex > index;

            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      isActive
                        ? "bg-[#2563EB] text-white border-[#2563EB]"
                        : isCompleted
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white border-gray-300 text-gray-400"
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : step.icon}
                  </div>
                  <span
                    className={`text-xs mt-2 ${isActive ? "font-semibold" : ""}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === "service" && (
            <div>
              <CardTitle className="mb-4 text-lg sm:text-xl">Select a Service</CardTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="border rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="relative h-40 w-full overflow-hidden bg-muted">
                      {service.image_url ? (
                        <Image
                          src={service.image_url}
                          alt={service.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                          <span className="text-4xl font-bold text-primary/30">
                            {service.name[0]}
                          </span>
                        </div>
                      )}
                      <Badge className="absolute right-3 top-3 capitalize shadow-md">
                        {service.category}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-3">
                        <span className="font-bold text-lg">
                          ₹{Number(service.base_price).toFixed(2)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {service.duration_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === "professional" && (
            <div>
              <CardTitle className="mb-4 text-lg sm:text-xl">Choose a Professional</CardTitle>
              {professionals.length === 0 ? (
                <p className="text-gray-500">
                  No professionals available for this service.
                </p>
              ) : (
                <div className="space-y-4">
                  {professionals.map((professional) => (
                    <div
                      key={professional.id}
                      onClick={() => handleProfessionalSelect(professional)}
                      className="p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {professional.full_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Rating:{" "}
                            {Number(professional.rating_average).toFixed(1)} (
                            {professional.total_reviews} reviews)
                          </p>
                          {professional.experience_years && (
                            <p className="text-sm text-gray-600">
                              {professional.experience_years} years experience
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ₹
                            {professional.professionalService
                              ? Number(
                                  professional.professionalService.price
                                ).toFixed(2)
                              : getSelectedService()
                                ? Number(
                                    getSelectedService()!.base_price
                                  ).toFixed(2)
                                : "0.00"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setCurrentStep("service")}
                className="mt-4"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}

          {currentStep === "datetime" && (
            <div>
              <CardTitle className="mb-4 text-lg sm:text-xl">Select Date & Time</CardTitle>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        scheduledAt: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        specialInstructions: e.target.value,
                      }))
                    }
                    placeholder="Any special requirements or instructions..."
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("professional")}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (formData.scheduledAt) {
                      handleDateTimeSelect(formData.scheduledAt);
                    } else {
                      alert("Please select a date and time");
                    }
                  }}
                  className="ml-auto"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === "address" && (
            <div>
              <CardTitle className="mb-4 text-lg sm:text-xl">Select Address</CardTitle>
              {addresses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No addresses found.</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/customer/profile")}
                  >
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      onClick={() => handleAddressSelect(address.id)}
                      className={`p-4 border rounded-lg cursor-pointer hover:border-blue-500 hover:shadow-md transition-all ${
                        formData.addressId === address.id
                          ? "border-[#2563EB] bg-[#DBEAFE]"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{address.label}</h3>
                            {address.is_default && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.address_line1}
                            {address.address_line2 &&
                              `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state}{" "}
                            {address.postal_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => router.push("/customer/profile")}
                    className="w-full"
                  >
                    + Add New Address
                  </Button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setCurrentStep("datetime")}
                className="mt-4"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}

          {currentStep === "review" && (
            <div>
              <CardTitle className="mb-4 text-lg sm:text-xl">Review Your Booking</CardTitle>
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Service Details</h3>
                  <p className="text-sm text-gray-600">
                    <strong>Service:</strong> {getSelectedService()?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Professional:</strong>{" "}
                    {getSelectedProfessional()?.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Date & Time:</strong>{" "}
                    {new Date(formData.scheduledAt).toLocaleString()}
                  </p>
                </div>

                <div className="border-b pb-4">
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-sm text-gray-600">
                    {getSelectedAddress()?.label}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getSelectedAddress()?.address_line1}
                    {getSelectedAddress()?.address_line2 &&
                      `, ${getSelectedAddress()?.address_line2}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {getSelectedAddress()?.city}, {getSelectedAddress()?.state}{" "}
                    {getSelectedAddress()?.postal_code}
                  </p>
                </div>

                {formData.specialInstructions && (
                  <div className="border-b pb-4">
                    <h3 className="font-semibold mb-2">Special Instructions</h3>
                    <p className="text-sm text-gray-600">
                      {formData.specialInstructions}
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Service Amount:</span>
                    <span>₹{formData.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Service Fee:</span>
                    <span>₹{formData.serviceFee.toFixed(2)}</span>
                  </div>
                  {formData.discountAmount > 0 && (
                    <div className="flex justify-between mb-2 text-green-600">
                      <span>Discount:</span>
                      <span>-₹{formData.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{formData.finalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("address")}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep("payment")}
                  className="ml-auto"
                >
                  Proceed to Payment
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === "payment" && (
            <div>
              <CardTitle className="mb-4 text-lg sm:text-xl">Payment</CardTitle>
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Payment Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Amount:</span>
                      <span className="font-semibold">
                        ₹{formData.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Fee:</span>
                      <span className="font-semibold">
                        ₹{formData.serviceFee.toFixed(2)}
                      </span>
                    </div>
                    {formData.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₹{formData.discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total Amount:</span>
                        <span>₹{formData.finalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#DBEAFE] border border-[#93C5FD] rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Secure Payment:</strong> You will be redirected to
                    Razorpay's secure payment gateway to complete your payment.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep("review")}
                  disabled={submitting}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="ml-auto"
                >
                  {submitting ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
