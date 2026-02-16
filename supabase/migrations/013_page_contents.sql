-- ============================================
-- Page Contents Table
-- ============================================
-- CMS table for managing content for all pages (public and customer pages)
-- This allows admin to edit all text, images, and content on any page

CREATE TABLE IF NOT EXISTS page_contents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_path TEXT NOT NULL, -- e.g., "/", "/customer/dashboard", "/about", etc.
  content_key TEXT NOT NULL, -- e.g., "hero_title", "welcome_message", "section_description"
  content_type TEXT NOT NULL DEFAULT 'text', -- text, html, json, image_url, etc.
  content_value TEXT, -- The actual content
  content_json JSONB, -- For complex structured content
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page_path, content_key) -- One content key per page path
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_page_contents_page_path ON page_contents(page_path);
CREATE INDEX IF NOT EXISTS idx_page_contents_content_key ON page_contents(content_key);
CREATE INDEX IF NOT EXISTS idx_page_contents_active ON page_contents(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_page_contents_display_order ON page_contents(display_order);
CREATE INDEX IF NOT EXISTS idx_page_contents_page_active ON page_contents(page_path, is_active) WHERE is_active = true;

-- RLS Policies
ALTER TABLE page_contents ENABLE ROW LEVEL SECURITY;

-- Anyone can view active content
CREATE POLICY "Anyone can view active page content"
  ON page_contents FOR SELECT
  USING (is_active = true);

-- Admins can view all content
CREATE POLICY "Admins can view all page content"
  ON page_contents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage all content
CREATE POLICY "Admins can manage page content"
  ON page_contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_page_contents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_page_contents_updated_at
  BEFORE UPDATE ON page_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_page_contents_updated_at();
