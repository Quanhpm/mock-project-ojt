import { useState } from 'react';
import { uploadImage, uploadVideo, uploadToCloudinary } from '@/utils';

interface UploadOptions {
  folder?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for uploading files to Cloudinary
 */
export function useCloudinaryUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const upload = async (file: File, options?: UploadOptions) => {
    setLoading(true);
    setError(null);

    try {
      const url = await uploadToCloudinary(file, options?.folder);
      options?.onSuccess?.(url.secure_url);
      setLoading(false);
      return url.secure_url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      options?.onError?.(error);
      setLoading(false);
      throw error;
    }
  };

  const uploadImageFile = async (file: File, folder?: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = await uploadImage(file, folder);
      setLoading(false);
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  const uploadVideoFile = async (file: File, folder?: string) => {
    setLoading(true);
    setError(null);

    try {
      const url = await uploadVideo(file, folder);
      setLoading(false);
      return url;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  return {
    upload,
    uploadImage: uploadImageFile,
    uploadVideo: uploadVideoFile,
    loading,
    error,
  };
}
