import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createAdminGlobalFranchiseSearchParams,
  readAdminGlobalFranchiseId,
} from "../utils/admin-global-franchise-scope";

interface UseAdminGlobalFranchiseScopeOptions {
  enabled?: boolean;
}

export const useAdminGlobalFranchiseScope = (
  options: UseAdminGlobalFranchiseScopeOptions = {},
) => {
  const { enabled = true } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const currentSearch = searchParams.toString();
  const queryFranchiseId = readAdminGlobalFranchiseId(searchParams);
  const franchiseId = enabled ? queryFranchiseId : null;

  const selectFranchise = useCallback(
    (nextFranchiseId: string, options?: { replace?: boolean }) => {
      if (!enabled || !nextFranchiseId) {
        return;
      }

      const nextSearchParams = createAdminGlobalFranchiseSearchParams(
        currentSearch,
        nextFranchiseId,
      );
      setSearchParams(nextSearchParams, { replace: options?.replace ?? false });
    },
    [currentSearch, enabled, setSearchParams],
  );

  const clearSelectedFranchise = useCallback(
    (options?: { replace?: boolean }) => {
      if (!enabled) {
        return;
      }

      const nextSearchParams = createAdminGlobalFranchiseSearchParams(currentSearch, null);
      setSearchParams(nextSearchParams, { replace: options?.replace ?? false });
    },
    [currentSearch, enabled, setSearchParams],
  );

  return {
    franchiseId,
    queryFranchiseId,
    selectedFranchiseId: queryFranchiseId,
    selectFranchise,
    clearSelectedFranchise,
  };
};
