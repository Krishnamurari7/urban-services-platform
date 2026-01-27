-- ============================================
-- Fix: RLS Policy Infinite Recursion
-- ============================================
-- This migration fixes the infinite recursion issue in RLS policies
-- where admin policies query the profiles table, causing circular dependencies

-- Drop the problematic admin policy on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create a security definer function to check admin role
-- This function bypasses RLS, preventing infinite recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Recreate the admin policy using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- Fix other admin policies that might have the same issue
-- Update bookings admin policy
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (is_admin(auth.uid()));

-- Update payments admin policy
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (is_admin(auth.uid()));

-- Update reviews admin policy
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (is_admin(auth.uid()));

-- Update admin_actions policies
DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can create admin actions" ON admin_actions;

CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create admin actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND is_admin(auth.uid())
  );

-- Grant execute permission on the function to authenticated users
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO anon;

-- Add comment
COMMENT ON FUNCTION is_admin(UUID) IS 'Security definer function to check if a user is an admin. Bypasses RLS to prevent infinite recursion.';
