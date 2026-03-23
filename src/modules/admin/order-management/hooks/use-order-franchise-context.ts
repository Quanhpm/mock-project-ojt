import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import {
  getRoleCode,
  useAdminAuthStore,
} from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type { OrderFranchiseOption } from "../models/franchise.models";
import { usePosSessionStore } from "../stores/pos-session.store";
import { franchiseService } from "../services/franchise.service";
import { switchOrderFranchiseContextUsecase } from "../usecases/switch-order-franchise-context.usecase";

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
  const selectedAdminFranchiseId = usePosSessionStore((state) => state.selectedAdminFranchiseId);
  const selectedAdminFranchiseName = usePosSessionStore(
    (state) => state.selectedAdminFranchiseName,
  );
  const setSelectedAdminFranchiseId = usePosSessionStore(
    (state) => state.setSelectedAdminFranchiseId,
  );
  const setSelectedAdminFranchiseName = usePosSessionStore(
    (state) => state.setSelectedAdminFranchiseName,
  );

  const contextFranchiseId = activeContext?.franchise_id ?? null;
  const isAdminWithoutFranchiseContext = enabled && roleCode === "ADMIN" && !contextFranchiseId;

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

    if (!isAdminWithoutFranchiseContext) {
      setAdminFranchiseOptions([]);
      setSelectedAdminFranchiseId(null);
      setSelectedAdminFranchiseName(null);
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
        const currentSelectedFranchiseId = usePosSessionStore.getState().selectedAdminFranchiseId;
        const currentSelectedFranchise = currentSelectedFranchiseId
          ? options.find((option) => option.id === currentSelectedFranchiseId)
          : null;

        setSelectedAdminFranchiseId(currentSelectedFranchise?.id ?? null);
        setSelectedAdminFranchiseName(currentSelectedFranchise?.name ?? null);
      } catch (error) {
        console.error("[OrderManagement] Failed to load franchise select options", error);

        if (isMounted) {
          setAdminFranchiseOptions([]);
          setSelectedAdminFranchiseId(null);
          setSelectedAdminFranchiseName(null);
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
    isAdminWithoutFranchiseContext,
    setSelectedAdminFranchiseId,
    setSelectedAdminFranchiseName,
    showError,
  ]);

  const franchiseOptions = useMemo<OrderFranchiseOption[]>(() => {
    if (isAdminWithoutFranchiseContext) {
      return adminFranchiseOptions;
    }

    return roleBasedFranchiseOptions;
  }, [adminFranchiseOptions, isAdminWithoutFranchiseContext, roleBasedFranchiseOptions]);

  const franchiseId = isAdminWithoutFranchiseContext ? selectedAdminFranchiseId : contextFranchiseId;
  const requiresFranchiseSelection = isAdminWithoutFranchiseContext && !franchiseId;
  const hasInvalidFranchiseContext = enabled && !requiresFranchiseSelection && !franchiseId;

  const franchiseName = useMemo(() => {
    if (!franchiseId) {
      return "";
    }

    if (isAdminWithoutFranchiseContext && selectedAdminFranchiseName) {
      return selectedAdminFranchiseName;
    }

    const currentRole = franchiseOptions.find((option) => option.id === franchiseId);
    return currentRole?.name ?? `Chi nhánh ${franchiseId}`;
  }, [franchiseId, franchiseOptions, isAdminWithoutFranchiseContext, selectedAdminFranchiseName]);

  const switchFranchise = useCallback(
    async (nextFranchiseId: string) => {
      if (!nextFranchiseId || nextFranchiseId === franchiseId) {
        return;
      }

      if (isAdminWithoutFranchiseContext) {
        const nextFranchise = franchiseOptions.find((option) => option.id === nextFranchiseId);
        setSelectedAdminFranchiseId(nextFranchiseId);
        setSelectedAdminFranchiseName(nextFranchise?.name ?? `Chi nhánh ${nextFranchiseId}`);
        showSuccess("Đã chọn chi nhánh làm việc");
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
      franchiseOptions,
      isAdminWithoutFranchiseContext,
      setProfile,
      setSelectedAdminFranchiseId,
      setSelectedAdminFranchiseName,
      showError,
      showSuccess,
    ],
  );

  return {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    requiresFranchiseSelection,
    hasInvalidFranchiseContext,
    switchFranchise,
  };
};
