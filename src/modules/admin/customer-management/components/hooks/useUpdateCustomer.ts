import { useState } from "react";
import { customerApi, HttpError } from "@/apis";
import type { CustomerUpdatePayload, Customer } from "@/types/customer.types";
import { useToast } from "@/hooks/use-toast.hook";

export const useUpdateCustomer = () => {
  const { error: showErrorToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCustomer = async (
    id: string,
    payload: CustomerUpdatePayload,
    onSuccess?: (updatedCustomer: Customer) => void,
  ) => {
    setIsUpdating(true);
    setError(null);

    try {
      const updatedCustomer = await customerApi.updateCustomer(id, payload);
      onSuccess?.(updatedCustomer);
      return updatedCustomer;
    } catch (err: unknown) {
      const message =
        err instanceof HttpError
          ? err.message
          : "Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại!";
      setError(message);
      showErrorToast("Cập nhật thất bại", message);
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateCustomer, isUpdating, error, setError };
};
