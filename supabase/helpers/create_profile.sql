-- ============================================
-- Helper: Create Profile for Existing User
-- ============================================
-- Use this to create a profile for a user that already exists in auth.users

-- Method 1: Create profile for the first user in auth.users
-- This is the easiest way if you have at least one user
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  id,
  'customer',  -- Change to 'professional' or 'admin' as needed
  'Test User',
  '+1234567890'
FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles)  -- Only if profile doesn't exist
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Method 2: Create profile for a specific user by email
-- Replace 'user@example.com' with the actual email
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  id,
  'customer',
  'Test User',
  '+1234567890'
FROM auth.users
WHERE email = 'user@example.com'  -- Replace with actual email
  AND id NOT IN (SELECT id FROM profiles)
LIMIT 1
ON CONFLICT (id) DO NOTHING;

-- Method 3: Get a user UUID first, then use it
-- Step 1: Run this to get a user UUID
SELECT id, email FROM auth.users LIMIT 1;

-- Step 2: Copy the UUID from Step 1 and replace 'YOUR-UUID-HERE' below
INSERT INTO profiles (id, role, full_name, phone)
VALUES (
  'YOUR-UUID-HERE'::uuid,  -- Replace with UUID from Step 1
  'customer',
  'Test User',
  '+1234567890'
)
ON CONFLICT (id) DO NOTHING;

-- Method 4: Create profiles for all users without profiles
-- This creates profiles for all existing users
INSERT INTO profiles (id, role, full_name, phone)
SELECT 
  u.id,
  'customer',  -- Default role, change as needed
  COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
  COALESCE(u.raw_user_meta_data->>'phone', '+1234567890')
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM profiles)
ON CONFLICT (id) DO NOTHING;

-- Verify the profile was created
SELECT 
  p.id,
  p.role,
  p.full_name,
  u.email
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 5;
