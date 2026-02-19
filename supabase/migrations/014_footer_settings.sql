-- ============================================
-- Footer Settings Table
-- ============================================
-- CMS table for managing footer content and settings
-- This allows admin to edit all footer details

CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Company Info
  company_name TEXT NOT NULL DEFAULT 'Vera Company',
  company_description TEXT,
  logo_url TEXT DEFAULT '/logo.png',
  
  -- Contact Information
  phone TEXT,
  email TEXT,
  address TEXT,
  
  -- Social Media Links
  facebook_url TEXT,
  instagram_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  
  -- Quick Links (stored as JSON array)
  quick_links JSONB DEFAULT '[]'::jsonb,
  
  -- Footer Links (Privacy, Terms, etc.)
  privacy_policy_url TEXT DEFAULT '/privacy-policy',
  terms_of_service_url TEXT DEFAULT '/terms-of-service',
  cookie_policy_url TEXT DEFAULT '/cookies',
  
  -- Newsletter
  newsletter_enabled BOOLEAN DEFAULT true,
  newsletter_text TEXT DEFAULT 'Subscribe for latest updates and offers.',
  
  -- Copyright
  copyright_text TEXT DEFAULT 'All rights reserved.',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one active footer setting
  CONSTRAINT single_active_footer CHECK (
    (is_active = true AND (SELECT COUNT(*) FROM footer_settings WHERE is_active = true) <= 1) OR
    is_active = false
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_footer_settings_active ON footer_settings(is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view active footer settings
CREATE POLICY "Anyone can view active footer settings"
  ON footer_settings FOR SELECT
  USING (is_active = true);

-- Admins can view all footer settings
CREATE POLICY "Admins can view all footer settings"
  ON footer_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage footer settings
CREATE POLICY "Admins can manage footer settings"
  ON footer_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_footer_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_footer_settings_updated_at
  BEFORE UPDATE ON footer_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_footer_settings_updated_at();

-- Insert default footer settings
INSERT INTO footer_settings (
  company_name,
  company_description,
  phone,
  email,
  address,
  facebook_url,
  instagram_url,
  twitter_url,
  quick_links,
  is_active
) VALUES (
  'Vera Company',
  'Your one-stop destination for reliable and professional home services. We bring the experts to you.',
  '+1 (555) 123-4567',
  'support@veracompany.com',
  '123 Main St, Suite 500, San Francisco, CA 94107',
  'https://facebook.com',
  'https://instagram.com',
  'https://twitter.com',
  '[
    {"name": "About Us", "url": "/about"},
    {"name": "Our Services", "url": "/services"},
    {"name": "Expert Partners", "url": "/become-professional"},
    {"name": "Pricing Plans", "url": "/#pricing"},
    {"name": "Careers", "url": "/careers"}
  ]'::jsonb,
  true
) ON CONFLICT DO NOTHING;
