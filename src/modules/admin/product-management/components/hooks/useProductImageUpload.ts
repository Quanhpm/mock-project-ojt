import { useCallback, useState } from "react";
import type { UseFormGetValues, UseFormSetValue } from "react-hook-form";
import { useToast } from "@/hooks/use-toast.hook";
import { uploadImage, validateCloudinaryImageFile } from "@/utils";
import type { ProductFormInput } from "../productForm.schema";

interface UseProductImageUploadOptions {
  setValue: UseFormSetValue<ProductFormInput>;
  getValues: UseFormGetValues<ProductFormInput>;
}

const validateImageFile = (file: File) => {
  validateCloudinaryImageFile(file);
};

export const useProductImageUpload = ({
  setValue,
  getValues,
}: UseProductImageUploadOptions) => {
  const { success: showSuccess, error: showError } = useToast();
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const [isUploadingGalleryImages, setIsUploadingGalleryImages] =
    useState(false);

  const uploadSingleImage = useCallback(async (file: File, folder: string) => {
    validateImageFile(file);
    return uploadImage(file, folder);
  }, []);

  const uploadMainImage = useCallback(
    async (file: File) => {
      setIsUploadingMainImage(true);

      try {
        const url = await uploadSingleImage(file, "products/main");

        setValue("image_url", url, {
          shouldDirty: true,
          shouldValidate: true,
        });

        showSuccess("Upload success", "Main image uploaded successfully.");
        return url;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to upload the main image.";

        showError("Upload failed", message);
        return null;
      } finally {
        setIsUploadingMainImage(false);
      }
    },
    [setValue, showError, showSuccess, uploadSingleImage],
  );

  const uploadGalleryImages = useCallback(
    async (files: FileList | File[]) => {
      const nextFiles = Array.from(files);
      if (nextFiles.length === 0) return [];

      setIsUploadingGalleryImages(true);

      try {
        const urls = await Promise.all(
          nextFiles.map((file) =>
            uploadSingleImage(file, "products/additional"),
          ),
        );

        const currentImages = getValues("images_url") ?? [];
        setValue("images_url", [...currentImages, ...urls], {
          shouldDirty: true,
          shouldValidate: true,
        });

        showSuccess(
          "Upload success",
          `${urls.length} additional image(s) uploaded.`,
        );

        return urls;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to upload the additional images.";

        showError("Upload failed", message);
        return [];
      } finally {
        setIsUploadingGalleryImages(false);
      }
    },
    [getValues, setValue, showError, showSuccess, uploadSingleImage],
  );

  return {
    uploadMainImage,
    uploadGalleryImages,
    isUploadingMainImage,
    isUploadingGalleryImages,
  };
};
