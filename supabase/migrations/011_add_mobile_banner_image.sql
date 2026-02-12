-- ============================================
-- Add Mobile Image URL to Homepage Banners
-- ============================================
-- Allows separate images for mobile and desktop devices

ALTER TABLE homepage_banners 
ADD COLUMN IF NOT EXISTS mobile_image_url TEXT;

-- Add comment
COMMENT ON COLUMN homepage_banners.mobile_image_url IS 'Optional mobile-specific image URL. If not provided, image_url will be used for all devices.';
