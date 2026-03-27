import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import {
  getRoleCode,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type { OrderFranchiseOption } from "../models/franchise.models";
import { franchiseService } from "../services/franchise.service";
import { switchOrderFranchiseContextUsecase } from "../usecases/switch-order-franchise-context.usecase";
import { useAdminGlobalFranchiseScope } from "./use-admin-global-franchise-scope";

interface UseOrderFranchiseContextOptions {
  enabled?: boolean;
}

export const useOrderFranchiseContext = (
  options: UseOrderFranchiseContextOptions = {},
) => {
  const { enabled = true } = options;
  const { error: showError, success: showSuccess } = useToast();
  const adminStore = useAdminAuthStore();
  const { activeContext, roles, setProfile } = adminStore;
  const roleCode = getRoleCode(adminStore);
  const [isSwitchingFranchise, setIsSwitchingFranchise] = useState(false);
  const [adminFranchiseOptions, setAdminFranchiseOptions] = useState<OrderFranchiseOption[]>([]);

  const contextFranchiseId = activeContext?.franchise_id ?? null;
  const isAdminUser = enabled && roleCode === "ADMIN";
  const isAdminGlobalMode =
    isAdminUser &&
    activeContext?.scope === "GLOBAL" &&
    !contextFranchiseId;
  const {
    franchiseId: adminGlobalFranchiseId,
    selectFranchise: selectAdminGlobalFranchise,
    clearSelectedFranchise: clearAdminGlobalFranchise,
  } = useAdminGlobalFranchiseScope({ enabled: isAdminGlobalMode });

  const roleBasedFranchiseOptions = useMemo<OrderFranchiseOption[]>(() => {
    return roles
      .filter(
        (role): role is typeof role & { franchise_id: string; franchise_name: string | null } =>
          role.scope === "FRANCHISE" && Boolean(role.franchise_id),
      )
      .map((role) => ({
        id: role.franchise_id,
        name: role.franchise_name || `Chi nhánh ${role.franchise_id}`,
        role: role.role,
      }));
  }, [roles]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (!isAdminUser) {
      setAdminFranchiseOptions([]);
      return;
    }

    let isMounted = true;

    const loadAdminFranchises = async () => {
      try {
        setIsSwitchingFranchise(true);
        const options = await franchiseService.getFranchisesForPosSelect();

        if (!isMounted) {
          return;
        }

        setAdminFranchiseOptions(options);
      } catch (error) {
        console.error("[OrderManagement] Failed to load franchise select options", error);

        if (isMounted) {
          setAdminFranchiseOptions([]);
          showError("Không tải được danh sách chi nhánh");
        }
      } finally {
        if (isMounted) {
          setIsSwitchingFranchise(false);
        }
      }
    };

    void loadAdminFranchises();

    return () => {
      isMounted = false;
    };
  }, [
    enabled,
    isAdminUser,
    showError,
  ]);

  const franchiseOptions = useMemo<OrderFranchiseOption[]>(() => {
    if (isAdminUser) {
      return adminFranchiseOptions;
    }

    return roleBasedFranchiseOptions;
  }, [adminFranchiseOptions, isAdminUser, roleBasedFranchiseOptions]);

  const franchiseId = isAdminGlobalMode ? adminGlobalFranchiseId : contextFranchiseId;
  const requiresFranchiseSelection = enabled && isAdminUser && !franchiseId;
  const hasInvalidFranchiseContext = enabled && !requiresFranchiseSelection && !franchiseId;

  const franchiseName = useMemo(() => {
    if (!franchiseId) {
      return "";
    }

    const currentRole = franchiseOptions.find((option) => option.id === franchiseId);
    return currentRole?.name ?? `Chi nhánh ${franchiseId}`;
  }, [franchiseId, franchiseOptions]);

  const switchFranchise = useCallback(
    async (nextFranchiseId: string) => {
      if (!nextFranchiseId || nextFranchiseId === franchiseId) {
        return;
      }

      if (isAdminGlobalMode) {
        selectAdminGlobalFranchise(nextFranchiseId);
        showSuccess("Đã chọn chi nhánh hiển thị");
        return;
      }

      try {
        setIsSwitchingFranchise(true);
        const updatedProfile = await switchOrderFranchiseContextUsecase(nextFranchiseId);
        setProfile(updatedProfile);
        showSuccess("Đã chuyển chi nhánh làm việc");
      } catch (error) {
        console.error("[OrderManagement] Failed to switch franchise context", error);
        showError("Không thể chuyển chi nhánh");
      } finally {
        setIsSwitchingFranchise(false);
      }
    },
    [
      franchiseId,
      isAdminGlobalMode,
      selectAdminGlobalFranchise,
      setProfile,
      showError,
      showSuccess,
    ],
  );

  const clearSelectedFranchise = useCallback(() => {
    if (!isAdminGlobalMode) {
      return;
    }

    clearAdminGlobalFranchise();
  }, [clearAdminGlobalFranchise, isAdminGlobalMode]);

  return {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    isAdminGlobalMode,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise,
    clearSelectedFranchise,
  };
};
