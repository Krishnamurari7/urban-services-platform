-- ============================================
-- Quick Fix: Create Missing Data + Booking
-- ============================================
-- Run this to quickly create customer, professional, and booking
-- This is a simplified version that works immediately

-- Step 1: Create customer profile (uses first available user)
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  id,
  'customer',
  'Test Customer',
  '+1234567890'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)
LIMIT 1
ON CONFLICT (id) DO UPDATE SET role = 'customer'
WHERE profiles.role != 'customer';

-- Step 2: Create professional profile (uses second available user, or same if only one exists)
INSERT INTO profiles (id, role, full_name, phone, hourly_rate)
SELECT 
  id,
  'professional',
  'Test Professional',
  '+1234567891',
  500.00
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles WHERE role = 'professional')
LIMIT 1
ON CONFLICT (id) DO UPDATE SET role = 'professional'
WHERE profiles.role != 'professional';

-- Step 3: Create service (if doesn't exist)
INSERT INTO services (name, category, base_price, duration_minutes)
VALUES ('Home Cleaning', 'Cleaning', 500.00, 120)
ON CONFLICT DO NOTHING;

-- Step 4: Verify data exists
SELECT 
  'Verification' as step,
  (SELECT COUNT(*) FROM profiles WHERE role = 'customer') as customers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'professional') as professionals,
  (SELECT COUNT(*) FROM services) as services,
  (SELECT COUNT(*) FROM addresses) as addresses;

-- Step 5: Create booking (only if all data exists)
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
  c.id,
  p.id,
  s.id,
  a.id,
  NOW() + INTERVAL '1 day',
  1000.00,
  1000.00
FROM profiles c
CROSS JOIN profiles p
CROSS JOIN services s
CROSS JOIN addresses a
WHERE c.role = 'customer'
  AND p.role = 'professional'
  AND c.id != p.id  -- Ensure different users
LIMIT 1;

-- Step 6: Verify booking was created
SELECT 
  b.id,
  b.status,
  b.scheduled_at,
  c.full_name as customer,
  p.full_name as professional
FROM bookings b
JOIN profiles c ON b.customer_id = c.id
JOIN profiles p ON b.professional_id = p.id
ORDER BY b.created_at DESC
LIMIT 1;
