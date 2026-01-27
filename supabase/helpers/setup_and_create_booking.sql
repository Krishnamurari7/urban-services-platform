-- ============================================
-- Complete Setup: Create All Data + Booking
-- ============================================
-- Run this entire script to create everything needed for a booking
-- This is a complete solution that handles missing data

-- Step 1: Check current data
SELECT 
  'Current Data Status' as info,
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'professional') as professionals,
  (SELECT COUNT(*) FROM services) as services,
  (SELECT COUNT(*) FROM addresses) as addresses;

-- Step 2: Create customer profile (if doesn't exist)
DO $$
DECLARE
  customer_uuid UUID;
BEGIN
  -- Get or create a user for customer
  SELECT id INTO customer_uuid
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'customer')
  LIMIT 1;
  
  IF customer_uuid IS NULL THEN
    -- If no user available, get any user
    SELECT id INTO customer_uuid FROM auth.users LIMIT 1;
  END IF;
  
  IF customer_uuid IS NOT NULL THEN
    INSERT INTO profiles (id, role, full_name, phone)
    VALUES (customer_uuid, 'customer', 'Test Customer', '+1234567890')
    ON CONFLICT (id) DO UPDATE SET role = 'customer';
  END IF;
END $$;

-- Step 3: Create professional profile (if doesn't exist)
DO $$
DECLARE
  professional_uuid UUID;
BEGIN
  -- Get a different user for professional
  SELECT id INTO professional_uuid
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'professional')
    AND id NOT IN (SELECT id FROM profiles WHERE role = 'customer')
  LIMIT 1;
  
  -- If no separate user, use a different approach
  IF professional_uuid IS NULL THEN
    SELECT id INTO professional_uuid
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'professional')
    LIMIT 1;
  END IF;
  
  IF professional_uuid IS NOT NULL THEN
    INSERT INTO profiles (id, role, full_name, phone, hourly_rate, experience_years)
    VALUES (professional_uuid, 'professional', 'Test Professional', '+1234567891', 500.00, 5)
    ON CONFLICT (id) DO UPDATE SET role = 'professional';
  END IF;
END $$;

-- Step 4: Create service (if doesn't exist)
INSERT INTO services (name, category, base_price, duration_minutes, description)
VALUES ('Home Cleaning', 'Cleaning', 500.00, 120, 'Complete home cleaning service')
ON CONFLICT DO NOTHING;

-- Step 5: Create address for customer (if doesn't exist)
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

-- Step 6: Link professional to service
INSERT INTO professional_services (professional_id, service_id, price, duration_minutes)
SELECT 
  p.id,
  s.id,
  s.base_price,
  s.duration_minutes
FROM profiles p
CROSS JOIN services s
WHERE p.role = 'professional'
  AND s.name = 'Home Cleaning'
  AND NOT EXISTS (
    SELECT 1 FROM professional_services ps
    WHERE ps.professional_id = p.id AND ps.service_id = s.id
  )
ON CONFLICT DO NOTHING;

-- Step 7: Verify all data exists
SELECT 
  'Data Verification' as info,
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'professional') as professionals,
  (SELECT COUNT(*) FROM services) as services,
  (SELECT COUNT(*) FROM addresses) as addresses,
  (SELECT COUNT(*) FROM professional_services) as professional_services;

-- Step 8: Create the booking
INSERT INTO bookings (
  customer_id,
  professional_id,
  service_id,
  address_id,
  scheduled_at,
  total_amount,
  service_fee,
  final_amount
)
SELECT 
  c.id,
  p.id,
  s.id,
  a.id,
  NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
  COALESCE(ps.price, s.base_price),
  100.00,
  COALESCE(ps.price, s.base_price) + 100.00
FROM profiles c
CROSS JOIN profiles p
CROSS JOIN services s
LEFT JOIN professional_services ps ON ps.professional_id = p.id AND ps.service_id = s.id
CROSS JOIN addresses a
WHERE c.role = 'customer'
  AND p.role = 'professional'
  AND s.name = 'Home Cleaning'
  AND a.user_id = c.id
LIMIT 1
ON CONFLICT DO NOTHING;

-- Step 9: Verify booking was created
SELECT 
  b.id,
  b.status,
  b.scheduled_at,
  b.final_amount,
  c.full_name as customer,
  p.full_name as professional,
  s.name as service
FROM bookings b
JOIN profiles c ON b.customer_id = c.id
JOIN profiles p ON b.professional_id = p.id
JOIN services s ON b.service_id = s.id
ORDER BY b.created_at DESC
LIMIT 1;
