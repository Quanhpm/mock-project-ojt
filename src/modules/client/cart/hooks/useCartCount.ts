import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCustomerCarts,
} from '@/apis/endpointsCLIENT/cart.api';
import { useClientAuthStore } from '@/modules/client/auth-client/stores/client-auth.store';
import { useStore as useMenuStore } from '@/modules/client/menu/hooks/use-store.hook';
import { extractCartsFromPayload, toCartSummary } from './cartApiMapper';

const SELECTED_FRANCHISE_STORAGE_KEY = 'selectedFranchise';
const MENU_STORE_STORAGE_KEY = 'client-menu-store';

const pickString = (...values: unknown[]): string => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
};

const extractFranchiseId = (value: unknown): string => {
  if (typeof value === 'string' || typeof value === 'number') {
    return pickString(value);
  }

  if (!value || typeof value !== 'object') {
    return '';
  }

  const record = value as Record<string, unknown>;

  return (
    pickString(
      record.franchiseId,
      record.selectedFranchise,
      record.id,
      record.value,
    ) || extractFranchiseId(record.state)
  );
};

const readSelectedFranchiseFromStorage = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const rawEntries = [
    window.localStorage.getItem(SELECTED_FRANCHISE_STORAGE_KEY),
    window.localStorage.getItem(MENU_STORE_STORAGE_KEY),
  ];

  for (const rawValue of rawEntries) {
    if (!rawValue?.trim()) {
      continue;
    }

    try {
      const parsed = JSON.parse(rawValue);
      const franchiseId = extractFranchiseId(parsed);

      if (franchiseId) {
        return franchiseId;
      }
    } catch {
      const franchiseId = extractFranchiseId(rawValue);

      if (franchiseId) {
        return franchiseId;
      }
    }
  }

  return '';
};

export function useCartCount() {
  const storedFranchiseId = useMenuStore((state) => state.franchiseId);
  const customerId = useClientAuthStore((state) => state.user?.id);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const franchiseId = useMemo(
    () => storedFranchiseId || readSelectedFranchiseFromStorage(),
    [storedFranchiseId],
  );

  const refresh = useCallback(async () => {
    if (!franchiseId || !customerId) {
      setCount(0);
      return;
    }

    setIsLoading(true);

    try {
      const payload = await getCustomerCarts(customerId, 'ACTIVE');
      const nextCount = extractCartsFromPayload(payload)
        .map(toCartSummary)
        .filter((cart) => cart.franchiseId === franchiseId)
        .reduce((sum, cart) => sum + cart.itemsCount, 0);

      setCount(nextCount);
    } catch {
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, franchiseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!franchiseId || typeof window === 'undefined') {
      return;
    }

    const handleFocus = () => {
      void refresh();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [franchiseId, refresh]);

  return {
    count: franchiseId ? count : 0,
    franchiseId,
    isLoading,
    refresh,
  };
}
