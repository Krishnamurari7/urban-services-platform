-- ============================================
-- Setup Storage Bucket and Policies for Service Images
-- ============================================
-- This migration sets up the storage bucket and policies for service images
-- Note: Storage bucket creation may require dashboard access if SQL doesn't work

-- Create bucket (if it doesn't exist)
-- Note: This may require service role key or dashboard access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'service-images',
  'service-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads to service-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own service images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own service images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read service images" ON storage.objects;

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads to service-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'service-images'
);

-- Policy 2: Allow authenticated users to update their own files
CREATE POLICY "Allow users to update own service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images'
  AND (
    -- Allow if file is in user's folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[2] = auth.uid()::text
    -- Or allow admins to update any file
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Policy 3: Allow authenticated users to delete their own files
CREATE POLICY "Allow users to delete own service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images'
  AND (
    -- Allow if file is in user's folder
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[2] = auth.uid()::text
    -- Or allow admins to delete any file
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
);

-- Policy 4: Allow public read access (since bucket is public)
CREATE POLICY "Allow public read service images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-images');

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Allow authenticated uploads to service-images" ON storage.objects IS 
'Allows authenticated users to upload images to service-images bucket';

COMMENT ON POLICY "Allow users to update own service images" ON storage.objects IS 
'Allows users to update their own uploaded images, or admins to update any image';

COMMENT ON POLICY "Allow users to delete own service images" ON storage.objects IS 
'Allows users to delete their own uploaded images, or admins to delete any image';

COMMENT ON POLICY "Allow public read service images" ON storage.objects IS 
'Allows public read access to all images in service-images bucket';
