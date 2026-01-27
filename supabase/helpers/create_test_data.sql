-- ============================================
-- Helper: Create Complete Test Data
-- ============================================
-- This script creates all necessary test data for the platform
-- Run this before creating test bookings

-- Step 1: Create customer profile
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  id,
  'customer',
  'Test Customer',
  '+1234567890'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'customer')
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create professional profile
INSERT INTO profiles (id, role, full_name, phone, hourly_rate, experience_years)
SELECT 
  id,
  'professional',
  'Test Professional',
  '+1234567891',
  500.00,
  5
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'professional')
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Step 3: Create services
INSERT INTO services (name, category, base_price, duration_minutes, description)
VALUES 
  ('Home Cleaning', 'Cleaning', 500.00, 120, 'Complete home cleaning service'),
  ('Plumbing Repair', 'Plumbing', 800.00, 60, 'Fix leaks and plumbing issues'),
  ('Electrical Work', 'Electrical', 1000.00, 90, 'Electrical repairs and installations')
ON CONFLICT DO NOTHING;

-- Step 4: Link professional to services
INSERT INTO professional_services (professional_id, service_id, price, duration_minutes)
SELECT 
  (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1),
  s.id,
  s.base_price,
  s.duration_minutes
FROM services s
WHERE NOT EXISTS (
  SELECT 1 FROM professional_services ps
  WHERE ps.professional_id = (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1)
    AND ps.service_id = s.id
)
ON CONFLICT DO NOTHING;

-- Step 5: Create address for customer
INSERT INTO addresses (user_id, label, address_line1, city, state, postal_code, country, is_default)
SELECT 
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
  'Home',
  '123 Test Street',
  'Mumbai',
  'Maharashtra',
  '400001',
  'India',
  true
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'customer')
  AND NOT EXISTS (
    SELECT 1 FROM addresses 
    WHERE user_id = (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1)
  )
ON CONFLICT DO NOTHING;

-- Step 6: Create availability slots for professional
INSERT INTO availability_slots (professional_id, start_time, end_time, status)
SELECT 
  (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1),
  NOW() + INTERVAL '1 day' + (n || ' hours')::INTERVAL,
  NOW() + INTERVAL '1 day' + ((n + 2) || ' hours')::INTERVAL,
  'available'
FROM generate_series(9, 17, 2) AS n  -- Creates slots from 9 AM to 5 PM
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'professional')
ON CONFLICT DO NOTHING;

-- Verify all data was created
SELECT 
  'Profiles' as table_name,
  COUNT(*) FILTER (WHERE role = 'customer') as customers,
  COUNT(*) FILTER (WHERE role = 'professional') as professionals
FROM profiles
UNION ALL
SELECT 
  'Services' as table_name,
  COUNT(*)::text as services,
  NULL as professionals
FROM services
UNION ALL
SELECT 
  'Professional Services' as table_name,
  COUNT(*)::text as linked_services,
  NULL as professionals
FROM professional_services
UNION ALL
SELECT 
  'Addresses' as table_name,
  COUNT(*)::text as addresses,
  NULL as professionals
FROM addresses
UNION ALL
SELECT 
  'Availability Slots' as table_name,
  COUNT(*)::text as slots,
  NULL as professionals
FROM availability_slots;
