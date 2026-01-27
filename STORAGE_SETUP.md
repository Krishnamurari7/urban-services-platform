# Supabase Storage Setup Guide

This guide will help you set up the required storage buckets for the Urban Services Platform.

## Required Storage Buckets

### 1. professional-documents

This bucket is used to store verification documents uploaded by professionals.

#### Setup Steps:

1. **Go to Supabase Dashboard**
   - Open your Supabase project
   - Navigate to **Storage** in the left sidebar

2. **Create New Bucket**
   - Click the **"New bucket"** button
   - Enter bucket name: `professional-documents`
   - **Important**: Make it **Public** (toggle the "Public bucket" option)
   - Click **"Create bucket"**

3. **Configure Storage Policies (Optional but Recommended)**

   For better security, you can add RLS policies. Go to **Storage** → **Policies** → **professional-documents** and add:

   ```sql
   -- Allow professionals to upload their own documents
   CREATE POLICY "Professionals can upload own documents"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'professional-documents' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow professionals to view their own documents
   CREATE POLICY "Professionals can view own documents"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'professional-documents' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Allow professionals to delete their own documents
   CREATE POLICY "Professionals can delete own documents"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'professional-documents' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );

   -- Admins can view all documents
   CREATE POLICY "Admins can view all documents"
   ON storage.objects FOR SELECT
   USING (
     bucket_id = 'professional-documents' AND
     EXISTS (
       SELECT 1 FROM profiles
       WHERE id = auth.uid() AND role = 'admin'
     )
   );
   ```

## Quick Setup via SQL (Alternative Method)

If you prefer using SQL, you can create the bucket programmatically:

```sql
-- Note: This requires the Supabase Storage extension
-- You may need to run this in the Supabase SQL Editor

-- Create the bucket (if using Supabase CLI or API)
-- For dashboard method, use the steps above
```

## Verification

After creating the bucket:

1. Go to **Storage** → **Buckets**
2. You should see `professional-documents` in the list
3. Try uploading a document from the Professional Dashboard → Documents tab
4. The upload should work without errors

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `professional-documents` (case-sensitive)
- Check that the bucket is created in the correct Supabase project
- Verify the bucket is set to **Public** if you want public access

### Error: "Permission denied"
- Check that RLS policies are set up correctly
- Verify the user has the correct role (professional)
- Make sure the bucket is public or policies allow access

### Files not uploading
- Check file size (max 10MB in the code)
- Verify file format is allowed (PDF, JPG, PNG, DOC, DOCX)
- Check browser console for detailed error messages

## File Structure

Documents are stored with the following structure:
```
professional-documents/
  └── {user_id}/
      ├── id_proof_{timestamp}.pdf
      ├── certificate_{timestamp}.jpg
      └── license_{timestamp}.png
```

Each professional's documents are stored in a folder named with their user ID for better organization and security.
