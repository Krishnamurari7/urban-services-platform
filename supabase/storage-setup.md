# Supabase Storage Setup Guide

## Create Storage Bucket for Service Images

### Step 1: Create the Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **"New bucket"**
4. Configure:
   - **Name**: `service-images`
   - **Public bucket**: ✅ **Enable** (check this box)
   - Click **"Create bucket"**

### Step 2: Set Up Storage Policies

After creating the bucket, you need to set up policies to allow authenticated users to upload:

1. Go to **Storage** → **Policies** tab
2. Select the `service-images` bucket
3. Click **"New Policy"**

#### Policy 1: Allow Authenticated Users to Upload

**Policy Name**: `Allow authenticated users to upload images`

**Policy Definition**:
```sql
(
  bucket_id = 'service-images'::text
)
AND
(
  (auth.role() = 'authenticated'::text)
)
```

**Allowed Operations**: ✅ INSERT

#### Policy 2: Allow Authenticated Users to Update/Delete Their Own Files

**Policy Name**: `Allow users to manage their own images`

**Policy Definition**:
```sql
(
  bucket_id = 'service-images'::text
)
AND
(
  (auth.role() = 'authenticated'::text)
  AND
  (
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    (storage.foldername(name))[2] = auth.uid()::text
  )
)
```

**Allowed Operations**: ✅ UPDATE, ✅ DELETE

#### Policy 3: Allow Public Read Access

**Policy Name**: `Allow public read access`

**Policy Definition**:
```sql
(bucket_id = 'service-images'::text)
```

**Allowed Operations**: ✅ SELECT

### Step 3: Create Folders (Optional)

Folders are created automatically when you upload files, but you can create them manually:

1. Go to **Storage** → **service-images** bucket
2. Click **"New folder"**
3. Create folders:
   - `thumbnails/`
   - `gallery/`

## Alternative: Using Supabase SQL Editor

You can also create the bucket and policies using SQL (if you have the right permissions):

```sql
-- Create bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('service-images', 'service-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-images');

-- Policy: Allow authenticated users to update/delete their files
CREATE POLICY "Allow users to manage own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[2] = auth.uid()::text
  )
);

CREATE POLICY "Allow users to delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'service-images' 
  AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR (storage.foldername(name))[2] = auth.uid()::text
  )
);

-- Policy: Allow public read access
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-images');
```

## Verify Setup

After setting up, test by:
1. Going to `/admin/services`
2. Clicking "Add Service"
3. Trying to upload a thumbnail image

If you still get errors, check:
- ✅ Bucket exists and is public
- ✅ Storage policies are created
- ✅ You're logged in as an admin user
- ✅ Your user has `authenticated` role in Supabase Auth
