import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type { OrderDetail, PaymentDetail } from "../models/order.models";
import type { CustomerOption } from "../models/customer.models";
import type { DeliveryAssigneeOption } from "../models/delivery-assignee.models";
import { loadOrderDetailUsecase } from "../usecases/load-order-detail.usecase";
import { orderService } from "../services/order.service";
import { customerService } from "../services/customer.service";
import { paymentService } from "../services/payment.service";
import { deliveryService } from "../services/delivery.service";
import { deliveryAssigneeService } from "../services/delivery-assignee.service";

interface UseOrderDetailPageOptions {
  onStatusUpdated?: () => void | Promise<void>;
}

export const useOrderDetailPage = (
  orderId?: string,
  options: UseOrderDetailPageOptions = {},
) => {
  const { onStatusUpdated } = options;
  const { error: showError, success: showSuccess } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);
  const [isReadyForPickupModalOpen, setIsReadyForPickupModalOpen] = useState(false);
  const [deliveryAssignees, setDeliveryAssignees] = useState<DeliveryAssigneeOption[]>([]);
  const [selectedDeliveryAssigneeId, setSelectedDeliveryAssigneeId] = useState<string | null>(null);
  const [isLoadingDeliveryAssignees, setIsLoadingDeliveryAssignees] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!orderId) {
      setOrder(null);
      setPayment(null);
      setCustomer(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await loadOrderDetailUsecase(orderId);
      const nextOrder = data.order ?? null;
      setOrder(nextOrder);
      setPayment(data.payment ?? null);

      if (!nextOrder?.customer_id) {
        setCustomer(null);
        return;
      }

      try {
        const nextCustomer = await customerService.getCustomerById(nextOrder.customer_id);
        setCustomer(nextCustomer ?? null);
      } catch (error) {
        console.error("[OrderDetail] Failed to load customer detail", error);
        setCustomer(null);
      }
    } catch (error) {
      console.error("[OrderDetail] Failed to load detail", error);
      showError("Không tải được chi tiết đơn hàng");
      setOrder(null);
      setPayment(null);
      setCustomer(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, showError]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const closeReadyForPickupModal = useCallback(() => {
    setIsReadyForPickupModalOpen(false);
    setSelectedDeliveryAssigneeId(null);
    setDeliveryAssignees([]);
    setIsLoadingDeliveryAssignees(false);
  }, []);

  const updateStatus = useCallback(
    async (
      action: "preparing" | "ready-for-pickup" | "pickup" | "complete",
      options?: { staffId?: string | null },
    ) => {
      if (!orderId) {
        return false;
      }

      const currentDeliveryId = order?.delivery_id || order?.delivery?._id;

      try {
        setIsUpdatingStatus(true);

        if (action === "preparing") {
          await orderService.markPreparing(orderId);
          showSuccess("Đơn hàng đã chuyển sang đang chuẩn bị");
        } else if (action === "ready-for-pickup") {
          if (!options?.staffId) {
            showError("Vui lòng chọn staff giao hàng");
            return;
          }

          await orderService.markReadyForPickup(orderId, {
            staff_id: options.staffId,
          });
          showSuccess("Đơn hàng đã chuyển sang sẵn sàng lấy");
        } else {
          const resolvedDeliveryId =
            action === "pickup"
              ? (await deliveryService.getDeliveryByOrderId(orderId))?._id
              : currentDeliveryId || (await deliveryService.getDeliveryByOrderId(orderId))?._id;

          if (!resolvedDeliveryId) {
            showError("Không tìm thấy delivery để cập nhật trạng thái");
            return false;
          }

          if (action === "pickup") {
            await deliveryService.markPickup(resolvedDeliveryId);
            showSuccess("Đơn hàng đã được bàn giao cho giao vận");
          } else {
            await deliveryService.markComplete(resolvedDeliveryId);
            showSuccess("Đơn hàng đã hoàn thành");
          }
        }

        await loadDetail();
        await onStatusUpdated?.();
        return true;
      } catch (error) {
        console.error("[OrderDetail] Failed to update status", error);
        showError("Không cập nhật được trạng thái đơn hàng");
        return false;
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [loadDetail, onStatusUpdated, order?.delivery?._id, order?.delivery_id, orderId, showError, showSuccess],
  );

  const openReadyForPickupModal = useCallback(async () => {
    if (!order?.franchise_id) {
      showError("Không tìm thấy chi nhánh của đơn hàng");
      return;
    }

    try {
      setIsReadyForPickupModalOpen(true);
      setIsLoadingDeliveryAssignees(true);
      const nextAssignees =
        await deliveryAssigneeService.getAssignableStaffByFranchise(order.franchise_id);
      const normalizedAssignees = nextAssignees ?? [];

      setDeliveryAssignees(normalizedAssignees);
      setSelectedDeliveryAssigneeId(normalizedAssignees[0]?.value ?? null);
    } catch (error) {
      console.error("[OrderDetail] Failed to load delivery assignees", error);
      showError("Không tải được danh sách staff giao hàng");
      closeReadyForPickupModal();
    } finally {
      setIsLoadingDeliveryAssignees(false);
    }
  }, [closeReadyForPickupModal, order?.franchise_id, showError]);

  const confirmReadyForPickup = useCallback(async () => {
    const didUpdate = await updateStatus("ready-for-pickup", {
      staffId: selectedDeliveryAssigneeId,
    });

    if (didUpdate) {
      closeReadyForPickupModal();
    }
  }, [closeReadyForPickupModal, selectedDeliveryAssigneeId, updateStatus]);

  const confirmPayment = useCallback(
    async (method: string) => {
      if (!payment?._id) {
        showError("Không tìm thấy giao dịch thanh toán");
        return;
      }

      try {
        setIsConfirmingPayment(true);
        await paymentService.confirmPayment(payment._id, {
          method,
          providerTxnId: "",
        });
        showSuccess("Thanh toán thành công");
        await loadDetail();
        await onStatusUpdated?.();
      } catch (error) {
        console.error("[OrderDetail] Failed to confirm payment", error);
        showError("Không xác nhận được thanh toán");
      } finally {
        setIsConfirmingPayment(false);
      }
    },
    [loadDetail, onStatusUpdated, payment?._id, showError, showSuccess],
  );

  return {
    order,
    payment,
    customer,
    isLoading,
    isUpdatingStatus,
    isConfirmingPayment,
    isReadyForPickupModalOpen,
    deliveryAssignees,
    selectedDeliveryAssigneeId,
    isLoadingDeliveryAssignees,
    reload: loadDetail,
    confirmPayment,
    openReadyForPickupModal,
    closeReadyForPickupModal,
    confirmReadyForPickup,
    selectDeliveryAssignee: setSelectedDeliveryAssigneeId,
    markPreparing: () => updateStatus("preparing"),
    markReadyForPickup: openReadyForPickupModal,
    markPickup: () => updateStatus("pickup"),
    markComplete: () => updateStatus("complete"),
  };
};
