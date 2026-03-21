import { useState } from "react";
import { toggleCategoryFranchiseStatus } from "../../api/category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useToggleStatus = () => {
  const [isToggling, setIsToggling] = useState(false);
  const { success, error: showError } = useToast();

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    setIsToggling(true);
    try {
      await toggleCategoryFranchiseStatus(id, { is_active: !currentStatus });
      success(
        `Category ${!currentStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      showError("Failed to update category status");
      throw error;
    } finally {
      setIsToggling(false);
    }
  };

  return { toggleStatus, isToggling };
};
