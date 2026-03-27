import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import type { DeliveryAssigneeOption } from "../models/delivery-assignee.models";
import type { StaffQueueOrder, StaffQueueSortMode } from "../models/order.models";
import { useOrderFranchiseContext } from "./use-order-franchise-context";
import { orderService } from "../services/order.service";
import { deliveryAssigneeService } from "../services/delivery-assignee.service";
import { hydrateStaffOrderQueueDetailsUsecase } from "../usecases/hydrate-staff-order-queue-details.usecase";
import { loadStaffOrderQueueUsecase } from "../usecases/load-staff-order-queue.usecase";

const DETAIL_BATCH_SIZE = 9;
const DETAIL_REQUEST_CONCURRENCY = 3;
const STAFF_QUEUE_VISIBLE_STATUSES = new Set<StaffQueueOrder["status"]>(["CONFIRMED", "PREPARING"]);

const hasLoadedQueueOrderDetail = (order: StaffQueueOrder) => order.detailLoadState === "loaded";
const hasFailedQueueOrderDetail = (order: StaffQueueOrder) => order.detailLoadState === "failed";
const isLoadingQueueOrderDetail = (order: StaffQueueOrder) => order.detailLoadState === "loading";
const needsQueueOrderDetail = (order: StaffQueueOrder) =>
  !hasLoadedQueueOrderDetail(order) && !hasFailedQueueOrderDetail(order);

const markQueueOrdersAsLoading = (
  orders: StaffQueueOrder[],
  targetOrderIds: Set<string>,
): StaffQueueOrder[] => {
  return orders.map((order) =>
    targetOrderIds.has(order._id)
      ? {
          ...order,
          detailLoadState: "loading" as const,
          detailLoadFailed: false,
        }
      : order,
  );
};

const mergeQueueOrdersWithExistingDetails = (
  nextOrders: StaffQueueOrder[],
  currentOrders: StaffQueueOrder[],
) => {
  const currentByCode = new Map(currentOrders.map((order) => [order.code, order]));

  return nextOrders.map((nextOrder) => {
    const existingOrder = currentByCode.get(nextOrder.code);

    if (!existingOrder) {
      return nextOrder;
    }

    if (hasLoadedQueueOrderDetail(existingOrder)) {
      return {
        ...nextOrder,
        customer_name: existingOrder.customer_name ?? nextOrder.customer_name,
        phone: existingOrder.phone ?? nextOrder.phone,
        franchise_name: existingOrder.franchise_name ?? nextOrder.franchise_name,
        order_items: existingOrder.order_items,
        detailLoadState: "loaded",
        detailLoadFailed: false,
      };
    }

    if (hasFailedQueueOrderDetail(existingOrder)) {
      return {
        ...nextOrder,
        detailLoadState: "failed",
        detailLoadFailed: true,
      };
    }

    if (isLoadingQueueOrderDetail(existingOrder)) {
      return {
        ...nextOrder,
        detailLoadState: "loading",
        detailLoadFailed: false,
      };
    }

    return nextOrder;
  });
};

export const useStaffOrderQueuePage = () => {
  const { error: showError, success: showSuccess } = useToast();
  const franchiseContext = useOrderFranchiseContext({
    adminGlobalScopeKey: "staff-queue",
  });
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise,
  } = franchiseContext;

  const [orders, setOrders] = useState<StaffQueueOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [isReadyForPickupModalOpen, setIsReadyForPickupModalOpen] = useState(false);
  const [selectedReadyOrder, setSelectedReadyOrder] = useState<StaffQueueOrder | null>(null);
  const [deliveryAssignees, setDeliveryAssignees] = useState<DeliveryAssigneeOption[]>([]);
  const [selectedDeliveryAssigneeId, setSelectedDeliveryAssigneeId] = useState<string | null>(null);
  const [isLoadingDeliveryAssignees, setIsLoadingDeliveryAssignees] = useState(false);
  const [isSubmittingReadyForPickup, setIsSubmittingReadyForPickup] = useState(false);
  const [sortMode, setSortMode] = useState<StaffQueueSortMode>("ALL");
  const [detailWindowSize, setDetailWindowSize] = useState(DETAIL_BATCH_SIZE);
  const ordersRef = useRef<StaffQueueOrder[]>([]);
  const loadRequestIdRef = useRef(0);
  const queueScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [loadMoreTriggerElement, setLoadMoreTriggerElement] = useState<HTMLDivElement | null>(null);
  const detailLoadingOrderIdsRef = useRef<Set<string>>(new Set());

  const hydrateOrderBatch = useCallback(
    async (
      ordersToHydrate: StaffQueueOrder[],
      requestId = loadRequestIdRef.current,
      options: { skipMarkLoading?: boolean } = {},
    ) => {
      const { skipMarkLoading = false } = options;

      if (ordersToHydrate.length === 0) {
        return;
      }

      const targetOrderIds = new Set(ordersToHydrate.map((order) => order._id));

      ordersToHydrate.forEach((order) => {
        detailLoadingOrderIdsRef.current.add(order._id);
      });

      if (!skipMarkLoading) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            targetOrderIds.has(order._id)
              ? {
                  ...order,
                  detailLoadState: "loading",
                  detailLoadFailed: false,
                }
              : order,
          ),
        );
      }

      try {
        const hydratedOrders = await hydrateStaffOrderQueueDetailsUsecase(
          ordersToHydrate,
          DETAIL_REQUEST_CONCURRENCY,
        );

        if (loadRequestIdRef.current !== requestId) {
          return;
        }

        const hydratedOrderMap = new Map(hydratedOrders.map((order) => [order._id, order]));

        setOrders((currentOrders) =>
          currentOrders.map((order) => hydratedOrderMap.get(order._id) ?? order),
        );
      } finally {
        ordersToHydrate.forEach((order) => {
          detailLoadingOrderIdsRef.current.delete(order._id);
        });
      }
    },
    [],
  );

  const loadQueue = useCallback(
    async (options: { preserveList?: boolean } = {}) => {
      const { preserveList = false } = options;
      const nextRequestId = loadRequestIdRef.current + 1;
      loadRequestIdRef.current = nextRequestId;

      if (!franchiseId) {
        detailLoadingOrderIdsRef.current.clear();
        ordersRef.current = [];
        setOrders([]);
        setIsLoading(false);
        return;
      }

      try {
        if (!preserveList) {
          setIsLoading(true);
          ordersRef.current = [];
          setOrders([]);
          setDetailWindowSize(DETAIL_BATCH_SIZE);
          detailLoadingOrderIdsRef.current.clear();
        }

        const nextOrders = await loadStaffOrderQueueUsecase(franchiseId);

        if (loadRequestIdRef.current !== nextRequestId) {
          return;
        }

        const mergedOrders = mergeQueueOrdersWithExistingDetails(nextOrders, ordersRef.current);
        const initialOrdersNeedingDetails = mergedOrders
          .slice(0, DETAIL_BATCH_SIZE)
          .filter(needsQueueOrderDetail);

        initialOrdersNeedingDetails.forEach((order) => {
          detailLoadingOrderIdsRef.current.add(order._id);
        });

        const initialOrderIds = new Set(initialOrdersNeedingDetails.map((order) => order._id));
        const primedOrders = markQueueOrdersAsLoading(mergedOrders, initialOrderIds);

        setOrders(primedOrders);

        if (initialOrdersNeedingDetails.length > 0) {
          void hydrateOrderBatch(initialOrdersNeedingDetails, nextRequestId, {
            skipMarkLoading: true,
          });
        }
      } catch (error) {
        if (loadRequestIdRef.current !== nextRequestId) {
          return;
        }

        console.error("[StaffOrderQueue] Failed to load queue", error);

        if (!preserveList) {
          setOrders([]);
        }

        showError("Không tải được hàng đợi order");
      } finally {
        if (!preserveList && loadRequestIdRef.current === nextRequestId) {
          setIsLoading(false);
        }
      }
    },
    [franchiseId, hydrateOrderBatch, showError],
  );

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    setDetailWindowSize(DETAIL_BATCH_SIZE);
  }, [franchiseId, sortMode]);

  const closeReadyForPickupModal = useCallback(() => {
    setIsReadyForPickupModalOpen(false);
    setSelectedReadyOrder(null);
    setSelectedDeliveryAssigneeId(null);
    setDeliveryAssignees([]);
    setIsLoadingDeliveryAssignees(false);
  }, []);

  const markPreparing = useCallback(
    async (order: StaffQueueOrder) => {
      if (order.status !== "CONFIRMED") {
        return;
      }

      try {
        setUpdatingOrderId(order._id);
        await orderService.markPreparing(order._id);
        setOrders((currentOrders) =>
          currentOrders.map((currentOrder) =>
            currentOrder._id === order._id
              ? {
                  ...currentOrder,
                  status: "PREPARING",
                }
              : currentOrder,
          ),
        );
        showSuccess("Đơn hàng đã chuyển sang đang chuẩn bị");
        await loadQueue({ preserveList: true });
      } catch (error) {
        console.error("[StaffOrderQueue] Failed to mark preparing", error);
        showError("Không cập nhật được trạng thái preparing");
      } finally {
        setUpdatingOrderId(null);
      }
    },
    [loadQueue, showError, showSuccess],
  );

  const openReadyForPickupModal = useCallback(
    async (order: StaffQueueOrder) => {
      if (order.status !== "PREPARING") {
        return;
      }

      const resolvedFranchiseId = order.franchise_id || franchiseId;

      if (!resolvedFranchiseId) {
        showError("Không tìm thấy chi nhánh của đơn hàng");
        return;
      }

      try {
        setSelectedReadyOrder(order);
        setIsReadyForPickupModalOpen(true);
        setIsLoadingDeliveryAssignees(true);

        const nextAssignees =
          await deliveryAssigneeService.getAssignableStaffByFranchise(resolvedFranchiseId);
        const normalizedAssignees = nextAssignees ?? [];

        setDeliveryAssignees(normalizedAssignees);
        setSelectedDeliveryAssigneeId(normalizedAssignees[0]?.value ?? null);
      } catch (error) {
        console.error("[StaffOrderQueue] Failed to load delivery assignees", error);
        showError("Không tải được danh sách staff giao hàng");
        closeReadyForPickupModal();
      } finally {
        setIsLoadingDeliveryAssignees(false);
      }
    },
    [closeReadyForPickupModal, franchiseId, showError],
  );

  const confirmReadyForPickup = useCallback(async () => {
    if (!selectedReadyOrder) {
      return;
    }

    if (!selectedDeliveryAssigneeId) {
      showError("Vui lòng chọn staff giao hàng");
      return;
    }

    try {
      setUpdatingOrderId(selectedReadyOrder._id);
      setIsSubmittingReadyForPickup(true);

      await orderService.markReadyForPickup(selectedReadyOrder._id, {
        staff_id: selectedDeliveryAssigneeId,
      });

      setOrders((currentOrders) =>
        currentOrders.filter((currentOrder) => currentOrder._id !== selectedReadyOrder._id),
      );
      showSuccess("Đơn hàng đã chuyển sang sẵn sàng lấy");
      closeReadyForPickupModal();
      await loadQueue({ preserveList: true });
    } catch (error) {
      console.error("[StaffOrderQueue] Failed to mark ready for pickup", error);
      showError("Không cập nhật được trạng thái ready to pickup");
    } finally {
      setUpdatingOrderId(null);
      setIsSubmittingReadyForPickup(false);
    }
  }, [
    closeReadyForPickupModal,
    loadQueue,
    selectedDeliveryAssigneeId,
    selectedReadyOrder,
    showError,
    showSuccess,
  ]);

  const queueOrders = useMemo(() => {
    return orders.filter((order) => STAFF_QUEUE_VISIBLE_STATUSES.has(order.status));
  }, [orders]);

  const confirmedCount = useMemo(() => {
    return queueOrders.filter((order) => order.status === "CONFIRMED").length;
  }, [queueOrders]);

  const readyToPickupCount = useMemo(() => {
    return queueOrders.filter((order) => order.status === "PREPARING").length;
  }, [queueOrders]);

  const displayedOrders = useMemo(() => {
    return queueOrders.filter((order) => {
      if (sortMode === "CONFIRMED") {
        return order.status === "CONFIRMED";
      }

      if (sortMode === "READY_TO_PICKUP") {
        return order.status === "PREPARING";
      }

      return true;
    });
  }, [queueOrders, sortMode]);

  const loadMoreTriggerIndex =
    displayedOrders.length > detailWindowSize ? detailWindowSize : undefined;

  useEffect(() => {
    const scrollContainer = queueScrollContainerRef.current;

    if (!scrollContainer || !loadMoreTriggerElement || loadMoreTriggerIndex === undefined) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (!entry?.isIntersecting) {
          return;
        }

        setDetailWindowSize((currentValue) =>
          Math.min(currentValue + DETAIL_BATCH_SIZE, displayedOrders.length),
        );
      },
      {
        root: scrollContainer,
        rootMargin: "180px 0px 180px 0px",
        threshold: 0.05,
      },
    );

    observer.observe(loadMoreTriggerElement);

    return () => {
      observer.disconnect();
    };
  }, [displayedOrders.length, detailWindowSize, loadMoreTriggerElement, loadMoreTriggerIndex]);

  useEffect(() => {
    const visibleOrdersNeedingDetails = displayedOrders
      .slice(0, detailWindowSize)
      .filter((order) => {
        return (
          needsQueueOrderDetail(order) &&
          !detailLoadingOrderIdsRef.current.has(order._id)
        );
      });

    if (visibleOrdersNeedingDetails.length === 0) {
      return;
    }

    void hydrateOrderBatch(visibleOrdersNeedingDetails);
  }, [detailWindowSize, displayedOrders, hydrateOrderBatch]);

  return {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise,
    orders: queueOrders,
    displayedOrders,
    sortMode,
    setSortMode,
    confirmedCount,
    readyToPickupCount,
    isLoading,
    updatingOrderId,
    isReadyForPickupModalOpen,
    deliveryAssignees,
    selectedDeliveryAssigneeId,
    isLoadingDeliveryAssignees,
    isSubmittingReadyForPickup,
    detailWindowSize,
    loadMoreTriggerIndex,
    queueScrollContainerRef,
    setLoadMoreTriggerElement,
    setSelectedDeliveryAssigneeId,
    markPreparing,
    openReadyForPickupModal,
    closeReadyForPickupModal,
    confirmReadyForPickup,
  };
};

export default useStaffOrderQueuePage;
