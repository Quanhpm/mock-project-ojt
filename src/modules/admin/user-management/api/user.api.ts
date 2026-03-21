import { httpClient } from "@/apis";
import { axiosClient } from "@/apis/axios.config";
import type {
  UserItem,
  UserSearchPayload,
  UserSearchResponse,
} from "./user.types";

// ============================================================================
// USER MANAGEMENT APIS
// ============================================================================

export const userApi = {
  /**
   * Search users with pagination and filters
   */
  searchUsers: async (
    payload: UserSearchPayload,
  ): Promise<UserSearchResponse> => {
    // Use axiosClient directly to get full response structure with pageInfo
    const response = await axiosClient.post<UserSearchResponse>(
      "/users/search",
      payload,
    );
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserItem> => {
    const data = await httpClient.get<UserItem>({
      url: `/users/${id}`,
    });
    return data!;
  },

  /**
   * Create new user
   */
  createUser: async (payload: any): Promise<UserItem> => {
    const data = await httpClient.post<UserItem>({
      url: "/users",
      data: payload,
    });
    return data!;
  },

  /**
   * Update user
   */
  updateUser: async (id: string, payload: any): Promise<UserItem> => {
    const data = await httpClient.put<UserItem>({
      url: `/users/${id}`,
      data: payload,
    });
    return data!;
  },

  /**
   * Delete user (soft delete)
   */
  deleteUser: async (id: string): Promise<void> => {
    await httpClient.delete({
      url: `/users/${id}`,
    });
  },

  /**
   * Toggle user active status
   */
  toggleUserStatus: async (
    id: string,
    payload: { is_active: boolean },
  ): Promise<UserItem> => {
    const data = await httpClient.patch<UserItem>({
      url: `/users/${id}/status`,
      data: payload,
    });
    return data!;
  },
};
