// Auth API endpoints
import { httpClient } from "@/apis/httpClient";

// ======================== Types ========================

export interface UserInfo {
  id: string;
  email: string;
  phone: string;
  name: string;
  avatar_url: string;
}

export interface UserRoleItem {
  role: string;
  scope: "GLOBAL" | "FRANCHISE";
  franchise_id: string | null;
  franchise_name: string | null;
}

export interface ActiveContext {
  role: string;
  scope: string;
  franchiseId: string;
}

export interface ProfileResponse {
  user: UserInfo;
  roles: UserRoleItem[];
  active_context: ActiveContext | null;
}

// ======================== API Functions ========================

/** GET /api/auth - Lấy thông tin user hiện tại */
export const getProfile = (): Promise<ProfileResponse | null> => {
  return httpClient.get<ProfileResponse>({
    url: "/auth",
  });
};

/** POST /api/auth/switch-context - Chọn franchise context */
export const switchContext = (franchise_id: string): Promise<ProfileResponse | null> => {
  return httpClient.post<ProfileResponse, { franchise_id: string }>({
    url: "/auth/switch-context",
    data: { franchise_id },
  });
};