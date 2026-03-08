import { useState } from "react";
import { 
  deleteProductCategoryFranchise, 
  toggleProductCategoryStatus,
  restoreProductCategoryFranchise,
  reorderProductCategory
} from "../api/product-category-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useProductCategoryActions = (onSuccess?: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  
  const { success, error } = useToast();

  const deleteProduct = async (id: string, productName: string) => {
    try {
      setIsDeleting(true);
      await deleteProductCategoryFranchise(id);
      success(`Product "${productName}" removed from category`);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to delete product:", err);
      error("Failed to remove product from category");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsToggling(true);
      await toggleProductCategoryStatus(id, { is_active: !currentStatus });
      success(`Product status updated to ${!currentStatus ? "Active" : "Inactive"}`);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to toggle status:", err);
      error("Failed to update product status");
    } finally {
      setIsToggling(false);
    }
  };

  const restoreProduct = async (id: string, productName: string) => {
    try {
      setIsRestoring(true);
      await restoreProductCategoryFranchise(id);
      success(`Product "${productName}" restored`);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to restore product:", err);
      error("Failed to restore product");
    } finally {
      setIsRestoring(false);
    }
  };

  const reorderProduct = async (id: string, newOrder: number) => {
    try {
      setIsReordering(true);
      await reorderProductCategory(id, { display_order: newOrder });
      success("Display order updated");
      onSuccess?.();
    } catch (err) {
      console.error("Failed to reorder product:", err);
      error("Failed to update display order");
    } finally {
      setIsReordering(false);
    }
  };

  return {
    deleteProduct,
    toggleStatus,
    restoreProduct,
    reorderProduct,
    isDeleting,
    isToggling,
    isRestoring,
    isReordering,
  };
};
