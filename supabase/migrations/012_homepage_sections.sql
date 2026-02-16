-- ============================================
-- Homepage Sections Table
-- ============================================
-- CMS table for managing homepage sections content

CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_type TEXT NOT NULL, -- hero, services, features, testimonials, cta, etc.
  title TEXT,
  subtitle TEXT,
  description TEXT,
  content JSONB, -- Flexible JSON for section-specific data
  image_url TEXT,
  background_color TEXT,
  text_color TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_homepage_sections_display_order ON homepage_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_position ON homepage_sections(position);

-- RLS Policies
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can view active sections
CREATE POLICY "Anyone can view active sections"
  ON homepage_sections FOR SELECT
  USING (is_active = true);

-- Admins can view all sections
CREATE POLICY "Admins can view all sections"
  ON homepage_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage sections
CREATE POLICY "Admins can manage sections"
  ON homepage_sections FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_homepage_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_sections_updated_at();
