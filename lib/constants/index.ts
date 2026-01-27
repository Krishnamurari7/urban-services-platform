export const USER_ROLES = {
  CUSTOMER: "customer",
  PROFESSIONAL: "professional",
  ADMIN: "admin",
} as const;

export const BOOKING_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  ON_THE_WAY: "on_the_way",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const SERVICE_CATEGORIES = [
  "AC Repair",
  "Cleaning",
  "Salon",
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Appliance Repair",
] as const;

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  CUSTOMER_DASHBOARD: "/customer/dashboard",
  CUSTOMER_BOOKINGS: "/customer/bookings",
  CUSTOMER_SERVICES: "/customer/services",
  PROFESSIONAL_DASHBOARD: "/professional/dashboard",
  PROFESSIONAL_JOBS: "/professional/jobs",
  ADMIN_DASHBOARD: "/admin/dashboard",
} as const;
