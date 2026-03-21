import { useCallback, useEffect, useMemo, useState } from 'react';
import { getOrdersByCustomerId } from '@/apis/endpointsCLIENT';
import { useClientAuthStore } from '@/modules/client/auth-client';
import { PAGE_SIZE } from '../order.config';
import { buildSummaryFromOrders, normalizeOrdersPayload } from '../order.utils';
import type { FilterOption, OrderData, OrdersResponse } from '../order.types';

export interface OrderStatItem {
  key: string;
  label: string;
  value: string;
  icon: string;
  iconClass: string;
}

export const useOrders = () => {
  const customerId = useClientAuthStore((state) => state.user?.id);

  const [orders, setOrders] = useState<OrderData[]>([]);
  const [apiSummary, setApiSummary] = useState<OrdersResponse['data']['summary'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    if (!customerId) {
      setOrders([]);
      setApiSummary(null);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getOrdersByCustomerId(customerId);
      const normalized = normalizeOrdersPayload(response);
      setOrders(normalized.orders);
      setApiSummary(normalized.summary);
    } catch (error) {
      console.error('Failed to fetch customer orders:', error);
      setOrders([]);
      setApiSummary(null);
      setErrorMessage('Không thể tải lịch sử đơn hàng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const summary = useMemo(
    () => apiSummary ?? buildSummaryFromOrders(orders),
    [apiSummary, orders],
  );

  const stats = useMemo<OrderStatItem[]>(
    () => [
      {
        key: 'total',
        label: 'Tổng đơn hàng',
        value: summary.total_orders.toString(),
        icon: 'receipt_long',
        iconClass: 'bg-primary/10 text-primary',
      },
      {
        key: 'completed',
        label: 'Hoàn thành',
        value: summary.completed_orders.toString(),
        icon: 'check_circle',
        iconClass: 'bg-emerald-500/10 text-emerald-500',
      },
      {
        key: 'pending',
        label: 'Đang xử lý',
        value: summary.preparing_orders.toString(),
        icon: 'pending',
        iconClass: 'bg-amber-500/10 text-amber-500',
      },
    ],
    [summary],
  );

  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    if (selectedFilter === 'completed') {
      filtered = filtered.filter((order) => order.status.code === 'COMPLETED');
    } else if (selectedFilter === 'pending') {
      filtered = filtered.filter(
        (order) =>
          order.status.code === 'DRAFT' ||
          order.status.code === 'PREPARING' ||
          order.status.code === 'CONFIRMED' ||
          order.status.code === 'READY_FOR_PICKUP',
      );
    } else if (selectedFilter === 'cancelled') {
      filtered = filtered.filter((order) => order.status.code === 'CANCELLED');
    }

    return filtered.sort(
      (a, b) => new Date(b.meta.created_at).getTime() - new Date(a.meta.created_at).getTime(),
    );
  }, [orders, selectedFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE)),
    [filteredOrders.length],
  );

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredOrders.slice(start, end);
  }, [filteredOrders, currentPage]);

  const handleFilterChange = useCallback((filter: FilterOption) => {
    setSelectedFilter(filter);
    setCurrentPage(1);
  }, []);

  return {
    orders,
    isLoading,
    errorMessage,
    summary,
    stats,
    selectedFilter,
    currentPage,
    filteredOrders,
    paginatedOrders,
    totalPages,
    actions: {
      fetchOrders,
      setCurrentPage,
      handleFilterChange,
    },
  };
};
