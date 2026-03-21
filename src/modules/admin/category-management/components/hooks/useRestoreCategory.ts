import { useState } from "react";
import { restoreCategoryFranchise } from "../../api/category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useRestoreCategory = () => {
  const [isRestoring, setIsRestoring] = useState(false);
  const { success, error: showError } = useToast();

  const restoreCategory = async (id: string) => {
    setIsRestoring(true);
    try {
      await restoreCategoryFranchise(id);
      success("Category restored successfully");
    } catch (error) {
      showError("Failed to restore category");
      throw error;
    } finally {
      setIsRestoring(false);
    }
  };

  return { restoreCategory, isRestoring };
};
