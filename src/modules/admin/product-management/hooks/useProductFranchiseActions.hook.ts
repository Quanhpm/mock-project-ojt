import { useState } from "react";
import {
  createProductFranchise,
  deleteProductFranchise,
  restoreProductFranchise,
  toggleProductFranchiseStatus,
  updateProductFranchise,
  type ProductFranchiseCreatePayload,
  type ProductFranchiseUpdatePayload,
} from "../api/product-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

export const useProductFranchiseActions = (onSuccess?: () => void) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const { success, error } = useToast();

  const create = async (payload: ProductFranchiseCreatePayload) => {
    try {
      setIsCreating(true);
      const productFranchise = await createProductFranchise(payload);
      success("Product activated for franchise successfully");
      onSuccess?.();
      return productFranchise;
    } catch (err: any) {
      console.error("Failed to create product franchise:", err);
      error(err?.response?.data?.message || "Failed to activate product for franchise");
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const update = async (id: string, payload: ProductFranchiseUpdatePayload) => {
    try {
      setIsUpdating(true);
      await updateProductFranchise(id, payload);
      success("Product franchise updated successfully");
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to update product franchise:", err);
      error(err?.response?.data?.message || "Failed to update product franchise");
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  const remove = async (id: string, productName: string) => {
    try {
      setIsDeleting(true);
      await deleteProductFranchise(id);
      success(`Product "${productName}" deactivated from franchise`);
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to delete product franchise:", err);
      error(err?.response?.data?.message || "Failed to deactivate product");
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const restore = async (id: string, productName: string) => {
    try {
      setIsRestoring(true);
      await restoreProductFranchise(id);
      success(`Product "${productName}" restored`);
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to restore product franchise:", err);
      error(err?.response?.data?.message || "Failed to restore product");
      throw err;
    } finally {
      setIsRestoring(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      setIsToggling(true);
      await toggleProductFranchiseStatus(id, { is_active: !currentStatus });
      success(`Product status updated to ${!currentStatus ? "Active" : "Inactive"}`);
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to toggle status:", err);
      error(err?.response?.data?.message || "Failed to update product status");
      throw err;
    } finally {
      setIsToggling(false);
    }
  };

  return {
    create,
    update,
    remove,
    restore,
    toggleStatus,
    isCreating,
    isUpdating,
    isDeleting,
    isRestoring,
    isToggling,
  };
};
