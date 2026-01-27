-- ============================================
-- Urban Services Platform - Database Schema
-- ============================================
-- This migration creates all tables, enums, indexes, and RLS policies
-- for the Urban Company-like service marketplace platform.

-- ============================================
-- ENUM TYPES
-- ============================================

-- User roles
CREATE TYPE user_role AS ENUM ('customer', 'professional', 'admin');

-- Booking status
CREATE TYPE booking_status AS ENUM (
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'refunded'
);

-- Payment status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'processing',
  'completed',
  'failed',
  'refunded',
  'cancelled'
);

-- Payment method
CREATE TYPE payment_method AS ENUM (
  'credit_card',
  'debit_card',
  'upi',
  'wallet',
  'net_banking',
  'cash'
);

-- Service status
CREATE TYPE service_status AS ENUM (
  'active',
  'inactive',
  'suspended'
);

-- Availability status
CREATE TYPE availability_status AS ENUM (
  'available',
  'booked',
  'unavailable'
);

-- Admin action type
CREATE TYPE admin_action_type AS ENUM (
  'user_suspended',
  'user_activated',
  'service_created',
  'service_updated',
  'service_deleted',
  'booking_cancelled',
  'payment_refunded',
  'review_removed',
  'other'
);

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for location-based queries (optional, for addresses)
-- CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- TABLES
-- ============================================

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
-- Stores user profile information linked to auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'customer',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  date_of_birth DATE,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating_average DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  total_reviews INTEGER DEFAULT 0,
  -- Professional-specific fields
  experience_years INTEGER,
  skills TEXT[],
  hourly_rate DECIMAL(10, 2),
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. SERVICES TABLE
-- ============================================
-- Service categories/types available on the platform
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  image_url TEXT,
  status service_status DEFAULT 'active',
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- ============================================
-- 3. PROFESSIONAL_SERVICES TABLE
-- ============================================
-- Many-to-many relationship: Professionals and Services they offer
CREATE TABLE professional_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  is_available BOOLEAN DEFAULT true,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraints
  UNIQUE(professional_id, service_id)
);

-- ============================================
-- 4. ADDRESSES TABLE
-- ============================================
-- User addresses for service delivery
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g., "Home", "Office"
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_default BOOLEAN DEFAULT false,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. BOOKINGS TABLE
-- ============================================
-- Service bookings/appointments
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  professional_service_id UUID REFERENCES professional_services(id) ON DELETE SET NULL,
  address_id UUID NOT NULL REFERENCES addresses(id) ON DELETE RESTRICT,
  status booking_status DEFAULT 'pending',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),
  service_fee DECIMAL(10, 2) DEFAULT 0 CHECK (service_fee >= 0),
  discount_amount DECIMAL(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
  final_amount DECIMAL(10, 2) NOT NULL CHECK (final_amount >= 0),
  special_instructions TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraints
  CHECK (scheduled_at > created_at),
  CHECK (completed_at IS NULL OR completed_at >= scheduled_at),
  CHECK (cancelled_at IS NULL OR cancelled_at >= created_at)
);

-- ============================================
-- 6. PAYMENTS TABLE
-- ============================================
-- Payment transactions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status payment_status DEFAULT 'pending',
  method payment_method NOT NULL,
  transaction_id TEXT UNIQUE,
  payment_gateway TEXT, -- e.g., "razorpay", "stripe"
  gateway_response JSONB,
  refund_amount DECIMAL(10, 2) DEFAULT 0 CHECK (refund_amount >= 0),
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. REVIEWS TABLE
-- ============================================
-- Reviews and ratings
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false, -- Verified purchase
  is_visible BOOLEAN DEFAULT true,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraints
  UNIQUE(booking_id, customer_id) -- One review per booking per customer
);

-- ============================================
-- 8. AVAILABILITY_SLOTS TABLE
-- ============================================
-- Professional availability time slots
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status availability_status DEFAULT 'available',
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g., "daily", "weekly", "weekdays"
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Constraints
  CHECK (end_time > start_time)
);

-- ============================================
-- 9. ADMIN_ACTIONS TABLE
-- ============================================
-- Audit log for admin actions
CREATE TABLE admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  action_type admin_action_type NOT NULL,
  target_type TEXT, -- e.g., "user", "booking", "service"
  target_id UUID,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Profiles indexes
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_rating ON profiles(rating_average DESC);

-- Services indexes
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_created_by ON services(created_by);

-- Professional Services indexes
CREATE INDEX idx_professional_services_professional ON professional_services(professional_id);
CREATE INDEX idx_professional_services_service ON professional_services(service_id);
CREATE INDEX idx_professional_services_available ON professional_services(is_available);

-- Addresses indexes
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = true;
CREATE INDEX idx_addresses_location ON addresses(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Bookings indexes
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_professional ON bookings(professional_id);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_scheduled_at ON bookings(scheduled_at);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_bookings_customer_status ON bookings(customer_id, status);
CREATE INDEX idx_bookings_professional_status ON bookings(professional_id, status);

-- Payments indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_customer ON payments(customer_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_payments_created_at ON payments(created_at DESC);

-- Reviews indexes
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_customer ON reviews(customer_id);
CREATE INDEX idx_reviews_professional ON reviews(professional_id);
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_visible ON reviews(is_visible) WHERE is_visible = true;
CREATE INDEX idx_reviews_professional_rating ON reviews(professional_id, rating);

-- Availability Slots indexes
CREATE INDEX idx_availability_slots_professional ON availability_slots(professional_id);
CREATE INDEX idx_availability_slots_start_time ON availability_slots(start_time);
CREATE INDEX idx_availability_slots_status ON availability_slots(status);
CREATE INDEX idx_availability_slots_booking ON availability_slots(booking_id) WHERE booking_id IS NOT NULL;
CREATE INDEX idx_availability_slots_time_range ON availability_slots USING GIST (tstzrange(start_time, end_time));

-- Admin Actions indexes
CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_type ON admin_actions(action_type);
CREATE INDEX idx_admin_actions_target ON admin_actions(target_type, target_id) WHERE target_id IS NOT NULL;
CREATE INDEX idx_admin_actions_created_at ON admin_actions(created_at DESC);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_services_updated_at BEFORE UPDATE ON professional_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON availability_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update profile rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate average rating and total reviews
  UPDATE profiles
  SET
    rating_average = (
      SELECT COALESCE(AVG(rating)::DECIMAL(3, 2), 0.00)
      FROM reviews
      WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
        AND is_visible = true
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE professional_id = COALESCE(NEW.professional_id, OLD.professional_id)
        AND is_visible = true
    )
  WHERE id = COALESCE(NEW.professional_id, OLD.professional_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update rating on review changes
CREATE TRIGGER update_rating_on_review_insert
  AFTER INSERT ON reviews
  FOR EACH ROW
  WHEN (NEW.is_visible = true)
  EXECUTE FUNCTION update_professional_rating();

CREATE TRIGGER update_rating_on_review_update
  AFTER UPDATE ON reviews
  FOR EACH ROW
  WHEN (NEW.is_visible != OLD.is_visible OR NEW.rating != OLD.rating)
  EXECUTE FUNCTION update_professional_rating();

CREATE TRIGGER update_rating_on_review_delete
  AFTER DELETE ON reviews
  FOR EACH ROW
  WHEN (OLD.is_visible = true)
  EXECUTE FUNCTION update_professional_rating();

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to ensure single default address
CREATE TRIGGER ensure_single_default_address_trigger
  BEFORE INSERT OR UPDATE ON addresses
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_address();

-- Function to update availability slot status when booking is created/cancelled
CREATE OR REPLACE FUNCTION update_availability_on_booking_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Mark slot as booked when booking is created
    UPDATE availability_slots
    SET status = 'booked', booking_id = NEW.id
    WHERE professional_id = NEW.professional_id
      AND start_time <= NEW.scheduled_at
      AND end_time >= NEW.scheduled_at
      AND status = 'available';
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle booking cancellation
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
      UPDATE availability_slots
      SET status = 'available', booking_id = NULL
      WHERE booking_id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update availability on booking changes
CREATE TRIGGER update_availability_on_booking_insert
  AFTER INSERT ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_availability_on_booking_change();

CREATE TRIGGER update_availability_on_booking_update
  AFTER UPDATE ON bookings
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status != 'cancelled')
  EXECUTE FUNCTION update_availability_on_booking_change();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can view active professionals
CREATE POLICY "Anyone can view active professionals"
  ON profiles FOR SELECT
  USING (role = 'professional' AND is_active = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SERVICES POLICIES
-- ============================================

-- Anyone can view active services
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (status = 'active');

-- Admins can manage all services
CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PROFESSIONAL_SERVICES POLICIES
-- ============================================

-- Anyone can view available professional services
CREATE POLICY "Anyone can view available professional services"
  ON professional_services FOR SELECT
  USING (is_available = true);

-- Professionals can manage their own services
CREATE POLICY "Professionals can manage own services"
  ON professional_services FOR ALL
  USING (
    professional_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'professional'
    )
  );

-- ============================================
-- ADDRESSES POLICIES
-- ============================================

-- Users can view their own addresses
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (user_id = auth.uid());

-- Users can manage their own addresses
CREATE POLICY "Users can manage own addresses"
  ON addresses FOR ALL
  USING (user_id = auth.uid());

-- ============================================
-- BOOKINGS POLICIES
-- ============================================

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (customer_id = auth.uid());

-- Professionals can view bookings assigned to them
CREATE POLICY "Professionals can view assigned bookings"
  ON bookings FOR SELECT
  USING (professional_id = auth.uid());

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'customer'
    )
  );

-- Customers can update their own pending bookings
CREATE POLICY "Customers can update own pending bookings"
  ON bookings FOR UPDATE
  USING (
    customer_id = auth.uid() AND
    status = 'pending'
  );

-- Professionals can update bookings assigned to them (status changes)
CREATE POLICY "Professionals can update assigned bookings"
  ON bookings FOR UPDATE
  USING (
    professional_id = auth.uid() AND
    status IN ('confirmed', 'in_progress', 'completed')
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- PAYMENTS POLICIES
-- ============================================

-- Customers can view their own payments
CREATE POLICY "Customers can view own payments"
  ON payments FOR SELECT
  USING (customer_id = auth.uid());

-- System can create payments (via service role)
-- Note: In production, use service role key for payment creation
CREATE POLICY "Customers can view payment for own booking"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = payments.booking_id AND customer_id = auth.uid()
    )
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- REVIEWS POLICIES
-- ============================================

-- Anyone can view visible reviews
CREATE POLICY "Anyone can view visible reviews"
  ON reviews FOR SELECT
  USING (is_visible = true);

-- Customers can create reviews for their bookings
CREATE POLICY "Customers can create reviews for own bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    customer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = reviews.booking_id
        AND customer_id = auth.uid()
        AND status = 'completed'
    )
  );

-- Customers can update their own reviews
CREATE POLICY "Customers can update own reviews"
  ON reviews FOR UPDATE
  USING (customer_id = auth.uid());

-- Admins can manage all reviews
CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- AVAILABILITY_SLOTS POLICIES
-- ============================================

-- Professionals can view their own availability
CREATE POLICY "Professionals can view own availability"
  ON availability_slots FOR SELECT
  USING (professional_id = auth.uid());

-- Anyone can view available slots (for booking)
CREATE POLICY "Anyone can view available slots"
  ON availability_slots FOR SELECT
  USING (status = 'available');

-- Professionals can manage their own availability
CREATE POLICY "Professionals can manage own availability"
  ON availability_slots FOR ALL
  USING (
    professional_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'professional'
    )
  );

-- ============================================
-- ADMIN_ACTIONS POLICIES
-- ============================================

-- Only admins can view admin actions
CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can create admin actions
CREATE POLICY "Admins can create admin actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE profiles IS 'User profiles with role-based access (customer, professional, admin)';
COMMENT ON TABLE services IS 'Service categories and types available on the platform';
COMMENT ON TABLE professional_services IS 'Many-to-many relationship between professionals and services they offer';
COMMENT ON TABLE addresses IS 'User addresses for service delivery locations';
COMMENT ON TABLE bookings IS 'Service bookings/appointments with status tracking';
COMMENT ON TABLE payments IS 'Payment transactions linked to bookings';
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for services and professionals';
COMMENT ON TABLE availability_slots IS 'Professional availability time slots';
COMMENT ON TABLE admin_actions IS 'Audit log for administrative actions';
