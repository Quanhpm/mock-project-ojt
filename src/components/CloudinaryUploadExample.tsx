import { useState } from 'react';
import { useCloudinaryUpload } from '@/hooks';
import { Button } from '@/components/ui/button';

/**
 * Example component for Cloudinary image upload
 */
export function CloudinaryUploadExample() {
  const { upload, uploadImage, loading, error } = useCloudinaryUpload();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file, 'ojt-project/images');
      setPreviewUrl(url);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="image-upload" className="text-sm font-medium">
          Upload Image
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
          className="block w-full text-sm border rounded-md"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error.message}</div>}

      {loading && <div className="text-blue-500 text-sm">Uploading...</div>}

      {previewUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Upload successful!</p>
          <img src={previewUrl} alt="Uploaded" className="max-w-xs rounded-md" />
          <p className="text-xs text-gray-500 break-all">{previewUrl}</p>
        </div>
      )}
    </div>
  );
}
