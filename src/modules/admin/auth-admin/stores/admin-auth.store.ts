import { create } from "zustand";
import type {
  UserInfo,
  UserRoleItem,
  ActiveContext,
  ProfileResponse,
} from "@/apis/endpoints/auth.api";
import { HttpError } from "@/apis/http.types";
import { isAuthRedirecting } from "@/apis/axios.config";
import { getProfile, logout as logoutApi } from "@/apis/endpoints/auth.api";

// ======================== State Interface ========================

interface AdminAuthState {
  admin: UserInfo | null;
  roles: UserRoleItem[];
  activeContext: ActiveContext | null;
  isLoggedIn: boolean;
  isLoading: boolean;

  // Lưu profile từ API response vào store
  setProfile: (profile: ProfileResponse) => void;

  // Gọi API logout → clear store
  logout: () => Promise<void>;

  // Gọi GET /auth để kiểm tra session còn sống không (thay hydrate cũ)
  hydrate: () => Promise<void>;
}

// ======================== Derived Getters ========================

export type TableScope = "GLOBAL_TABLE_SCOPE" | "FRANCHISE_TABLE_SCOPE";

/** Lấy roleCode hiện tại (ưu tiên active_context, fallback roles[0]) */
export const getRoleCode = (state: AdminAuthState): string | null => {
  if (state.activeContext?.role) return state.activeContext.role;
  if (state.roles.length > 0) return state.roles[0].role;
  return null;
};

/** Lấy franchiseId hiện tại */
export const getFranchiseId = (state: AdminAuthState): string | null => {
  if (state.activeContext?.franchise_id) return state.activeContext.franchise_id;
  if (state.roles.length > 0) return state.roles[0].franchise_id;
  return null;
};

/** Rule riêng cho các bảng quản trị Product/Categories */
export const getTableScope = (state: AdminAuthState): TableScope => {
  const roleCode = getRoleCode(state);

  if (roleCode === "ADMIN" || roleCode === "MANAGER") {
    return "GLOBAL_TABLE_SCOPE";
  }

  return "FRANCHISE_TABLE_SCOPE";
};

// ======================== Store ========================

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  admin: null,
  roles: [],
  activeContext: null,
  isLoggedIn: false,
  isLoading: true, // Bắt đầu true → chặn render routes cho đến khi hydrate xong

  setProfile: (profile) => {
    set({
      admin: profile.user,
      roles: profile.roles,
      activeContext: profile.active_context,
      isLoggedIn: true,
    });
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore error — server có thể đã hết session
    } finally {
      set({
        admin: null,
        roles: [],
        activeContext: null,
        isLoggedIn: false,
      });
    }
  },

  hydrate: async () => {
    // ⛔ Nếu interceptor đã redirect về login (token revoked/expired) → không gọi API nữa.
    // Tránh loop: redirect → reload → hydrate → API fail → redirect → ...
    if (isAuthRedirecting()) {
      set({ isLoading: false, isLoggedIn: false });
      return;
    }

    set({ isLoading: true });
    try {
      const profile = await getProfile();
      set({
        admin: profile.user,
        roles: profile.roles,
        activeContext: profile.active_context,
        isLoggedIn: true,
      });
    } catch (error) {
      // ✅ Nếu refresh token hết hoặc bị revoke → throw error để AdminRoot xử lý
      if (
        error instanceof HttpError &&
        (error.code === "REFRESH_TOKEN_FAILED" || error.code === "TOKEN_REVOKED")
      ) {
        throw error;
      }
      // ⚠️ Nếu error khác (network, server error, NOT_AUTHENTICATED) → log nhưng không throw
      // để tránh stuck Loading screen. User sẽ redirect login page
      console.error("[hydrate] Error fetching profile:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
