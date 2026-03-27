import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import { loadFranchiseOrdersUsecase } from "../usecases/load-franchise-orders.usecase";
import type { FranchiseOrderListItem, OrderStatus } from "../models/order.models";
import { useOrderFranchiseContext } from "./use-order-franchise-context";
import { useOrderListUiStore } from "../stores/order-list-ui.store";

export const useOrderListPage = () => {
  const { error: showError } = useToast();
  const { franchiseId } = useOrderFranchiseContext({ adminGlobalScopeKey: "orders" });
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rawOrders, setRawOrders] = useState<FranchiseOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedOrderId = useOrderListUiStore((state) => state.selectedOrderId);
  const isMobileDetailOpen = useOrderListUiStore((state) => state.isMobileDetailOpen);
  const isDetailFocused = useOrderListUiStore((state) => state.isDetailFocused);
  const setSelectedOrderId = useOrderListUiStore((state) => state.setSelectedOrderId);
  const setIsMobileDetailOpen = useOrderListUiStore((state) => state.setIsMobileDetailOpen);
  const setIsDetailFocused = useOrderListUiStore((state) => state.setIsDetailFocused);

  const loadOrders = useCallback(async () => {
    if (!franchiseId) {
      setRawOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await loadFranchiseOrdersUsecase(franchiseId, statusFilter);
      setRawOrders(data ?? []);
    } catch (error) {
      console.error("[OrderList] Failed to load franchise orders", error);
      showError("Không tải được danh sách đơn hàng");
      setRawOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId, showError, statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return rawOrders;
    }

    return rawOrders.filter((order) => {
      return (
        order.code.toLowerCase().includes(keyword) ||
        order.phone.toLowerCase().includes(keyword)
      );
    });
  }, [rawOrders, searchQuery]);

  const displayOrders = useMemo(() => {
    return [...filteredOrders].reverse();
  }, [filteredOrders]);

  const resolvedSelectedOrderId = useMemo(() => {
    if (displayOrders.length === 0) {
      return null;
    }

    if (selectedOrderId && displayOrders.some((order) => order._id === selectedOrderId)) {
      return selectedOrderId;
    }

    return displayOrders[0]._id;
  }, [displayOrders, selectedOrderId]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (displayOrders.length === 0) {
      if (
        selectedOrderId !== null ||
        isMobileDetailOpen ||
        isDetailFocused
      ) {
        setSelectedOrderId(null);
        setIsMobileDetailOpen(false);
        setIsDetailFocused(false);
      }

      return;
    }

    if (resolvedSelectedOrderId !== selectedOrderId) {
      setSelectedOrderId(resolvedSelectedOrderId);
    }
  }, [
    displayOrders.length,
    isDetailFocused,
    isLoading,
    isMobileDetailOpen,
    resolvedSelectedOrderId,
    selectedOrderId,
    setIsDetailFocused,
    setIsMobileDetailOpen,
    setSelectedOrderId,
  ]);

  const summary = useMemo(() => {
    return {
      total: rawOrders.length,
      draft: rawOrders.filter((item) => item.status === "DRAFT").length,
      confirmed: rawOrders.filter((item) => item.status === "CONFIRMED").length,
      preparing: rawOrders.filter((item) => item.status === "PREPARING").length,
      ready: rawOrders.filter((item) => item.status === "READY_FOR_PICKUP").length,
    };
  }, [rawOrders]);

  const selectOrder = useCallback(
    (orderId: string) => {
      setSelectedOrderId(orderId);
      setIsMobileDetailOpen(true);
      setIsDetailFocused(true);
    },
    [setIsDetailFocused, setIsMobileDetailOpen, setSelectedOrderId],
  );

  const closeMobileDetail = useCallback(() => {
    setIsMobileDetailOpen(false);
  }, [setIsMobileDetailOpen]);

  return {
    isLoading,
    orders: displayOrders,
    rawOrders,
    statusFilter,
    searchQuery,
    summary,
    selectedOrderId: resolvedSelectedOrderId ?? undefined,
    isMobileDetailOpen,
    isDetailFocused,
    setStatusFilter,
    setSearchQuery,
    selectOrder,
    closeMobileDetail,
    reload: loadOrders,
  };
};
