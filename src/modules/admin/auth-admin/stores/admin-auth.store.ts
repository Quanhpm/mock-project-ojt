import { create } from "zustand";
import type {
  UserInfo,
  UserRoleItem,
  ActiveContext,
  ProfileResponse,
} from "@/apis/endpoints/auth.api";
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
      if (profile) {
        set({
          admin: profile.user,
          roles: profile.roles,
          activeContext: profile.active_context,
          isLoggedIn: true,
        });
      }
    } catch {
      // Cookie hết hạn hoặc chưa login → giữ state mặc định
    } finally {
      set({ isLoading: false });
    }
  },
}));