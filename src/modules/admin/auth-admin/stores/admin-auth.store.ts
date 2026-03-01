import { create } from "zustand";
import type {
  UserInfo,
  UserRoleItem,
  ActiveContext,
  ProfileResponse,
} from "@/apis/endpoints/auth.api";
import { HttpError } from "@/apis/http.types";
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

/** Lấy roleCode hiện tại (ưu tiên active_context, fallback roles[0]) */
export const getRoleCode = (state: AdminAuthState): string | null => {
  if (state.activeContext?.role) return state.activeContext.role;
  if (state.roles.length > 0) return state.roles[0].role;
  return null;
};

/** Lấy franchiseId hiện tại */
export const getFranchiseId = (state: AdminAuthState): string | null => {
  if (state.activeContext?.franchiseId) return state.activeContext.franchiseId;
  if (state.roles.length > 0) return state.roles[0].franchise_id;
  return null;
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
    set({ isLoading: true });
    try {
      const profile = await getProfile();
      // ✅ getProfile() now always returns ProfileResponse or throws error
      // No need to check if (profile)
      set({
        admin: profile.user,
        roles: profile.roles,
        activeContext: profile.active_context,
        isLoggedIn: true,
      });
    } catch (error) {
      // ✅ Nếu refresh token hết → throw error để App.tsx xử lý logout
      if (error instanceof HttpError && error.code === "REFRESH_TOKEN_FAILED") {
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