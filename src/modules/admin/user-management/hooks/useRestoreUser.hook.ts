import { useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import { userApi } from "../api";

export const useRestoreUser = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const restoreUser = async (
    id: string,
    onSuccess?: () => void,
  ) => {
    setIsRestoring(true);
    try {
      await userApi.restoreUser(id);
      showSuccess("Success", "User restored successfully");
      onSuccess?.();
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : "Failed to restore user";
      showError("Error", errMessage);
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreUser, isRestoring };
};
