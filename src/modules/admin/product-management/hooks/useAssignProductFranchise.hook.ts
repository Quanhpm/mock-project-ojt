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
  /** Complete step 1 and move to step 2 with created product id. */
  goToStep2: (productId: string) => void;
  /** Submit step 2 and call POST /product-franchises. */
  handleAssignFranchise: (formData: AssignFranchiseFormData) => Promise<void>;
  /** Go back to step 1. */
  goBackToStep1: () => void;
  /** Reset the full flow state. */
  resetFlow: () => void;
  /** Initialize directly for step 2 (from table actions). */
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

  // Fetch franchises when entering step 2.
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

  // Flow 1: finish step 1 and move to step 2.
  const goToStep2 = useCallback((productId: string) => {
    setCreatedProductId(productId);
    setCurrentStep(2);
    setError(null);
  }, []);

  // Flow 2: direct initialization from table action.
  const initWithProductId = useCallback((productId: string) => {
    setCreatedProductId(productId);
    setCurrentStep(2);
    setError(null);
  }, []);

  // Step 2: submit franchise assignment.
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
        toastSuccess("Assignment successful", "The product was assigned to the franchise.");
        onSuccess?.();
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to assign franchise.";
        setError(message);
        toastError("Assignment failed", message);
        throw err;
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
