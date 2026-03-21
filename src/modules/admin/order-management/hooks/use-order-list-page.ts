import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import { getFranchiseId, useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import { loadFranchiseOrdersUsecase } from "../usecases/load-franchise-orders.usecase";
import type { FranchiseOrderListItem, OrderStatus } from "../models/order.models";

export const useOrderListPage = () => {
  const { error: showError } = useToast();
  const store = useAdminAuthStore();
  const franchiseId = getFranchiseId(store);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<FranchiseOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>();

  const loadOrders = useCallback(async () => {
    if (!franchiseId) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await loadFranchiseOrdersUsecase(franchiseId, statusFilter);
      const newOrders = data ?? [];
      setOrders(newOrders);
      
      // Auto-select first order if none is selected
      if (newOrders.length > 0 && (!selectedOrderId || !newOrders.find(o => o._id === selectedOrderId))) {
        setSelectedOrderId(newOrders[0]._id);
      } else if (newOrders.length === 0) {
        setSelectedOrderId(undefined);
      }
    } catch (error) {
      console.error("[OrderList] Failed to load franchise orders", error);
      showError("Không tải được danh sách đơn hàng");
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [franchiseId, selectedOrderId, showError, statusFilter]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    if (!keyword) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.code.toLowerCase().includes(keyword) ||
        order.phone.toLowerCase().includes(keyword)
      );
    });
  }, [orders, searchQuery]);

  const summary = useMemo(() => {
    return {
      total: orders.length,
      draft: orders.filter((item) => item.status === "DRAFT").length,
      confirmed: orders.filter((item) => item.status === "CONFIRMED").length,
      preparing: orders.filter((item) => item.status === "PREPARING").length,
      ready: orders.filter((item) => item.status === "READY_FOR_PICKUP").length,
    };
  }, [orders]);

  const selectOrder = useCallback(
    (orderId: string) => {
      setSelectedOrderId(orderId);
    },
    [],
  );

  return {
    franchiseId,
    isLoading,
    orders: filteredOrders,
    rawOrders: orders,
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
