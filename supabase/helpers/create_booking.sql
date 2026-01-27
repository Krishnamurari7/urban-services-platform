-- ============================================
-- Helper: Create a Test Booking
-- ============================================
-- Use this after running create_test_data.sql

-- Method 1: Create booking with automatic selection (recommended)
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
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1),
  (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1),
  (SELECT id FROM services LIMIT 1),
  (SELECT id FROM addresses LIMIT 1),
  NOW() + INTERVAL '1 day' + INTERVAL '10 hours',  -- Tomorrow at 10 AM
  (SELECT base_price FROM services LIMIT 1),
  100.00,  -- Service fee
  (SELECT base_price FROM services LIMIT 1) + 100.00  -- Total + fee
WHERE EXISTS (SELECT 1 FROM profiles WHERE role = 'customer')
  AND EXISTS (SELECT 1 FROM profiles WHERE role = 'professional')
  AND EXISTS (SELECT 1 FROM services)
  AND EXISTS (SELECT 1 FROM addresses);

-- Method 2: Create booking with specific professional service
INSERT INTO bookings (
  customer_id,
  professional_id,
  service_id,
  professional_service_id,
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
  ps.id,
  a.id,
  NOW() + INTERVAL '1 day' + INTERVAL '10 hours',
  ps.price,
  100.00,
  ps.price + 100.00
FROM profiles c
CROSS JOIN profiles p
CROSS JOIN services s
CROSS JOIN professional_services ps
CROSS JOIN addresses a
WHERE c.role = 'customer'
  AND p.role = 'professional'
  AND ps.professional_id = p.id
  AND ps.service_id = s.id
  AND a.user_id = c.id
LIMIT 1
ON CONFLICT DO NOTHING;

-- Method 3: Create booking with explicit UUIDs (if you have them)
-- First, get the UUIDs:
SELECT 
  (SELECT id FROM profiles WHERE role = 'customer' LIMIT 1) as customer_id,
  (SELECT id FROM profiles WHERE role = 'professional' LIMIT 1) as professional_id,
  (SELECT id FROM services LIMIT 1) as service_id,
  (SELECT id FROM addresses LIMIT 1) as address_id;

-- Then use those UUIDs:
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
  'YOUR-CUSTOMER-UUID'::uuid,      -- Replace with actual UUID
  'YOUR-PROFESSIONAL-UUID'::uuid,   -- Replace with actual UUID
  'YOUR-SERVICE-UUID'::uuid,        -- Replace with actual UUID
  'YOUR-ADDRESS-UUID'::uuid,        -- Replace with actual UUID
  NOW() + INTERVAL '1 day',
  1000.00,
  1000.00
);

-- Verify the booking was created
SELECT 
  b.id,
  b.status,
  b.scheduled_at,
  b.final_amount,
  c.full_name as customer_name,
  p.full_name as professional_name,
  s.name as service_name
FROM bookings b
JOIN profiles c ON b.customer_id = c.id
JOIN profiles p ON b.professional_id = p.id
JOIN services s ON b.service_id = s.id
ORDER BY b.created_at DESC
LIMIT 5;
