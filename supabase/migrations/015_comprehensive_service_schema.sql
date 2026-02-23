-- ============================================
-- Comprehensive Service Management Schema
-- ============================================
-- This migration upgrades the services table and creates all related tables
-- for a professional service marketplace (Urban Company style)

-- ============================================
-- ENUM TYPES
-- ============================================

-- Service type enum
CREATE TYPE service_type AS ENUM ('normal', 'intense', 'deep');

-- ============================================
-- UPDATE SERVICES TABLE
-- ============================================

-- Add new columns to services table
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS long_description TEXT,
  ADD COLUMN IF NOT EXISTS service_type service_type DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS thumbnail_image TEXT,
  ADD COLUMN IF NOT EXISTS duration_label TEXT,
  ADD COLUMN IF NOT EXISTS best_for TEXT,
  ADD COLUMN IF NOT EXISTS cleaning_type TEXT,
  ADD COLUMN IF NOT EXISTS equipment_used TEXT,
  ADD COLUMN IF NOT EXISTS warranty_info TEXT;

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create trigger to auto-generate slug if not provided
CREATE OR REPLACE FUNCTION auto_generate_service_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.name);
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM services WHERE slug = NEW.slug AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)) LOOP
      NEW.slug := NEW.slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_service_slug
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW
  WHEN (NEW.slug IS NULL OR NEW.slug = '')
  EXECUTE FUNCTION auto_generate_service_slug();

-- ============================================
-- SERVICE PRICING TABLE
-- ============================================
-- Multiple pricing variants per service (e.g., 1x, 2x, 3x Bathroom)

CREATE TABLE IF NOT EXISTS service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- e.g., "1 x Bathroom", "2 x Bathroom"
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  discount_price DECIMAL(10, 2) CHECK (discount_price IS NULL OR discount_price >= 0),
  is_popular BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE FEATURES TABLE
-- ============================================
-- Included features/items in the service

CREATE TABLE IF NOT EXISTS service_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  feature_title TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE FAQ TABLE
-- ============================================
-- Frequently asked questions per service

CREATE TABLE IF NOT EXISTS service_faq (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE GALLERY TABLE
-- ============================================
-- Multiple gallery images per service

CREATE TABLE IF NOT EXISTS service_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SERVICE SEO TABLE
-- ============================================
-- SEO metadata per service

CREATE TABLE IF NOT EXISTS service_seo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL UNIQUE REFERENCES services(id) ON DELETE CASCADE,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services(service_type);
CREATE INDEX IF NOT EXISTS idx_services_category_status ON services(category, status);

-- Service Pricing indexes
CREATE INDEX IF NOT EXISTS idx_service_pricing_service ON service_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_popular ON service_pricing(service_id, is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_service_pricing_display_order ON service_pricing(service_id, display_order);

-- Service Features indexes
CREATE INDEX IF NOT EXISTS idx_service_features_service ON service_features(service_id);
CREATE INDEX IF NOT EXISTS idx_service_features_display_order ON service_features(service_id, display_order);

-- Service FAQ indexes
CREATE INDEX IF NOT EXISTS idx_service_faq_service ON service_faq(service_id);
CREATE INDEX IF NOT EXISTS idx_service_faq_display_order ON service_faq(service_id, display_order);

-- Service Gallery indexes
CREATE INDEX IF NOT EXISTS idx_service_gallery_service ON service_gallery(service_id);
CREATE INDEX IF NOT EXISTS idx_service_gallery_display_order ON service_gallery(service_id, display_order);

-- Service SEO indexes
CREATE INDEX IF NOT EXISTS idx_service_seo_service ON service_seo(service_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE TRIGGER update_service_pricing_updated_at BEFORE UPDATE ON service_pricing
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_faq_updated_at BEFORE UPDATE ON service_faq
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_seo_updated_at BEFORE UPDATE ON service_seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_seo ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SERVICE PRICING POLICIES
-- ============================================

-- Anyone can view pricing for active services
CREATE POLICY "Anyone can view pricing for active services"
  ON service_pricing FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_pricing.service_id
        AND status = 'active'
    )
  );

-- Admins can manage all pricing
CREATE POLICY "Admins can manage service pricing"
  ON service_pricing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SERVICE FEATURES POLICIES
-- ============================================

-- Anyone can view features for active services
CREATE POLICY "Anyone can view features for active services"
  ON service_features FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_features.service_id
        AND status = 'active'
    )
  );

-- Admins can manage all features
CREATE POLICY "Admins can manage service features"
  ON service_features FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SERVICE FAQ POLICIES
-- ============================================

-- Anyone can view FAQs for active services
CREATE POLICY "Anyone can view FAQs for active services"
  ON service_faq FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_faq.service_id
        AND status = 'active'
    )
  );

-- Admins can manage all FAQs
CREATE POLICY "Admins can manage service FAQs"
  ON service_faq FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SERVICE GALLERY POLICIES
-- ============================================

-- Anyone can view gallery for active services
CREATE POLICY "Anyone can view gallery for active services"
  ON service_gallery FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_gallery.service_id
        AND status = 'active'
    )
  );

-- Admins can manage all gallery images
CREATE POLICY "Admins can manage service gallery"
  ON service_gallery FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- SERVICE SEO POLICIES
-- ============================================

-- Anyone can view SEO for active services
CREATE POLICY "Anyone can view SEO for active services"
  ON service_seo FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE id = service_seo.service_id
        AND status = 'active'
    )
  );

-- Admins can manage all SEO
CREATE POLICY "Admins can manage service SEO"
  ON service_seo FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE service_pricing IS 'Multiple pricing variants per service (e.g., 1x, 2x, 3x Bathroom)';
COMMENT ON TABLE service_features IS 'Included features/items in the service';
COMMENT ON TABLE service_faq IS 'Frequently asked questions per service';
COMMENT ON TABLE service_gallery IS 'Multiple gallery images per service';
COMMENT ON TABLE service_seo IS 'SEO metadata per service';

COMMENT ON COLUMN services.slug IS 'URL-friendly slug for the service (auto-generated from name)';
COMMENT ON COLUMN services.short_description IS 'Brief description for service cards';
COMMENT ON COLUMN services.long_description IS 'Detailed description (supports rich text)';
COMMENT ON COLUMN services.service_type IS 'Type of service: normal, intense, or deep';
COMMENT ON COLUMN services.thumbnail_image IS 'Main thumbnail image URL';
COMMENT ON COLUMN services.duration_label IS 'Human-readable duration label (e.g., "60 minutes")';
COMMENT ON COLUMN services.best_for IS 'Best use case description';
COMMENT ON COLUMN services.cleaning_type IS 'Type of cleaning method';
COMMENT ON COLUMN services.equipment_used IS 'Equipment/tools used';
COMMENT ON COLUMN services.warranty_info IS 'Warranty or guarantee information';
