import { CLOUDINARY_CONFIG } from '@/config';

/**
 * Upload a file to Cloudinary
 * @param file - File to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Promise with upload result containing URL
 */
export async function uploadToCloudinary(
  file: File | Blob,
  folder?: string
): Promise<{
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);

  if (folder) {
    formData.append('folder', folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/auto/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      resource_type: data.resource_type,
      format: data.format,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload an image to Cloudinary
 * @param file - Image file to upload
 * @param folder - Optional folder name
 * @returns Promise with image URL
 */
export async function uploadImage(
  file: File,
  folder: string = 'images'
): Promise<string> {
  const result = await uploadToCloudinary(file, folder);
  return result.secure_url;
}

/**
 * Upload a video to Cloudinary
 * @param file - Video file to upload
 * @param folder - Optional folder name
 * @returns Promise with video URL
 */
export async function uploadVideo(
  file: File,
  folder: string = 'videos'
): Promise<string> {
  const result = await uploadToCloudinary(file, folder);
  return result.secure_url;
}

/**
 * Delete a resource from Cloudinary
 * @param publicId - Public ID of the resource
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Note: Deletion requires admin API key and should be done from backend
  // This is kept here for reference
  console.warn(
    'Direct deletion from client is not recommended. Use API endpoint instead.'
  );
}

/**
 * Get Cloudinary config
 */
export function getCloudinaryConfig() {
  return {
    cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
    uploadPreset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
  };
}
