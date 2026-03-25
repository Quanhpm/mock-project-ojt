import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import {
  getRoleCode,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type { OrderDetail } from "@/modules/admin/order-management/models/order.models";
import { useOrderFranchiseContext } from "@/modules/admin/order-management/hooks/use-order-franchise-context";
import { orderService } from "@/modules/admin/order-management/services/order.service";
import type {
  DeliverySearchItem,
  DeliveryStatus,
} from "../models/delivery-management.models";
import { deliveryManagementService } from "../services/delivery-management.service";

const getDeliverySortTimestamp = (delivery: DeliverySearchItem) => {
  const rawValue = delivery.assigned_at || delivery.created_at || "";
  const timestamp = new Date(rawValue).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortDeliveriesByNewest = (items: DeliverySearchItem[]) => {
  return [...items].sort((left, right) => {
    return getDeliverySortTimestamp(right) - getDeliverySortTimestamp(left);
  });
};

const buildDeliverySearchPayload = ({
  franchiseId,
  staffId,
  isAdminUser,
  statusFilter,
}: {
  franchiseId: string;
  staffId: string | null;
  isAdminUser: boolean;
  statusFilter: DeliveryStatus | "";
}) => ({
  franchise_id: franchiseId,
  staff_id: isAdminUser ? "" : staffId || "",
  customer_id: "",
  status: statusFilter,
});

export const useDeliveryOrders = () => {
  const authStore = useAdminAuthStore();
  const currentUserId = authStore.admin?.id ?? null;
  const roleCode = getRoleCode(authStore);
  const isAdminUser = roleCode === "ADMIN";
  const { error: showError, success: showSuccess } = useToast();
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise,
  } = useOrderFranchiseContext();

  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");
  const [deliveries, setDeliveries] = useState<DeliverySearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | undefined>();
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<OrderDetail | null>(null);
  const [isLoadingOrderDetail, setIsLoadingOrderDetail] = useState(false);
  const [didFailOrderDetail, setDidFailOrderDetail] = useState(false);
  const [isUpdatingPickup, setIsUpdatingPickup] = useState(false);
  const [isUpdatingComplete, setIsUpdatingComplete] = useState(false);
  const loadDeliveriesRequestIdRef = useRef(0);
  const loadOrderDetailRequestIdRef = useRef(0);

  const loadDeliveries = useCallback(async () => {
    const nextRequestId = loadDeliveriesRequestIdRef.current + 1;
    loadDeliveriesRequestIdRef.current = nextRequestId;

    if (!franchiseId || (!isAdminUser && !currentUserId)) {
      setDeliveries([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await deliveryManagementService.searchDeliveries(
        buildDeliverySearchPayload({
          franchiseId,
          staffId: currentUserId,
          isAdminUser,
          statusFilter,
        }),
      );

      if (loadDeliveriesRequestIdRef.current !== nextRequestId) {
        return;
      }

      setDeliveries(sortDeliveriesByNewest(data ?? []));
    } catch (error) {
      if (loadDeliveriesRequestIdRef.current !== nextRequestId) {
        return;
      }

      console.error("[DeliveryManagement] Failed to load deliveries", error);
      setDeliveries([]);
      showError("Không tải được danh sách delivery");
    } finally {
      if (loadDeliveriesRequestIdRef.current === nextRequestId) {
        setIsLoading(false);
      }
    }
  }, [currentUserId, franchiseId, isAdminUser, showError, statusFilter]);

  useEffect(() => {
    void loadDeliveries();
  }, [loadDeliveries]);

  useEffect(() => {
    if (deliveries.length === 0) {
      setSelectedDeliveryId(undefined);
      return;
    }

    setSelectedDeliveryId((currentValue) => {
      if (currentValue && deliveries.some((delivery) => delivery._id === currentValue)) {
        return currentValue;
      }

      return deliveries[0]._id;
    });
  }, [deliveries]);

  const selectedDelivery = useMemo(() => {
    return deliveries.find((delivery) => delivery._id === selectedDeliveryId) ?? null;
  }, [deliveries, selectedDeliveryId]);

  useEffect(() => {
    if (!selectedDelivery?.order_id) {
      loadOrderDetailRequestIdRef.current += 1;
      setSelectedOrderDetail(null);
      setDidFailOrderDetail(false);
      setIsLoadingOrderDetail(false);
      return;
    }

    const nextRequestId = loadOrderDetailRequestIdRef.current + 1;
    loadOrderDetailRequestIdRef.current = nextRequestId;

    const loadOrderDetail = async () => {
      try {
        setIsLoadingOrderDetail(true);
        setDidFailOrderDetail(false);
        setSelectedOrderDetail(null);
        const orderDetail = await orderService.getOrderById(selectedDelivery.order_id);

        if (loadOrderDetailRequestIdRef.current !== nextRequestId) {
          return;
        }

        setSelectedOrderDetail(orderDetail ?? null);
      } catch (error) {
        console.error("[DeliveryManagement] Failed to load order detail", error);

        if (loadOrderDetailRequestIdRef.current !== nextRequestId) {
          return;
        }

        setSelectedOrderDetail(null);
        setDidFailOrderDetail(true);
      } finally {
        if (loadOrderDetailRequestIdRef.current === nextRequestId) {
          setIsLoadingOrderDetail(false);
        }
      }
    };

    void loadOrderDetail();

    return () => {
      if (loadOrderDetailRequestIdRef.current === nextRequestId) {
        loadOrderDetailRequestIdRef.current += 1;
      }
    };
  }, [selectedDelivery?.order_id]);

  const handlePickup = useCallback(async () => {
    if (!selectedDelivery?._id) {
      return;
    }

    try {
      setIsUpdatingPickup(true);
      await deliveryManagementService.markPickup(selectedDelivery._id);
      showSuccess("Đã chuyển delivery sang pickup");
      await loadDeliveries();
    } catch (error) {
      console.error("[DeliveryManagement] Failed to mark pickup", error);
      showError("Không thể cập nhật trạng thái pickup");
    } finally {
      setIsUpdatingPickup(false);
    }
  }, [loadDeliveries, selectedDelivery?._id, showError, showSuccess]);

  const handleComplete = useCallback(async () => {
    if (!selectedDelivery?._id) {
      return;
    }

    try {
      setIsUpdatingComplete(true);
      await deliveryManagementService.markComplete(selectedDelivery._id);
      showSuccess("Đã cập nhật delivery sang đã giao hàng");
      await loadDeliveries();
    } catch (error) {
      console.error("[DeliveryManagement] Failed to mark delivery completed", error);
      showError("Không thể cập nhật trạng thái đã giao hàng");
    } finally {
      setIsUpdatingComplete(false);
    }
  }, [loadDeliveries, selectedDelivery?._id, showError, showSuccess]);

  return {
    isAdminUser,
    currentUserId,
    franchiseId,
    franchiseName,
    franchiseOptions,
    isLoadingFranchiseOptions: isSwitchingFranchise,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    selectFranchise: switchFranchise,
    deliveries,
    isLoading,
    statusFilter,
    setStatusFilter,
    selectedDeliveryId,
    selectedDelivery,
    selectedOrderDetail,
    isLoadingOrderDetail,
    didFailOrderDetail,
    isUpdatingPickup,
    isUpdatingComplete,
    selectDelivery: setSelectedDeliveryId,
    reload: loadDeliveries,
    pickupSelectedDelivery: handlePickup,
    completeSelectedDelivery: handleComplete,
  };
};
