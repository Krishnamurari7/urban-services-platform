-- ============================================
-- Homepage Banners Table
-- ============================================
-- CMS table for managing homepage banners

CREATE TABLE IF NOT EXISTS homepage_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  position INTEGER NOT NULL DEFAULT 0, -- Order/position of banner
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_homepage_banners_active ON homepage_banners(is_active) WHERE is_active = true;
CREATE INDEX idx_homepage_banners_position ON homepage_banners(position);
CREATE INDEX idx_homepage_banners_dates ON homepage_banners(start_date, end_date);

-- RLS Policies
ALTER TABLE homepage_banners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
  ON homepage_banners FOR SELECT
  USING (is_active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

-- Admins can view all banners
CREATE POLICY "Admins can view all banners"
  ON homepage_banners FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can manage banners
CREATE POLICY "Admins can manage banners"
  ON homepage_banners FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_homepage_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_homepage_banners_updated_at_trigger
  BEFORE UPDATE ON homepage_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_homepage_banners_updated_at();
