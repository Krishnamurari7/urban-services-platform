-- ============================================
-- Helper Queries to Get UUIDs from Database
-- ============================================
-- Use these queries to get actual UUIDs for testing

-- Get your current authenticated user UUID
SELECT 
  auth.uid() as current_user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as current_user_email;

-- Get all user UUIDs with their emails
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- Get all profile UUIDs with roles
SELECT 
  id,
  role,
  full_name,
  (SELECT email FROM auth.users WHERE id = profiles.id) as email
FROM profiles
ORDER BY created_at DESC;

-- Get customer UUIDs
SELECT 
  id,
  full_name,
  (SELECT email FROM auth.users WHERE id = profiles.id) as email
FROM profiles
WHERE role = 'customer'
ORDER BY created_at DESC;

-- Get professional UUIDs
SELECT 
  id,
  full_name,
  rating_average,
  (SELECT email FROM auth.users WHERE id = profiles.id) as email
FROM profiles
WHERE role = 'professional'
ORDER BY rating_average DESC NULLS LAST;

-- Get service UUIDs
SELECT 
  id,
  name,
  category,
  base_price
FROM services
ORDER BY created_at DESC;

-- Get address UUIDs for a specific user
-- Replace auth.uid() with a specific user UUID if needed
SELECT 
  id,
  label,
  city,
  state,
  is_default
FROM addresses
WHERE user_id = auth.uid()  -- Or use a specific UUID
ORDER BY is_default DESC, created_at DESC;

-- Get booking UUIDs
SELECT 
  id,
  customer_id,
  professional_id,
  service_id,
  status,
  scheduled_at
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- Quick reference: Get one UUID of each type for testing
SELECT 
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1) as sample_customer_id,
  (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1) as sample_professional_id,
  (SELECT id FROM services LIMIT 1) as sample_service_id,
  (SELECT id FROM addresses LIMIT 1) as sample_address_id;
