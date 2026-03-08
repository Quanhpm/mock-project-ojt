import { useState } from "react";
import { deleteCategoryFranchise } from "../../api/category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useDeleteCategory = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { success, error: showError } = useToast();

  const deleteCategory = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteCategoryFranchise(id);
      success("Xóa danh mục thành công");
    } catch (error) {
      showError("Xóa danh mục thất bại");
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteCategory, isDeleting };
};
