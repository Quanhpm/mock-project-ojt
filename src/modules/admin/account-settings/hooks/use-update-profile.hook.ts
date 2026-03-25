import { useState } from "react";
import { updateUser } from "@/apis/endpoints/user.api";
import type { UpdateUserRequest } from "@/apis/endpoints/user.api";
import { HttpError } from "@/apis";
import { ENV } from "@/config";
import { validateCloudinaryImageFile } from "@/utils";

// ======================== Cloudinary Config ========================
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${ENV.CLOUDINARY_CLOUD_NAME}/image/upload`;

// ======================== Types ========================
export interface UpdateProfilePayload {
  email: string;
  name: string;
  phone: string;
  avatar_url: string;
}

interface UploadResult {
  success: boolean;
  message: string;
}

// ======================== Helper: Upload ảnh lên Cloudinary ========================

async function uploadAvatarToCloudinary(file: File): Promise<string> {
  validateCloudinaryImageFile(file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", ENV.CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload Cloudinary thất bại (status: ${response.status})`);
  }

  const data = await response.json();
  return data.secure_url as string;
}

// ======================== Hook ========================

export const useUpdateProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Bước 1: Upload ảnh lên Cloudinary ngay khi người dùng chọn file.
   * Trả về secure_url nếu thành công.
   */
  const uploadAvatar = async (
    file: File
  ): Promise<{ success: boolean; url?: string; message: string }> => {
    setIsUploading(true);
    setError(null);
    try {
      const url = await uploadAvatarToCloudinary(file);
      return { success: true, url, message: "Upload ảnh thành công!" };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Upload ảnh thất bại.";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Bước 2: Gọi API PUT /api/users/:id để cập nhật profile.
   * avatar_url đã được upload sẵn từ bước 1.
   */
  const updateProfile = async (
    userId: string,
    profileData: UpdateProfilePayload
  ): Promise<UploadResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody: UpdateUserRequest = {
        email: profileData.email,
        name: profileData.name,
        phone: profileData.phone,
        avatar_url: profileData.avatar_url,
      };

      await updateUser(userId, requestBody);

      return {
        success: true,
        message: "Cập nhật thông tin thành công!",
      };
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Cập nhật thất bại. Vui lòng thử lại.";

      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadAvatar,
    updateProfile,
    isLoading,
    isUploading,
    error,
    clearError: () => setError(null),
  };
};
