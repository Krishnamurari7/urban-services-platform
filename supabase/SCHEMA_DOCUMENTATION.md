# Database Schema Documentation

This document describes the PostgreSQL database schema for the Urban Services Platform.

## Overview

The schema is designed for a service marketplace platform similar to Urban Company, supporting three user roles: **Customer**, **Professional**, and **Admin**.

## Table Structure

### 1. `profiles`
User profiles linked to Supabase Auth users.

**Key Fields:**
- `id` (UUID, PK) - References `auth.users(id)`
- `role` (enum) - `customer`, `professional`, or `admin`
- `full_name`, `phone`, `avatar_url`, `bio`
- `rating_average` - Calculated from reviews (0-5)
- `total_reviews` - Count of visible reviews
- Professional-specific: `experience_years`, `skills[]`, `hourly_rate`

**Indexes:**
- `idx_profiles_role` - Filter by role
- `idx_profiles_is_active` - Filter active users
- `idx_profiles_rating` - Sort by rating

**RLS Policies:**
- Users can view/update their own profile
- Anyone can view active professionals
- Admins can view all profiles

---

### 2. `services`
Service categories/types available on the platform.

**Key Fields:**
- `id` (UUID, PK)
- `name`, `description`, `category`, `subcategory`
- `base_price` - Base price for the service
- `duration_minutes` - Expected service duration
- `status` - `active`, `inactive`, or `suspended`

**Indexes:**
- `idx_services_category` - Filter by category
- `idx_services_status` - Filter by status

**RLS Policies:**
- Anyone can view active services
- Admins can manage all services

---

### 3. `professional_services`
Many-to-many relationship between professionals and services they offer.

**Key Fields:**
- `id` (UUID, PK)
- `professional_id` (FK → profiles)
- `service_id` (FK → services)
- `price` - Professional's price for this service
- `duration_minutes` - Custom duration (optional)
- `is_available` - Whether this service is currently available

**Constraints:**
- Unique constraint on `(professional_id, service_id)`

**Indexes:**
- `idx_professional_services_professional` - Find all services for a professional
- `idx_professional_services_service` - Find all professionals for a service
- `idx_professional_services_available` - Filter available services

**RLS Policies:**
- Anyone can view available professional services
- Professionals can manage their own services

---

### 4. `addresses`
User addresses for service delivery locations.

**Key Fields:**
- `id` (UUID, PK)
- `user_id` (FK → profiles)
- `label` - e.g., "Home", "Office"
- `address_line1`, `address_line2`, `city`, `state`, `postal_code`, `country`
- `latitude`, `longitude` - For geolocation queries
- `is_default` - Only one default address per user (enforced by trigger)

**Indexes:**
- `idx_addresses_user` - Find all addresses for a user
- `idx_addresses_default` - Find default address
- `idx_addresses_location` - Geolocation queries

**Triggers:**
- `ensure_single_default_address_trigger` - Ensures only one default address per user

**RLS Policies:**
- Users can view/manage their own addresses

---

### 5. `bookings`
Service bookings/appointments.

**Key Fields:**
- `id` (UUID, PK)
- `customer_id` (FK → profiles)
- `professional_id` (FK → profiles)
- `service_id` (FK → services)
- `professional_service_id` (FK → professional_services, nullable)
- `address_id` (FK → addresses)
- `status` - `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`, `refunded`
- `scheduled_at` - When the service is scheduled
- `completed_at`, `cancelled_at` - Timestamps for status changes
- `total_amount`, `service_fee`, `discount_amount`, `final_amount` - Pricing breakdown
- `special_instructions` - Customer notes

**Constraints:**
- `scheduled_at` must be after `created_at`
- `completed_at` must be after `scheduled_at` (if set)

**Indexes:**
- Multiple indexes for filtering by customer, professional, service, status, and dates
- Composite indexes for common query patterns

**Triggers:**
- `update_availability_on_booking_change` - Updates availability slots when bookings are created/cancelled

**RLS Policies:**
- Customers can view/create/update their own bookings
- Professionals can view/update bookings assigned to them
- Admins can view all bookings

---

### 6. `payments`
Payment transactions linked to bookings.

**Key Fields:**
- `id` (UUID, PK)
- `booking_id` (FK → bookings)
- `customer_id` (FK → profiles)
- `amount` - Payment amount
- `status` - `pending`, `processing`, `completed`, `failed`, `refunded`, `cancelled`
- `method` - `credit_card`, `debit_card`, `upi`, `wallet`, `net_banking`, `cash`
- `transaction_id` - Unique transaction ID from payment gateway
- `payment_gateway` - e.g., "razorpay", "stripe"
- `gateway_response` - JSON response from payment gateway
- `refund_amount`, `refund_reason`, `refunded_at` - Refund information

**Indexes:**
- Indexes on booking_id, customer_id, status, transaction_id

**RLS Policies:**
- Customers can view their own payments
- Admins can view all payments

---

### 7. `reviews`
Customer reviews and ratings.

**Key Fields:**
- `id` (UUID, PK)
- `booking_id` (FK → bookings)
- `customer_id` (FK → profiles)
- `professional_id` (FK → profiles)
- `service_id` (FK → services)
- `rating` - 1-5 stars
- `comment` - Review text
- `is_verified` - Verified purchase
- `is_visible` - Can be hidden by admin

**Constraints:**
- Unique constraint on `(booking_id, customer_id)` - One review per booking
- Rating must be between 1 and 5

**Indexes:**
- Indexes on booking_id, customer_id, professional_id, service_id, rating
- Composite index for professional rating queries

**Triggers:**
- `update_professional_rating` - Automatically updates professional's `rating_average` and `total_reviews` when reviews are added/updated/deleted

**RLS Policies:**
- Anyone can view visible reviews
- Customers can create reviews for their completed bookings
- Customers can update their own reviews
- Admins can manage all reviews

---

### 8. `availability_slots`
Professional availability time slots.

**Key Fields:**
- `id` (UUID, PK)
- `professional_id` (FK → profiles)
- `start_time`, `end_time` - Time range
- `status` - `available`, `booked`, or `unavailable`
- `booking_id` (FK → bookings, nullable) - Linked booking if booked
- `is_recurring` - Whether this is a recurring slot
- `recurrence_pattern` - e.g., "daily", "weekly", "weekdays"

**Constraints:**
- `end_time` must be after `start_time`

**Indexes:**
- Indexes on professional_id, start_time, status, booking_id
- GIST index on time range for efficient time-based queries

**RLS Policies:**
- Professionals can view/manage their own availability
- Anyone can view available slots (for booking)

---

### 9. `admin_actions`
Audit log for administrative actions.

**Key Fields:**
- `id` (UUID, PK)
- `admin_id` (FK → profiles)
- `action_type` - Type of action (enum)
- `target_type` - e.g., "user", "booking", "service"
- `target_id` - ID of the target entity
- `description` - Human-readable description
- `metadata` - JSON for additional data
- `ip_address`, `user_agent` - Request metadata

**Indexes:**
- Indexes on admin_id, action_type, target, created_at

**RLS Policies:**
- Only admins can view/create admin actions

---

## Enum Types

### `user_role`
- `customer` - Service consumers
- `professional` - Service providers
- `admin` - Platform administrators

### `booking_status`
- `pending` - Awaiting confirmation
- `confirmed` - Confirmed by professional
- `in_progress` - Service in progress
- `completed` - Service completed
- `cancelled` - Booking cancelled
- `refunded` - Payment refunded

### `payment_status`
- `pending` - Payment initiated
- `processing` - Payment being processed
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded
- `cancelled` - Payment cancelled

### `payment_method`
- `credit_card`
- `debit_card`
- `upi`
- `wallet`
- `net_banking`
- `cash`

### `service_status`
- `active` - Available for booking
- `inactive` - Temporarily unavailable
- `suspended` - Suspended by admin

### `availability_status`
- `available` - Slot is available
- `booked` - Slot is booked
- `unavailable` - Slot is unavailable

### `admin_action_type`
- `user_suspended`
- `user_activated`
- `service_created`
- `service_updated`
- `service_deleted`
- `booking_cancelled`
- `payment_refunded`
- `review_removed`
- `other`

---

## Triggers

### 1. `update_updated_at_column()`
Automatically updates the `updated_at` timestamp on all tables when rows are updated.

### 2. `update_professional_rating()`
Automatically recalculates and updates a professional's `rating_average` and `total_reviews` when:
- A review is inserted
- A review is updated (rating or visibility changed)
- A review is deleted

### 3. `ensure_single_default_address()`
Ensures only one address per user can be marked as default. When a new default address is set, all other addresses for that user are set to `is_default = false`.

### 4. `update_availability_on_booking_change()`
Automatically updates availability slot status when:
- A booking is created - marks the slot as `booked`
- A booking is cancelled - marks the slot as `available`

---

## Row Level Security (RLS)

All tables have RLS enabled with policies that enforce:

1. **Users can only access their own data** (profiles, addresses, bookings, payments)
2. **Professionals can manage their own services and availability**
3. **Public data is viewable by all** (active services, available professional services, visible reviews)
4. **Admins have full access** to all tables
5. **Role-based restrictions** prevent unauthorized actions

---

## Indexes

The schema includes comprehensive indexing for:
- Foreign key lookups
- Status filtering
- Date range queries
- Geolocation queries (addresses)
- Time range queries (availability slots)
- Composite queries (common query patterns)

---

## Usage Examples

### Create a Profile
```sql
INSERT INTO profiles (id, role, full_name, phone)
VALUES (auth.uid(), 'customer', 'John Doe', '+1234567890');
```

### Create a Booking
```sql
INSERT INTO bookings (
  customer_id,
  professional_id,
  service_id,
  address_id,
  scheduled_at,
  total_amount,
  final_amount
)
VALUES (
  'customer-uuid',
  'professional-uuid',
  'service-uuid',
  'address-uuid',
  '2024-12-25 10:00:00+00',
  1000.00,
  1000.00
);
```

### Get Professional Services
```sql
SELECT ps.*, s.name, s.category
FROM professional_services ps
JOIN services s ON ps.service_id = s.id
WHERE ps.professional_id = 'professional-uuid'
  AND ps.is_available = true;
```

### Get Available Time Slots
```sql
SELECT *
FROM availability_slots
WHERE professional_id = 'professional-uuid'
  AND status = 'available'
  AND start_time >= NOW()
  AND start_time <= NOW() + INTERVAL '7 days';
```

---

## Migration Instructions

1. Connect to your Supabase project
2. Navigate to SQL Editor
3. Run the migration file: `supabase/migrations/001_initial_schema.sql`
4. Verify all tables, indexes, and policies were created successfully

---

## Next Steps

1. **Seed Data**: Create seed scripts for initial services and test data
2. **Functions**: Add database functions for complex queries
3. **Views**: Create views for common query patterns
4. **Materialized Views**: For analytics and reporting
5. **Full-Text Search**: Add search capabilities for services and professionals
