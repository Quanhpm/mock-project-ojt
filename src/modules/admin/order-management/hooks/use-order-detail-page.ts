import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type { OrderDetail, PaymentDetail } from "../models/order.models";
import { loadOrderDetailUsecase } from "../usecases/load-order-detail.usecase";
import { orderService } from "../services/order.service";

export const useOrderDetailPage = (orderId?: string) => {
  const { error: showError, success: showSuccess } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setPayment(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await loadOrderDetailUsecase(orderId);
      setOrder(data.order ?? null);
      setPayment(data.payment ?? null);
    } catch (error) {
      console.error("[OrderDetail] Failed to load detail", error);
      showError("Không tải được chi tiết đơn hàng");
      setOrder(null);
      setPayment(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, showError]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const updateStatus = useCallback(
    async (action: "preparing" | "ready-for-pickup") => {
      if (!orderId) {
        return;
      }

      try {
        setIsUpdatingStatus(true);

        if (action === "preparing") {
          await orderService.markPreparing(orderId);
          showSuccess("Đơn hàng đã chuyển sang đang chuẩn bị");
        } else {
          await orderService.markReadyForPickup(orderId);
          showSuccess("Đơn hàng đã chuyển sang sẵn sàng lấy");
        }

        await loadDetail();
      } catch (error) {
        console.error("[OrderDetail] Failed to update status", error);
        showError("Không cập nhật được trạng thái đơn hàng");
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [loadDetail, orderId, showError, showSuccess],
  );

  return {
    order,
    payment,
    isLoading,
    isUpdatingStatus,
    reload: loadDetail,
    markPreparing: () => updateStatus("preparing"),
    markReadyForPickup: () => updateStatus("ready-for-pickup"),
  };
};
