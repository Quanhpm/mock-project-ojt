import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast.hook";
import { loadFranchiseOrdersUsecase } from "../usecases/load-franchise-orders.usecase";
import type { FranchiseOrderListItem, OrderStatus } from "../models/order.models";
import { useOrderFranchiseContext } from "./use-order-franchise-context";

export const useOrderListPage = () => {
  const { error: showError } = useToast();
  const [searchParams] = useSearchParams();
  const { franchiseId } = useOrderFranchiseContext();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [rawOrders, setRawOrders] = useState<FranchiseOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();
  const preferredSelectedOrderId = searchParams.get("selectedOrderId")?.trim() || undefined;

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
      return order.code.toLowerCase().includes(keyword);
    });
  }, [rawOrders, searchQuery]);

  const displayOrders = useMemo(() => {
    return [...filteredOrders].reverse();
  }, [filteredOrders]);

  useEffect(() => {
    if (displayOrders.length === 0) {
      setSelectedOrderId(undefined);
      return;
    }

    setSelectedOrderId((currentSelectedOrderId) => {
      if (
        currentSelectedOrderId &&
        displayOrders.some((order) => order._id === currentSelectedOrderId)
      ) {
        return currentSelectedOrderId;
      }

      if (
        preferredSelectedOrderId &&
        displayOrders.some((order) => order._id === preferredSelectedOrderId)
      ) {
        return preferredSelectedOrderId;
      }

      return displayOrders[0]._id;
    });
  }, [displayOrders, preferredSelectedOrderId]);

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
    },
    [],
  );

  return {
    isLoading,
    orders: displayOrders,
    rawOrders,
    statusFilter,
    searchQuery,
    summary,
    selectedOrderId,
    setStatusFilter,
    setSearchQuery,
    selectOrder,
    reload: loadOrders,
  };
};
