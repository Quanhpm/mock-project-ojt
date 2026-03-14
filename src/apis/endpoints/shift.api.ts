// Shift API endpoints
import { httpClient } from "@/apis/httpClient";
import type { SearchResponse } from "@/apis/http.types";

// ======================== Types ========================

// ===== Shift =====

export interface CreateShiftRequest {
  franchise_id: string;
  name: string;
  start_time: string; // HH:mm format, e.g., "17:00"
  end_time: string;   // HH:mm format, e.g., "22:00"
}

export interface CreateShiftResponse {
  id: string;
  franchise_id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ShiftItem {
  _id?: string;
  id?: string;
  franchise_id: string;
  name: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateShiftRequest {
  name: string;
  start_time: string;
  end_time: string;
}

export interface UpdateShiftResponse {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  updated_at: string;
}

export interface ChangeShiftStatusRequest {
  is_active: boolean;
}

export interface ChangeShiftStatusResponse {
  id: string;
  is_active: boolean;
  updated_at: string;
}

export interface SearchShiftsRequest {
  searchCondition: {
    name?: string;
    franchise_id?: string;
    start_time?: string;
    end_time?: string;
    is_active?: boolean | "";
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export type SearchShiftsResponse = SearchResponse<ShiftItem>;

export interface RestoreShiftResponse {
  id: string;
  restored: boolean;
}

export interface SelectShiftOption {
  _id: string;
  name: string;
  start_time: string;
  end_time: string;
}

// ===== Shift Assignment =====

export interface CreateShiftAssignmentRequest {
  user_id: string;
  shift_id: string;
  work_date: string; // YYYY-MM-DD format
  note?: string;
}

export interface CreateShiftAssignmentResponse {
  id: string;
  user_id: string;
  shift_id: string;
  work_date: string;
  note?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BulkAssignShiftRequest {
  items: Array<{
    user_id: string;
    shift_id: string;
    work_date: string;
    note?: string;
  }>;
}

export interface BulkAssignShiftResponse {
  success: boolean;
  created_count: number;
  failed_count: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
}

export interface ShiftAssignmentItem {
  _id?: string;
  id?: string;
  user_id: string;
  user_name?: string;
  shift_id: string;
  shift_name?: string;
  start_time?: string;
  end_time?: string;
  shift_start_time?: string;
  shift_end_time?: string;
  work_date: string;
  note?: string;
  status: "PENDING" | "COMPLETED" | "CANCELED" | "ASSIGNED" | "ABSENT";
  assigned_by?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChangeShiftAssignmentStatusRequest {
  status: "PENDING" | "COMPLETED" | "CANCELED";
}

export interface ChangeShiftAssignmentStatusResponse {
  id: string;
  status: string;
  updated_at: string;
}

export interface SearchShiftAssignmentsRequest {
  searchCondition: {
    shift_id?: string;
    user_id?: string;
    work_date?: string;
    assigned_by?: string;
    status?: string;
    is_deleted?: boolean;
  };
  pageInfo: {
    pageNum: number;
    pageSize: number;
  };
}

export type SearchShiftAssignmentsResponse = SearchResponse<ShiftAssignmentItem>;

export interface ShiftAssignmentByUserParams {
  userId: string;
  date?: string; // YYYY-MM-DD format
}

// ======================== API Endpoints ========================

export const shiftApi = {
  // ===== SHIFT MANAGEMENT =====

  /**
   * Create new shift
   * POST /api/shifts
   */
  createShift: (data: CreateShiftRequest): Promise<CreateShiftResponse | null> => {
    return httpClient.post<CreateShiftResponse, CreateShiftRequest>({
      url: "/shifts",
      data,
    });
  },

  /**
   * Search shifts with pagination
   * POST /api/shifts/search
   */
  searchShifts: (data: SearchShiftsRequest): Promise<SearchShiftsResponse> => {
    return httpClient.search<ShiftItem, SearchShiftsRequest>({
      url: "/shifts/search",
      data,
    }) as Promise<SearchShiftsResponse>;
  },

  /**
   * Get shift by ID
   * GET /api/shifts/:id
   */
  getShiftById: (id: string): Promise<ShiftItem | null> => {
    return httpClient.get<ShiftItem>({
      url: `/shifts/${id}`,
    });
  },

  /**
   * Update shift
   * PUT /api/shifts/:id
   */
  updateShift: (id: string, data: UpdateShiftRequest): Promise<UpdateShiftResponse | null> => {
    return httpClient.put<UpdateShiftResponse, UpdateShiftRequest>({
      url: `/shifts/${id}`,
      data,
    });
  },

  /**
   * Delete shift
   * DELETE /api/shifts/:id
   */
  deleteShift: (id: string): Promise<null> => {
    return httpClient.delete<null>({
      url: `/shifts/${id}`,
    });
  },

  /**
   * Restore deleted shift
   * PATCH /api/shifts/:id/restore
   */
  restoreShift: (id: string): Promise<RestoreShiftResponse | null> => {
    return httpClient.patch<RestoreShiftResponse>({
      url: `/shifts/${id}/restore`,
    });
  },

  /**
   * Change shift status (activate/deactivate)
   * PATCH /api/shifts/:id/status
   */
  changeShiftStatus: (id: string, data: ChangeShiftStatusRequest): Promise<ChangeShiftStatusResponse | null> => {
    return httpClient.patch<ChangeShiftStatusResponse, ChangeShiftStatusRequest>({
      url: `/shifts/${id}/status`,
      data,
    });
  },

  /**
   * Get select options of shifts by franchise
   * GET /api/shifts/select?franchise_id=:franchiseId
   */
  getSelectShiftsByFranchise: (franchiseId: string): Promise<SelectShiftOption[] | null> => {
    return httpClient.get<SelectShiftOption[]>({
      url: `/shifts/select?franchise_id=${franchiseId}`,
    });
  },

  // ===== SHIFT ASSIGNMENT =====

  /**
   * Assign shift to user
   * POST /api/shift-assignments
   */
  assignShiftToUser: (data: CreateShiftAssignmentRequest): Promise<CreateShiftAssignmentResponse | null> => {
    return httpClient.post<CreateShiftAssignmentResponse, CreateShiftAssignmentRequest>({
      url: "/shift-assignments",
      data,
    });
  },

  /**
   * Bulk assign shifts to user
   * POST /api/shift-assignments/bulk
   */
  bulkAssignShifts: (data: BulkAssignShiftRequest): Promise<BulkAssignShiftResponse | null> => {
    return httpClient.post<BulkAssignShiftResponse, BulkAssignShiftRequest>({
      url: "/shift-assignments/bulk",
      data,
    });
  },

  /**
   * Search shift assignments with pagination
   * POST /api/shift-assignments/search
   */
  searchShiftAssignments: (data: SearchShiftAssignmentsRequest): Promise<SearchShiftAssignmentsResponse> => {
    return httpClient.search<ShiftAssignmentItem, SearchShiftAssignmentsRequest>({
      url: "/shift-assignments/search",
      data,
    }) as Promise<SearchShiftAssignmentsResponse>;
  },

  /**
   * Get shift assignment by ID
   * GET /api/shift-assignments/:id
   */
  getShiftAssignmentById: (id: string): Promise<ShiftAssignmentItem | null> => {
    return httpClient.get<ShiftAssignmentItem>({
      url: `/shift-assignments/${id}`,
    });
  },

  /**
   * Change shift assignment status
   * PATCH /api/shift-assignments/:id/status
   */
  changeShiftAssignmentStatus: (id: string, data: ChangeShiftAssignmentStatusRequest): Promise<ChangeShiftAssignmentStatusResponse | null> => {
    return httpClient.patch<ChangeShiftAssignmentStatusResponse, ChangeShiftAssignmentStatusRequest>({
      url: `/shift-assignments/${id}/status`,
      data,
    });
  },

  /**
   * Get all shifts assigned to user by date
   * GET /api/shift-assignments/user/:userId?date=:date
   */
  getShiftAssignmentsByUser: (userId: string, date?: string): Promise<ShiftAssignmentItem[] | null> => {
    const query = date ? `?date=${date}` : "";
    return httpClient.get<ShiftAssignmentItem[]>({
      url: `/shift-assignments/user/${userId}${query}`,
    });
  },

  /**
   * Get all shifts assigned by franchise
   * GET /api/shift-assignments/franchise/:franchiseId
   */
  getShiftAssignmentsByFranchise: (franchiseId: string): Promise<ShiftAssignmentItem[] | null> => {
    return httpClient.get<ShiftAssignmentItem[]>({
      url: `/shift-assignments/franchise/${franchiseId}`,
    });
  },

  /**
   * Get all shifts assigned by shift ID
   * GET /api/shift-assignments/shift/:shiftId
   */
  getShiftAssignmentsByShiftId: (shiftId: string): Promise<ShiftAssignmentItem[] | null> => {
    return httpClient.get<ShiftAssignmentItem[]>({
      url: `/shift-assignments/shift/${shiftId}`,
    });
  },
};
