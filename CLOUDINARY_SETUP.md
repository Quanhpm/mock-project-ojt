# Cloudinary Setup Guide

## Configuration

### Environment Variables

Thêm các biến sau vào `.env` file:

```env
VITE_CLOUDINARY_CLOUD_NAME=de2dyvcb7
VITE_CLOUDINARY_UPLOAD_PRESET=OJT_MOCKPROJECT
```

### Config Files

- **`src/config/cloudinary.config.ts`**: Chứa cấu hình Cloudinary
- **`src/config/env.config.ts`**: Cấu hình environment variables (đã cập nhật)

## Usage

### Basic Upload

```typescript
import { uploadImage, uploadVideo } from '@/utils';

// Upload hình ảnh
const imageUrl = await uploadImage(file, 'folder-name');

// Upload video
const videoUrl = await uploadVideo(file, 'folder-name');
```

### Using Hook

```typescript
import { useCloudinaryUpload } from '@/hooks';

function MyComponent() {
  const { upload, uploadImage, uploadVideo, loading, error } = useCloudinaryUpload();

  const handleUpload = async (file: File) => {
    try {
      const url = await uploadImage(file, 'images');
      console.log('Uploaded:', url);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <>
      <input type="file" onChange={(e) => handleUpload(e.target.files?.[0]!)} />
      {loading && <p>Uploading...</p>}
      {error && <p>{error.message}</p>}
    </>
  );
}
```

### Example Component

Xem `src/components/CloudinaryUploadExample.tsx` để biết ví dụ hoàn chỉnh.

## Features

- ✅ Image upload
- ✅ Video upload  
- ✅ Custom folder organization
- ✅ React hooks for easy integration
- ✅ Error handling
- ✅ Loading states

## Files Created

1. **`src/config/cloudinary.config.ts`**: Cloudinary configuration
2. **`src/utils/cloudinary.util.ts`**: Utility functions for upload
3. **`src/hooks/use-cloudinary.hook.ts`**: React hook for Cloudinary
4. **`src/components/CloudinaryUploadExample.tsx`**: Example component
5. **`.env.example`**: Environment variables template

## Account Info

- **Cloud Name**: de2dyvcb7
- **Upload Preset**: OJT_MOCKPROJECT
- **Package**: cloudinary (v2.9.0)

## Notes

- Upload không cần API key (public upload)
- Deletion từ client không được khuyến khích - sử dụng backend API
- Upload folder được tạo tự động nếu chưa tồn tại
