export type UserRole = "customer" | "professional" | "admin";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "on_the_way"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  imageUrl?: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  customerId: string;
  professionalId?: string;
  serviceId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  scheduledAt: string;
  address: Address;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  professionalId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
