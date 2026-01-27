-- ============================================ 
-- Comprehensive RLS Policies Migration
-- ============================================
-- This migration replaces and enhances existing RLS policies with strict
-- role-based access control:
-- - Customer: Access only own data
-- - Professional: Access assigned jobs only
-- - Admin: Full access to everything
--
-- Uses security definer functions to prevent RLS recursion issues

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin (prevents RLS recursion)
-- This should already exist from migration 002, but we ensure it exists
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

-- Function to check if user is customer
CREATE OR REPLACE FUNCTION is_customer(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'customer'
  );
END;
$$;

-- Function to check if user is professional
CREATE OR REPLACE FUNCTION is_professional(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'professional'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION is_admin(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_customer(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION is_professional(UUID) TO authenticated, anon;

-- ============================================
-- DROP EXISTING POLICIES
-- ============================================
-- We'll recreate all policies with stricter security

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active professionals" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Services policies
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;

-- Professional Services policies
DROP POLICY IF EXISTS "Anyone can view available professional services" ON professional_services;
DROP POLICY IF EXISTS "Professionals can manage own services" ON professional_services;

-- Addresses policies
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
DROP POLICY IF EXISTS "Users can manage own addresses" ON addresses;

-- Bookings policies
DROP POLICY IF EXISTS "Customers can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Professionals can view assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can create bookings" ON bookings;
DROP POLICY IF EXISTS "Customers can update own pending bookings" ON bookings;
DROP POLICY IF EXISTS "Professionals can update assigned bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

-- Payments policies
DROP POLICY IF EXISTS "Customers can view own payments" ON payments;
DROP POLICY IF EXISTS "Customers can view payment for own booking" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

-- Reviews policies
DROP POLICY IF EXISTS "Anyone can view visible reviews" ON reviews;
DROP POLICY IF EXISTS "Customers can create reviews for own bookings" ON reviews;
DROP POLICY IF EXISTS "Customers can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;

-- Availability Slots policies
DROP POLICY IF EXISTS "Professionals can view own availability" ON availability_slots;
DROP POLICY IF EXISTS "Anyone can view available slots" ON availability_slots;
DROP POLICY IF EXISTS "Professionals can manage own availability" ON availability_slots;

-- Admin Actions policies
DROP POLICY IF EXISTS "Admins can view admin actions" ON admin_actions;
DROP POLICY IF EXISTS "Admins can create admin actions" ON admin_actions;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Customers: Can view and manage only their own profile
CREATE POLICY "Customers can view own profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id AND is_customer(auth.uid())
  );

CREATE POLICY "Customers can update own profile"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id AND is_customer(auth.uid())
  )
  WITH CHECK (
    auth.uid() = id AND is_customer(auth.uid())
  );

-- Professionals: Can view and manage only their own profile
CREATE POLICY "Professionals can view own profile"
  ON profiles FOR SELECT
  USING (
    auth.uid() = id AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can update own profile"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id AND is_professional(auth.uid())
  )
  WITH CHECK (
    auth.uid() = id AND is_professional(auth.uid())
  );

-- Anyone can view active professionals (for booking purposes)
CREATE POLICY "Anyone can view active professionals"
  ON profiles FOR SELECT
  USING (role = 'professional' AND is_active = true);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins: Full access to all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- SERVICES POLICIES
-- ============================================

-- Anyone can view active services (public catalog)
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (status = 'active');

-- Admins: Full access to all services
CREATE POLICY "Admins can view all services"
  ON services FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert services"
  ON services FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update services"
  ON services FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete services"
  ON services FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PROFESSIONAL_SERVICES POLICIES
-- ============================================

-- Anyone can view available professional services (for booking)
CREATE POLICY "Anyone can view available professional services"
  ON professional_services FOR SELECT
  USING (is_available = true);

-- Professionals: Can manage only their own services
CREATE POLICY "Professionals can view own services"
  ON professional_services FOR SELECT
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can insert own services"
  ON professional_services FOR INSERT
  WITH CHECK (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can update own services"
  ON professional_services FOR UPDATE
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  )
  WITH CHECK (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can delete own services"
  ON professional_services FOR DELETE
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

-- Admins: Full access
CREATE POLICY "Admins can manage professional services"
  ON professional_services FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ADDRESSES POLICIES
-- ============================================

-- Customers: Can manage only their own addresses
CREATE POLICY "Customers can view own addresses"
  ON addresses FOR SELECT
  USING (
    user_id = auth.uid() AND is_customer(auth.uid())
  );

CREATE POLICY "Customers can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND is_customer(auth.uid())
  );

CREATE POLICY "Customers can update own addresses"
  ON addresses FOR UPDATE
  USING (
    user_id = auth.uid() AND is_customer(auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid() AND is_customer(auth.uid())
  );

CREATE POLICY "Customers can delete own addresses"
  ON addresses FOR DELETE
  USING (
    user_id = auth.uid() AND is_customer(auth.uid())
  );

-- Professionals: Can manage only their own addresses
CREATE POLICY "Professionals can view own addresses"
  ON addresses FOR SELECT
  USING (
    user_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can update own addresses"
  ON addresses FOR UPDATE
  USING (
    user_id = auth.uid() AND is_professional(auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can delete own addresses"
  ON addresses FOR DELETE
  USING (
    user_id = auth.uid() AND is_professional(auth.uid())
  );

-- Admins: Full access
CREATE POLICY "Admins can manage all addresses"
  ON addresses FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

-- Customers: Can view and manage only their own bookings
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (
    customer_id = auth.uid() AND is_customer(auth.uid())
  );

CREATE POLICY "Customers can create own bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() AND is_customer(auth.uid())
  );

CREATE POLICY "Customers can update own pending bookings"
  ON bookings FOR UPDATE
  USING (
    customer_id = auth.uid() AND is_customer(auth.uid()) AND status = 'pending'
  )
  WITH CHECK (
    customer_id = auth.uid() AND is_customer(auth.uid()) AND status IN ('pending', 'cancelled')
  );

CREATE POLICY "Customers can cancel confirmed bookings"
  ON bookings FOR UPDATE
  USING (
    customer_id = auth.uid() AND is_customer(auth.uid()) AND status = 'confirmed'
  )
  WITH CHECK (
    customer_id = auth.uid() AND is_customer(auth.uid()) AND status = 'cancelled'
  );

-- Professionals: Can view and update only assigned bookings
CREATE POLICY "Professionals can view assigned bookings"
  ON bookings FOR SELECT
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can update assigned bookings"
  ON bookings FOR UPDATE
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  )
  WITH CHECK (
    professional_id = auth.uid() AND is_professional(auth.uid()) AND
    status IN ('confirmed', 'in_progress', 'completed', 'cancelled')
  );

-- Admins: Full access to all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update all bookings"
  ON bookings FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete bookings"
  ON bookings FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

-- Customers: Can view only their own payments
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  USING (
    customer_id = auth.uid() AND is_customer(auth.uid())
  );

-- Note: Payment creation should be done via service role or admin
-- Regular users should not be able to insert payments directly

-- Admins: Full access to all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert payments"
  ON payments FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update all payments"
  ON payments FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete payments"
  ON payments FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Anyone can view visible reviews (public reviews)
CREATE POLICY "Anyone can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

-- Customers: Can view their own reviews (even if not visible)
CREATE POLICY "Customers can view own reviews"
  ON reviews FOR SELECT
  USING (
    customer_id = auth.uid() AND is_customer(auth.uid())
  );

-- Professionals: Can view reviews about them
CREATE POLICY "Professionals can view own reviews"
  ON reviews FOR SELECT
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

-- Customers: Can create reviews for their completed bookings
CREATE POLICY "Customers can create reviews for own bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() AND is_customer(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = reviews.booking_id
        AND customer_id = auth.uid()
        AND status = 'completed'
    )
  );

-- Customers: Can update their own reviews
CREATE POLICY "Customers can update own reviews"
  ON reviews FOR UPDATE
  USING (
    customer_id = auth.uid() AND is_customer(auth.uid())
  )
  WITH CHECK (
    customer_id = auth.uid() AND is_customer(auth.uid())
  );

-- Customers: Can delete their own reviews
CREATE POLICY "Customers can delete own reviews"
  ON reviews FOR DELETE
  USING (
    customer_id = auth.uid() AND is_customer(auth.uid())
  );

-- Admins: Full access to all reviews
CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- AVAILABILITY_SLOTS POLICIES
-- ============================================

-- Anyone can view available slots (for booking)
CREATE POLICY "Anyone can view available slots"
  ON availability_slots FOR SELECT
  USING (status = 'available');

-- Professionals: Can manage only their own availability
CREATE POLICY "Professionals can view own availability"
  ON availability_slots FOR SELECT
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can insert own availability"
  ON availability_slots FOR INSERT
  WITH CHECK (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can update own availability"
  ON availability_slots FOR UPDATE
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  )
  WITH CHECK (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

CREATE POLICY "Professionals can delete own availability"
  ON availability_slots FOR DELETE
  USING (
    professional_id = auth.uid() AND is_professional(auth.uid())
  );

-- Admins: Full access
CREATE POLICY "Admins can manage all availability slots"
  ON availability_slots FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ============================================
-- ADMIN_ACTIONS POLICIES
-- ============================================

-- Only admins can view admin actions (audit log)
CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT
  USING (is_admin(auth.uid()));

-- Only admins can create admin actions
CREATE POLICY "Admins can create admin actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND is_admin(auth.uid())
  );

-- Only admins can update admin actions (for corrections)
CREATE POLICY "Admins can update admin actions"
  ON admin_actions FOR UPDATE
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Only admins can delete admin actions (for cleanup)
CREATE POLICY "Admins can delete admin actions"
  ON admin_actions FOR DELETE
  USING (is_admin(auth.uid()));

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION is_admin(UUID) IS 'Security definer function to check if a user is an admin. Bypasses RLS to prevent infinite recursion.';
COMMENT ON FUNCTION is_customer(UUID) IS 'Security definer function to check if a user is a customer. Bypasses RLS to prevent infinite recursion.';
COMMENT ON FUNCTION is_professional(UUID) IS 'Security definer function to check if a user is a professional. Bypasses RLS to prevent infinite recursion.';

COMMENT ON TABLE profiles IS 'User profiles with strict role-based access control';
COMMENT ON TABLE services IS 'Service catalog with admin-only management';
COMMENT ON TABLE professional_services IS 'Professional service offerings with owner-based access';
COMMENT ON TABLE addresses IS 'User addresses with strict owner-only access';
COMMENT ON TABLE bookings IS 'Service bookings with customer and professional role-based access';
COMMENT ON TABLE payments IS 'Payment transactions with customer and admin access';
COMMENT ON TABLE reviews IS 'Customer reviews with public visibility and owner management';
COMMENT ON TABLE availability_slots IS 'Professional availability with owner-based management';
COMMENT ON TABLE admin_actions IS 'Admin audit log with admin-only access';
