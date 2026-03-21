import { useState, useEffect, useCallback } from "react";
import { getFranchisesForSelect } from "@/apis";
import type { FranchiseSelectItem } from "@/apis/endpoints/user.api";
import {
  createProductFranchise,
  type ProductFranchiseCreatePayload,
} from "../api/product-franchise.api";
import { useToast } from "@/hooks/use-toast.hook";

// ======================== Types ========================

export type AssignFranchiseStep = 1 | 2;

export interface AssignFranchiseFormData {
  franchise_id: string;
  size: string;
  price_base: number;
}

export interface UseAssignProductFranchiseReturn {
  // State
  currentStep: AssignFranchiseStep;
  createdProductId: string | null;
  isSubmitting: boolean;
  error: string | null;
  franchises: FranchiseSelectItem[];
  isFranchisesLoading: boolean;

  // Actions
  /** Step 1 hoàn thành → lưu productId và chuyển sang Step 2 */
  goToStep2: (productId: string) => void;
  /** Step 2 submit → gọi POST /product-franchises */
  handleAssignFranchise: (formData: AssignFranchiseFormData) => Promise<void>;
  /** Quay lại step 1 */
  goBackToStep1: () => void;
  /** Reset toàn bộ flow */
  resetFlow: () => void;
  /** Khởi tạo trực tiếp cho Luồng 2 (từ Table) — set productId và nhảy sang step 2 */
  initWithProductId: (productId: string) => void;
}

// ======================== Hook ========================

export const useAssignProductFranchise = (
  onSuccess?: () => void,
): UseAssignProductFranchiseReturn => {
  const [currentStep, setCurrentStep] = useState<AssignFranchiseStep>(1);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Franchise dropdown data
  const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([]);
  const [isFranchisesLoading, setIsFranchisesLoading] = useState(false);

  // ──────── Fetch franchises khi sang step 2 ────────
  useEffect(() => {
    if (currentStep !== 2) return;
    let cancelled = false;

    const fetchFranchises = async () => {
      setIsFranchisesLoading(true);
      try {
        const data = await getFranchisesForSelect();
        if (!cancelled) {
          setFranchises(data ?? []);
        }
      } catch (err) {
        if (err === null) return; // cancelled
        if (!cancelled) {
          console.error("Failed to fetch franchises:", err);
          setFranchises([]);
        }
      } finally {
        if (!cancelled) {
          setIsFranchisesLoading(false);
        }
      }
    };

    fetchFranchises();
    return () => {
      cancelled = true;
    };
  }, [currentStep]);

  const { success: toastSuccess, error: toastError } = useToast();

  // ──────── Luồng 1: Step 1 xong → chuyển Step 2 ────────
  const goToStep2 = useCallback((productId: string) => {
    setCreatedProductId(productId);
    setCurrentStep(2);
    setError(null);
  }, []);

  // ──────── Luồng 2: Khởi tạo trực tiếp từ Table ────────
  const initWithProductId = useCallback((productId: string) => {
    setCreatedProductId(productId);
    setCurrentStep(2);
    setError(null);
  }, []);

  // ──────── Step 2: Submit assign franchise ────────
  const handleAssignFranchise = useCallback(
    async (formData: AssignFranchiseFormData) => {
      if (!createdProductId) {
        setError("Missing product ID. Please go back and try again.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        const payload: ProductFranchiseCreatePayload = {
          franchise_id: formData.franchise_id,
          product_id: createdProductId,
          size: formData.size,
          price_base: formData.price_base,
        };

        await createProductFranchise(payload);
        toastSuccess(
          "Franchise assigned",
          "Product has been assigned to the selected franchise.",
        );
        onSuccess?.();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to assign franchise.";
        setError(message);
        toastError("Assign failed", message);
        throw err; // Re-throw để caller biết
      } finally {
        setIsSubmitting(false);
      }
    },
    [createdProductId, onSuccess, toastSuccess, toastError],
  );

  const goBackToStep1 = useCallback(() => {
    setCurrentStep(1);
    setError(null);
  }, []);

  const resetFlow = useCallback(() => {
    setCurrentStep(1);
    setCreatedProductId(null);
    setIsSubmitting(false);
    setError(null);
    setFranchises([]);
  }, []);

  return {
    currentStep,
    createdProductId,
    isSubmitting,
    error,
    franchises,
    isFranchisesLoading,
    goToStep2,
    handleAssignFranchise,
    goBackToStep1,
    resetFlow,
    initWithProductId,
  };
};
