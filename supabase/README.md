# Supabase Database Setup

This directory contains database migrations and schema documentation for the Urban Services Platform.

## Files

- `migrations/001_initial_schema.sql` - Initial database schema with all tables, indexes, triggers, and RLS policies
- `migrations/002_fix_rls_recursion.sql` - **IMPORTANT:** Fix for RLS infinite recursion issue (run after 001)
- `migrations/003_comprehensive_rls_policies.sql` - **RECOMMENDED:** Comprehensive strict RLS policies with role-based access control
- `SCHEMA_DOCUMENTATION.md` - Comprehensive documentation of the database schema
- `RLS_POLICIES.md` - Detailed documentation of all RLS policies and security rules

## Important: Working with UUIDs

All primary keys and foreign keys in this schema use UUID type. When writing SQL queries:

✅ **Correct:**
- `auth.uid()` - Gets current authenticated user's UUID
- `'550e8400-e29b-41d4-a716-446655440000'::uuid` - Valid UUID with type cast
- `gen_random_uuid()` - Generates a new UUID

❌ **Incorrect:**
- `'user-uuid-from-auth'` - This is a string, not a UUID
- `'customer-uuid'` - Placeholder strings won't work

**Quick UUID Reference:**
```sql
-- Get your current user UUID
SELECT auth.uid();

-- Generate a new UUID
SELECT gen_random_uuid();

-- View all user UUIDs
SELECT id, email FROM auth.users;

-- Convert string to UUID (if you have a valid UUID string)
SELECT '550e8400-e29b-41d4-a716-446655440000'::uuid;
```

## Quick Start

### 1. Run the Migration

**Option A: Using Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration
6. **IMPORTANT:** Run `migrations/002_fix_rls_recursion.sql` immediately after to fix RLS recursion issues
7. **RECOMMENDED:** Run `migrations/003_comprehensive_rls_policies.sql` for strict role-based security policies

**Option B: Using Supabase CLI**
```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

### 2. Verify the Schema

After running the migration, verify that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `profiles`
- `services`
- `professional_services`
- `addresses`
- `bookings`
- `payments`
- `reviews`
- `availability_slots`
- `admin_actions`

### 3. Check RLS Policies

Verify that Row Level Security is enabled:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
  'profiles', 'services', 'professional_services', 
  'addresses', 'bookings', 'payments', 'reviews', 
  'availability_slots', 'admin_actions'
);
```

All tables should have `rowsecurity = true`.

## Schema Overview

### Core Tables

1. **profiles** - User profiles (customer, professional, admin)
2. **services** - Service categories/types
3. **professional_services** - Many-to-many: professionals ↔ services
4. **addresses** - User addresses for service delivery
5. **bookings** - Service bookings/appointments
6. **payments** - Payment transactions
7. **reviews** - Customer reviews and ratings
8. **availability_slots** - Professional availability
9. **admin_actions** - Audit log for admin actions

### Key Features

- **Role-based access** with three user roles
- **Comprehensive indexing** for performance
- **Automatic triggers** for:
  - Rating calculations
  - Default address management
  - Availability slot updates
- **Row Level Security** policies for data protection
- **Enum types** for status fields
- **Foreign key constraints** for data integrity

## Testing the Schema

### Create a Test Profile

**Option 1: For the currently authenticated user**

⚠️ **Note:** `auth.uid()` only works when authenticated. In SQL Editor, you need to:
1. First get a user UUID (see Option 2 or 3 below)
2. Or use the Supabase Dashboard with an authenticated session

```sql
-- This uses the UUID of the currently authenticated user
-- ⚠️ auth.uid() returns NULL in SQL Editor if not authenticated
-- Use this in your application code or after authenticating
INSERT INTO profiles (id, role, full_name, phone)
VALUES (
  auth.uid(),  -- Gets the current user's UUID (NULL if not authenticated)
  'customer',
  'Test User',
  '+1234567890'
)
ON CONFLICT (id) DO NOTHING;
```

**To use auth.uid() in SQL Editor:**
1. First, get a user UUID: `SELECT id FROM auth.users LIMIT 1;`
2. Copy that UUID and use it in Option 2 below

**Option 2: For a specific user UUID (Recommended for SQL Editor)**

```sql
-- Step 1: First, get a user UUID from auth.users
SELECT id, email FROM auth.users LIMIT 1;

-- Step 2: Copy the UUID from Step 1 and use it here
-- Replace 'YOUR-USER-UUID-HERE' with the actual UUID from Step 1
INSERT INTO profiles (id, role, full_name, phone)
VALUES (
  'YOUR-USER-UUID-HERE'::uuid,  -- Replace with actual UUID from auth.users
  'customer',
  'Test User',
  '+1234567890'
)
ON CONFLICT (id) DO NOTHING;
```

**Quick one-liner to create profile for first user:**
```sql
-- Creates profile for the first user in auth.users
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  id,
  'customer',
  'Test User',
  '+1234567890'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)  -- Only if profile doesn't exist
LIMIT 1;
```

**Option 3: Generate a new UUID (For testing only)**

⚠️ **Warning:** This creates a profile with a UUID that doesn't exist in `auth.users`. 
This is only for testing and won't work with authentication.

```sql
-- Generate a new UUID for testing (not linked to auth.users)
INSERT INTO profiles (id, role, full_name, phone)
VALUES (
  gen_random_uuid(),  -- Generates a new UUID
  'customer',
  'Test User',
  '+1234567890'
);
```

**Better: Create user first, then profile**
```sql
-- Step 1: Create a user via Supabase Auth (Dashboard → Authentication → Add User)
-- OR use the Supabase Auth API to create a user first

-- Step 2: Then create the profile using the user's UUID
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  id,
  'customer',
  'Test User',
  '+1234567890'
FROM auth.users
WHERE email = 'user@example.com'  -- Replace with actual email
  AND id NOT IN (SELECT id FROM profiles)
LIMIT 1;
```

**Get existing user UUIDs:**

```sql
-- View all users in auth.users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

**💡 Quick Solution for SQL Editor:**

Since `auth.uid()` returns NULL in SQL Editor, use this one-liner:

```sql
-- Creates profile for the first user in auth.users (if profile doesn't exist)
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  id,
  'customer',
  'Test User',
  '+1234567890'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
LIMIT 1
ON CONFLICT (id) DO NOTHING;
```

**💡 Tip:** 
- See `helpers/get_uuids.sql` for helper queries to get UUIDs
- See `helpers/create_profile.sql` for multiple ways to create profiles

### Create a Test Service

```sql
INSERT INTO services (name, category, base_price, duration_minutes)
VALUES (
  'Home Cleaning',
  'Cleaning',
  500.00,
  120
);
```

### Create a Test Booking

⚠️ **Prerequisites:** You need to have:
1. At least one customer profile
2. At least one professional profile  
3. At least one service
4. At least one address

**Step 1: Check if you have the required data**

```sql
-- Check if you have all required data
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as customer_count,
  (SELECT COUNT(*) FROM profiles WHERE role = 'professional') as professional_count,
  (SELECT COUNT(*) FROM services) as service_count,
  (SELECT COUNT(*) FROM addresses) as address_count;
```

**Step 2: Create a booking (only if all counts > 0)**

```sql
-- This will only work if all subqueries return a value
-- ⚠️ IMPORTANT: Run this check first to see what data you have
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'professional') as professionals,
  (SELECT COUNT(*) FROM services) as services,
  (SELECT COUNT(*) FROM addresses) as addresses;

-- If any count is 0, you need to create that data first!
-- Use the queries below or run: helpers/create_test_data.sql

-- Create booking (only works if all data exists)
INSERT INTO bookings (
  customer_id,
  professional_id,
  service_id,
  address_id,
  scheduled_at,
  total_amount,
  final_amount
)
SELECT 
  customer.id,
  professional.id,
  service.id,
  address.id,
  NOW() + INTERVAL '1 day',
  1000.00,
  1000.00
FROM (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1) customer
CROSS JOIN (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1) professional
CROSS JOIN (SELECT id FROM services LIMIT 1) service
CROSS JOIN (SELECT id FROM addresses LIMIT 1) address
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'customer')
  AND EXISTS (SELECT 1 FROM profiles WHERE role = 'professional')
  AND EXISTS (SELECT 1 FROM services)
  AND EXISTS (SELECT 1 FROM addresses);
```

**Alternative: Create test data first, then booking**

```sql
-- Step 1: Create a customer profile (if needed)
INSERT INTO profiles (id, role, full_name, phone)
SELECT id, 'customer', 'Test Customer', '+1234567890'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'customer')
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create a professional profile (if needed)
INSERT INTO profiles (id, role, full_name, phone)
SELECT id, 'professional', 'Test Professional', '+1234567891'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'professional')
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create a service (if needed)
INSERT INTO services (name, category, base_price, duration_minutes)
VALUES ('Home Cleaning', 'Cleaning', 500.00, 120)
ON CONFLICT DO NOTHING;

-- Step 4: Create an address (if needed)
INSERT INTO addresses (user_id, label, address_line1, city, state, postal_code, country)
SELECT 
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
  'Home',
  '123 Test Street',
  'Mumbai',
  'Maharashtra',
  '400001',
  'India'
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'customer')
ON CONFLICT DO NOTHING;

-- Step 5: Now create the booking
-- ⚠️ This will only work if you have customer, professional, service, and address
-- Use the improved query below that validates data exists first

-- First, check if you have all required data:
SELECT 
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'professional') as professionals,
  (SELECT COUNT(*) FROM services) as services,
  (SELECT COUNT(*) FROM addresses) as addresses;

-- Then create booking (only works if all data exists):
INSERT INTO bookings (
  customer_id,
  professional_id,
  service_id,
  address_id,
  scheduled_at,
  total_amount,
  final_amount
)
SELECT 
  customer.id,
  professional.id,
  service.id,
  address.id,
  NOW() + INTERVAL '1 day',
  1000.00,
  1000.00
FROM (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1) customer
CROSS JOIN (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1) professional
CROSS JOIN (SELECT id FROM services LIMIT 1) service
CROSS JOIN (SELECT id FROM addresses LIMIT 1) address
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'customer')
  AND EXISTS (SELECT 1 FROM profiles WHERE role = 'professional')
  AND EXISTS (SELECT 1 FROM services)
  AND EXISTS (SELECT 1 FROM addresses);

-- 💡 BEST SOLUTION: Run the complete setup script instead:
-- Copy and paste: supabase/helpers/setup_and_create_booking.sql
```

**Or with explicit UUIDs:**

⚠️ **Important:** You must replace the placeholder UUIDs with actual UUIDs from your database!

```sql
-- Step 1: Get the UUIDs first (RUN THIS FIRST)
SELECT 
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1) as customer_id,
  (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1) as professional_id,
  (SELECT id FROM services LIMIT 1) as service_id,
  (SELECT id FROM addresses LIMIT 1) as address_id;
```

**Copy the UUIDs from Step 1, then use them in Step 2:**

```sql
-- Step 2: Replace the UUIDs below with actual values from Step 1
-- Example: If Step 1 returned '550e8400-e29b-41d4-a716-446655440000', use that
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
  '550e8400-e29b-41d4-a716-446655440000'::uuid,  -- ⚠️ Replace with actual customer UUID
  '550e8400-e29b-41d4-a716-446655440001'::uuid,  -- ⚠️ Replace with actual professional UUID
  '550e8400-e29b-41d4-a716-446655440002'::uuid,  -- ⚠️ Replace with actual service UUID
  '550e8400-e29b-41d4-a716-446655440003'::uuid,  -- ⚠️ Replace with actual address UUID
  NOW() + INTERVAL '1 day',
  1000.00,
  1000.00
);
```

**💡 Better: Use automatic UUID selection (no manual replacement needed):**

```sql
-- This automatically uses the UUIDs - no manual replacement needed!
INSERT INTO bookings (
  customer_id,
  professional_id,
  service_id,
  address_id,
  scheduled_at,
  total_amount,
  final_amount
)
SELECT 
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1),
  (SELECT id FROM services LIMIT 1),
  (SELECT id FROM addresses LIMIT 1),
  NOW() + INTERVAL '1 day',
  1000.00,
  1000.00
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'customer')
  AND EXISTS (SELECT 1 FROM profiles WHERE role = 'professional')
  AND EXISTS (SELECT 1 FROM services)
  AND EXISTS (SELECT 1 FROM addresses);
```

**💡 Quick Setup: Create all test data first**

**Option 1: Quick Fix (Recommended)**
Run `helpers/quick_fix_booking.sql` - This creates customer, professional, service, and booking in one go.

**Option 2: Complete Setup**
Run `helpers/create_test_data.sql` to create all necessary test data, then use `helpers/create_booking.sql` to create a booking.

**Option 3: All-in-One**
Run `helpers/setup_and_create_booking.sql` - Complete setup script that handles everything.

## TypeScript Types

After running the migration, generate TypeScript types:

```bash
# Using Supabase CLI
supabase gen types typescript --project-id your-project-id > lib/types/database.ts
```

Or use the provided types in `lib/types/database.ts` which match the schema.

## Common Queries

### Get All Services for a Professional

```sql
-- Replace 'professional-uuid' with actual professional UUID
-- Or use auth.uid() if you're the professional
SELECT 
  ps.*,
  s.name as service_name,
  s.category
FROM professional_services ps
JOIN services s ON ps.service_id = s.id
WHERE ps.professional_id = auth.uid()  -- Current user's services
  AND ps.is_available = true;
```

**Or with explicit UUID:**

```sql
SELECT 
  ps.*,
  s.name as service_name,
  s.category
FROM professional_services ps
JOIN services s ON ps.service_id = s.id
WHERE ps.professional_id = '00000000-0000-0000-0000-000000000000'::uuid
  AND ps.is_available = true;
```

### Get Customer Bookings

```sql
-- Get bookings for the current authenticated user
SELECT 
  b.*,
  s.name as service_name,
  p.full_name as professional_name
FROM bookings b
JOIN services s ON b.service_id = s.id
JOIN profiles p ON b.professional_id = p.id
WHERE b.customer_id = auth.uid()  -- Current user's bookings
ORDER BY b.scheduled_at DESC;
```

**Or with explicit UUID:**

```sql
SELECT 
  b.*,
  s.name as service_name,
  p.full_name as professional_name
FROM bookings b
JOIN services s ON b.service_id = s.id
JOIN profiles p ON b.professional_id = p.id
WHERE b.customer_id = '00000000-0000-0000-0000-000000000000'::uuid
ORDER BY b.scheduled_at DESC;
```

### Get Available Time Slots

```sql
-- Get available slots for the current professional user
SELECT *
FROM availability_slots
WHERE professional_id = auth.uid()  -- Current user's availability
  AND status = 'available'
  AND start_time >= NOW()
  AND start_time <= NOW() + INTERVAL '7 days'
ORDER BY start_time;
```

**Or with explicit UUID:**

```sql
SELECT *
FROM availability_slots
WHERE professional_id = '00000000-0000-0000-0000-000000000000'::uuid
  AND status = 'available'
  AND start_time >= NOW()
  AND start_time <= NOW() + INTERVAL '7 days'
ORDER BY start_time;
```

### Get Professional Reviews

```sql
-- Get reviews for the current professional user
SELECT 
  r.*,
  p.full_name as customer_name,
  s.name as service_name
FROM reviews r
JOIN profiles p ON r.customer_id = p.id
JOIN services s ON r.service_id = s.id
WHERE r.professional_id = auth.uid()  -- Current user's reviews
  AND r.is_visible = true
ORDER BY r.created_at DESC;
```

**Or with explicit UUID:**

```sql
SELECT 
  r.*,
  p.full_name as customer_name,
  s.name as service_name
FROM reviews r
JOIN profiles p ON r.customer_id = p.id
JOIN services s ON r.service_id = s.id
WHERE r.professional_id = '00000000-0000-0000-0000-000000000000'::uuid
  AND r.is_visible = true
ORDER BY r.created_at DESC;
```

## Troubleshooting

### RLS Policies Not Working

If you're having issues with RLS policies:

1. Check that RLS is enabled:
   ```sql
   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
   ```

2. Verify your user is authenticated:
   ```sql
   SELECT auth.uid();
   ```

3. Test a policy directly:
   ```sql
-- Note: auth.uid() returns NULL in SQL Editor
-- Use this instead to test RLS policies:
SELECT * FROM profiles WHERE id = (SELECT id FROM auth.users LIMIT 1);
   ```

### Triggers Not Firing

Check if triggers exist:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```

### Indexes Not Being Used

Use `EXPLAIN ANALYZE` to check query plans:
```sql
-- Replace '550e8400-e29b-41d4-a716-446655440000' with an actual UUID
EXPLAIN ANALYZE SELECT * FROM bookings WHERE customer_id = '550e8400-e29b-41d4-a716-446655440000'::uuid;

-- Or use a subquery to get a real UUID:
EXPLAIN ANALYZE 
SELECT * FROM bookings 
WHERE customer_id = (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1);

```

## Next Steps

1. **Seed Data**: Create seed scripts for initial services
2. **Functions**: Add database functions for complex operations
3. **Views**: Create views for common queries
4. **Backups**: Set up automated backups
5. **Monitoring**: Set up query performance monitoring

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
