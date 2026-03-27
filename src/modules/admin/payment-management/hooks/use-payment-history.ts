import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import {
  getRoleCode,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type { OrderFranchiseOption } from "@/modules/admin/order-management/models/franchise.models";
import { franchiseService } from "@/modules/admin/order-management/services/franchise.service";
import type {
  PaymentHistoryFilters,
  PaymentHistoryItem,
  PaymentHistoryStatus,
} from "../models/payment-history.models";
import { paymentHistoryService } from "../services/payment-history.service";

const PAGE_SIZE = 10;

const sortPaymentsByCreatedAtDesc = (payments: PaymentHistoryItem[]) => {
  return [...payments].sort((left, right) => {
    const leftTime = new Date(left.created_at).getTime();
    const rightTime = new Date(right.created_at).getTime();

    return rightTime - leftTime;
  });
};

const toLocalBoundaryTimestamp = (value: string, endOfDay = false) => {
  if (!value) {
    return null;
  }

  const normalizedValue = endOfDay
    ? `${value}T23:59:59.999`
    : `${value}T00:00:00.000`;
  const timestamp = new Date(normalizedValue).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
};

const isPaymentWithinDateRange = (
  payment: PaymentHistoryItem,
  dateFrom: string,
  dateTo: string,
) => {
  const createdAtTimestamp = new Date(payment.created_at).getTime();

  if (Number.isNaN(createdAtTimestamp)) {
    return false;
  }

  const startTimestamp = toLocalBoundaryTimestamp(dateFrom);
  const endTimestamp = toLocalBoundaryTimestamp(dateTo, true);

  if (startTimestamp !== null && createdAtTimestamp < startTimestamp) {
    return false;
  }

  if (endTimestamp !== null && createdAtTimestamp > endTimestamp) {
    return false;
  }

  return true;
};

export const usePaymentHistory = () => {
  const authStore = useAdminAuthStore();
  const activeContext = useAdminAuthStore((state) => state.activeContext);
  const roles = useAdminAuthStore((state) => state.roles);
  const { error: showError } = useToast();
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise: isLoadingFranchiseOptions,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise: selectFranchise,
    clearSelectedFranchise,
    isAdminGlobalMode,
  } = useOrderFranchiseContext({ adminGlobalScopeKey: "payments" });
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<PaymentHistoryStatus | "">(
    "",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const roleCode = activeContext?.role ?? getRoleCode(authStore);
  const isAdminUser = roleCode === "ADMIN";
  const isManagerUser = roleCode === "MANAGER";
  const managerFranchiseId = activeContext?.franchise_id ?? null;
  const franchiseId = isAdminUser ? selectedAdminFranchiseId : managerFranchiseId;
  const pageSize = PAGE_SIZE;

  useEffect(() => {
    if (!isAdminUser) {
      setFranchiseOptions([]);
      setIsLoadingFranchiseOptions(false);
      setSelectedAdminFranchiseId(null);
      return;
    }

    let isMounted = true;

    const loadFranchises = async () => {
      try {
        if (isMounted) {
          setIsLoadingFranchiseOptions(true);
        }

        const response = await franchiseService.getFranchisesForPosSelect();

        if (!isMounted) {
          return;
        }

        setFranchiseOptions(response);
      } catch (error) {
        console.error("[PaymentHistory] Failed to load franchises", error);

        if (!isMounted) {
          return;
        }

        setFranchiseOptions([]);
        showError("Không tải được danh sách chi nhánh");
      } finally {
        if (isMounted) {
          setIsLoadingFranchiseOptions(false);
        }
      }
    };

    void loadFranchises();

    return () => {
      isMounted = false;
    };
  }, [isAdminUser, showError]);

  useEffect(() => {
    let isMounted = true;

    if (!franchiseId) {
      setPayments([]);
      setErrorMessage(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const fetchPayments = async () => {
      try {
        if (isMounted) {
          setIsLoading(true);
          setErrorMessage(null);
        }

        const response = await paymentHistoryService.getPaymentsByFranchise(
          franchiseId,
          statusFilter,
        );

        if (!isMounted) {
          return;
        }

        setPayments(sortPaymentsByCreatedAtDesc(response));
      } catch (error) {
        console.error("[PaymentHistory] Failed to fetch payments", error);

        if (!isMounted) {
          return;
        }

        setPayments([]);
        setErrorMessage("Không thể tải lịch sử payment cho chi nhánh hiện tại.");
        showError("Không tải được lịch sử payment");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchPayments();

    return () => {
      isMounted = false;
    };
  }, [franchiseId, showError, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [dateFrom, dateTo, franchiseId, statusFilter]);

  const franchiseName = useMemo(() => {
    if (!franchiseId) {
      return "";
    }

    if (isAdminUser) {
      const selectedFranchise = franchiseOptions.find(
        (franchise) => franchise.id === franchiseId,
      );

      return selectedFranchise?.name ?? `Chi nhánh ${franchiseId}`;
    }

    const managerFranchise = roles.find((role) => role.franchise_id === franchiseId);
    return managerFranchise?.franchise_name || `Chi nhánh ${franchiseId}`;
  }, [franchiseId, franchiseOptions, isAdminUser, roles]);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) =>
      isPaymentWithinDateRange(payment, dateFrom, dateTo),
    );
  }, [dateFrom, dateTo, payments]);

  const totalItems = filteredPayments.length;
  const totalPages = totalItems === 0 ? 1 : Math.ceil(totalItems / pageSize);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredPayments.slice(startIndex, startIndex + pageSize);
  }, [currentPage, filteredPayments, pageSize]);

  const resetFilters = useCallback(() => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  }, []);

  const selectFranchise = useCallback((nextFranchiseId: string) => {
    setSelectedAdminFranchiseId(nextFranchiseId || null);
  }, []);

  const clearSelectedFranchise = useCallback(() => {
    setSelectedAdminFranchiseId(null);
  }, []);

  const filters: PaymentHistoryFilters = {
    status: statusFilter,
    dateFrom,
    dateTo,
  };

  return {
    roleCode,
    isAdminUser,
    isManagerUser,
    franchiseId,
    franchiseName,
    franchiseOptions,
    isLoadingFranchiseOptions,
    requiresFranchiseSelection: isAdminUser && !selectedAdminFranchiseId,
    hasInvalidFranchiseContext: isManagerUser && !managerFranchiseId,
    selectFranchise,
    clearSelectedFranchise,
    payments,
    filteredPayments,
    paginatedPayments,
    filters,
    isLoading,
    errorMessage,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    currentPage,
    setCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    hasActiveFilters: Boolean(statusFilter || dateFrom || dateTo),
  };
};

export default usePaymentHistory;
