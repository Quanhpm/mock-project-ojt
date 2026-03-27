import { useCallback, useState } from "react";
import type { UseFormSetValue } from "react-hook-form";
import { useToast } from "@/hooks/use-toast.hook";
import { uploadImage, validateCloudinaryImageFile } from "@/utils";
import type { FranchiseFormValues } from "../franchiseForm.schema";

interface UseFranchiseLogoUploadOptions {
  setValue: UseFormSetValue<FranchiseFormValues>;
}

const validateLogoFile = (file: File) => {
  validateCloudinaryImageFile(file);
};

export const useFranchiseLogoUpload = ({
  setValue,
}: UseFranchiseLogoUploadOptions) => {
  const { success: showSuccess, error: showError } = useToast();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const uploadLogo = useCallback(
    async (file: File) => {
      setIsUploadingLogo(true);

      try {
        validateLogoFile(file);
        const url = await uploadImage(file, "franchises/logo");

        setValue("logo_url", url, {
          shouldDirty: true,
          shouldValidate: true,
        });

        showSuccess("Upload success", "Logo uploaded successfully.");
        return url;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to upload the logo.";

        showError("Upload failed", message);
        return null;
      } finally {
        setIsUploadingLogo(false);
      }
    },
    [setValue, showError, showSuccess],
  );

  return {
    uploadLogo,
    isUploadingLogo,
  };
};
