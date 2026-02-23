/**
 * Image upload utilities for Supabase Storage
 */

import { createClient } from "@/lib/supabase/client";

export interface UploadImageOptions {
  file: File;
  bucket: string;
  folder?: string;
  userId?: string;
}

export interface UploadImageResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage({
  file,
  bucket,
  folder = "",
  userId,
}: UploadImageOptions): Promise<UploadImageResult> {
  try {
    const supabase = createClient();

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = folder
      ? `${folder}/${userId || "public"}/${timestamp}_${randomStr}.${fileExt}`
      : `${userId || "public"}/${timestamp}_${randomStr}.${fileExt}`;

    // Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      
      // Provide helpful error messages
      let errorMessage = uploadError.message;
      if (uploadError.message?.includes("row-level security") || 
          uploadError.message?.includes("policy")) {
        errorMessage = `Storage bucket '${bucket}' policy error. Please ensure:\n` +
          `1. The bucket '${bucket}' exists in Supabase Storage\n` +
          `2. The bucket is set to Public\n` +
          `3. Storage policies allow authenticated users to upload\n` +
          `See: supabase/storage-setup.md for setup instructions.`;
      } else if (uploadError.message?.includes("Bucket") || 
                 uploadError.message?.includes("not found")) {
        errorMessage = `Storage bucket '${bucket}' not found.\n\n` +
          `Please create it in Supabase Dashboard:\n` +
          `1. Go to Storage in your Supabase project\n` +
          `2. Click 'New bucket'\n` +
          `3. Name: '${bucket}'\n` +
          `4. Make it Public\n` +
          `5. Set up storage policies (see supabase/storage-setup.md)\n` +
          `6. Click 'Create bucket'`;
      }
      
      return {
        url: "",
        path: "",
        error: errorMessage,
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return {
      url: urlData.publicUrl,
      path: fileName,
    };
  } catch (error: any) {
    console.error("Image upload error:", error);
    return {
      url: "",
      path: "",
      error: error.message || "Failed to upload image",
    };
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: File[],
  bucket: string,
  folder?: string,
  userId?: string
): Promise<UploadImageResult[]> {
  const uploadPromises = files.map((file) =>
    uploadImage({ file, bucket, folder, userId })
  );
  return Promise.all(uploadPromises);
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete image" };
  }
}
