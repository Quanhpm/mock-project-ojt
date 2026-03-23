import { useState } from "react";
import { voucherApi } from "@/apis/endpoints/voucher.api";
import type { Voucher } from "../voucher.types";
import { useToast } from "@/hooks/use-toast.hook";

interface UseGetVoucherByIdReturn {
  voucher: Voucher | null;
  isLoading: boolean;
  error: string | null;
  fetchById: (id: string) => Promise<void>;
}

export const useGetVoucherById = (): UseGetVoucherByIdReturn => {
  const [voucher, setVoucher] = useState<Voucher | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToast();

  const fetchById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await voucherApi.getVoucherById(id);
      setVoucher(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error loading voucher information";
      setError(errorMessage);
      showError("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { voucher, isLoading, error, fetchById };
};
