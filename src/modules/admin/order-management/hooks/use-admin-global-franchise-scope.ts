import { useCallback, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAdminGlobalFranchiseScopeStore } from "../stores/admin-global-franchise-scope.store";
import {
  resolveAdminGlobalFranchiseScopeKey,
  type AdminGlobalFranchiseScopeKey,
} from "../utils/admin-global-franchise-scope";

interface UseAdminGlobalFranchiseScopeOptions {
  enabled?: boolean;
  scopeKey?: AdminGlobalFranchiseScopeKey | null;
}

export const useAdminGlobalFranchiseScope = (
  options: UseAdminGlobalFranchiseScopeOptions = {},
) => {
  const { enabled = true, scopeKey = null } = options;
  const location = useLocation();
  const resolvedScopeKey = useMemo(
    () => scopeKey ?? resolveAdminGlobalFranchiseScopeKey(location.pathname),
    [location.pathname, scopeKey],
  );
  const franchiseId = useAdminGlobalFranchiseScopeStore((state) =>
    enabled && resolvedScopeKey ? state.selections[resolvedScopeKey] ?? null : null,
  );
  const setSelectedFranchiseId = useAdminGlobalFranchiseScopeStore(
    (state) => state.setSelectedFranchiseId,
  );
  const clearSelectedFranchiseId = useAdminGlobalFranchiseScopeStore(
    (state) => state.clearSelectedFranchiseId,
  );

  const selectFranchise = useCallback(
    (nextFranchiseId: string) => {
      if (!enabled || !resolvedScopeKey || !nextFranchiseId) {
        return;
      }

      setSelectedFranchiseId(resolvedScopeKey, nextFranchiseId);
    },
    [enabled, resolvedScopeKey, setSelectedFranchiseId],
  );

  const clearSelectedFranchise = useCallback(() => {
    if (!enabled || !resolvedScopeKey) {
      return;
    }

    clearSelectedFranchiseId(resolvedScopeKey);
  }, [clearSelectedFranchiseId, enabled, resolvedScopeKey]);

  return {
    scopeKey: resolvedScopeKey,
    franchiseId,
    selectFranchise,
    clearSelectedFranchise,
  };
};
