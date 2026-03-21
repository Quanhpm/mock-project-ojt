import { useState } from "react";
import { createCategoryFranchise } from "../../api/category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";
import type { CategoryFranchiseCreatePayload } from "../../api/category-franchise.types";

export const useCreateCategory = () => {
  const [isCreating, setIsCreating] = useState(false);
  const { success, error: showError } = useToast();

  const createCategory = async (payload: CategoryFranchiseCreatePayload) => {
    setIsCreating(true);
    try {
      const result = await createCategoryFranchise(payload);
      success("Category assigned to franchise successfully");
      return result;
    } catch (error) {
      showError("Failed to add category");
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return { createCategory, isCreating };
};
