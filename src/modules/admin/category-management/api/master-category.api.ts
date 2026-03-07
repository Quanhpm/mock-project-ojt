import { httpClient } from "@/apis/httpClient";

// ============================================================================
// TYPES
// ============================================================================

export interface MasterCategoryCreatePayload {
  code: string;
  name: string;
  description?: string;
  parent_id?: string;
}

export interface MasterCategory {
  _id: string;
  code: string;
  name: string;
  description: string;
  parent_id: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Create a new master category (Global Admin only)
 * POST /api/categories
 */
export const createMasterCategory = async (
  payload: MasterCategoryCreatePayload
): Promise<MasterCategory> => {
  const data = await httpClient.post<MasterCategory>({
    url: "/categories",
    data: payload,
  });
  return data!;
};
