import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast.hook";
import { useAdminAuthStore } from "@/modules/admin/auth-admin/stores/admin-auth.store";
import type { OrderFranchiseOption } from "../models/franchise.models";
import { switchOrderFranchiseContextUsecase } from "../usecases/switch-order-franchise-context.usecase";

export const useOrderFranchiseContext = () => {
  const { error: showError, success: showSuccess } = useToast();
  const adminStore = useAdminAuthStore();
  const { activeContext, roles, setProfile } = adminStore;
  const [isSwitchingFranchise, setIsSwitchingFranchise] = useState(false);

  const franchiseId =
    activeContext?.scope === "FRANCHISE" ? activeContext.franchise_id : null;

  const franchiseOptions = useMemo<OrderFranchiseOption[]>(() => {
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

      try {
        setIsSwitchingFranchise(true);
        const updatedProfile = await switchOrderFranchiseContextUsecase(nextFranchiseId);
        setProfile(updatedProfile);
        showSuccess("Đã chuyển chi nhánh POS");
      } catch (error) {
        console.error("[OrderManagement] Failed to switch franchise context", error);
        showError("Không thể chuyển chi nhánh");
      } finally {
        setIsSwitchingFranchise(false);
      }
    },
    [franchiseId, setProfile, showError, showSuccess],
  );

  return {
    franchiseId,
    franchiseName,
    franchiseOptions,
    isSwitchingFranchise,
    switchFranchise,
  };
};
