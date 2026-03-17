import { useState } from "react";
import { customerApi, HttpError } from "@/apis";
import type { CustomerCreatePayload, Customer } from "@/types/customer.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useCreateCustomer = () => {
  const { error: showErrorToast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCustomer = async (
    payload: CustomerCreatePayload,
    onSuccess?: (newCustomer: Customer) => void,
  ) => {
    setIsCreating(true);
    setError(null);

    try {
      const newCustomer = await customerApi.createCustomer(payload);
      onSuccess?.(newCustomer);
      return newCustomer;
    } catch (err: unknown) {
      const message =
        err instanceof HttpError
          ? err.message
          : "Có lỗi xảy ra khi tạo khách hàng mới. Vui lòng thử lại!";
      setError(message);
      showErrorToast("Tạo mới thất bại", message);
    } finally {
      setIsCreating(false);
    }
  };

  return { createCustomer, isCreating, error, setError };
};
