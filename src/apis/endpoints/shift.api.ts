import { httpClient } from '@/apis/httpClient'
import type { SearchResponse } from '@/apis/http.types'

interface ApiItemWithLegacyId {
  _id?: string
  id?: string
}

export type ShiftAssignmentStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'CANCELED'
  | 'ABSENT'

export interface CreateShiftRequest {
  franchise_id: string
  name: string
  start_time: string
  end_time: string
}

export interface CreateShiftResponse extends ApiItemWithLegacyId {
  franchise_id: string
  name: string
  start_time: string
  end_time: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ShiftItem extends ApiItemWithLegacyId {
  franchise_id: string
  name: string
  start_time: string
  end_time: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface UpdateShiftRequest {
  name: string
  start_time: string
  end_time: string
}

export interface UpdateShiftResponse extends ApiItemWithLegacyId {
  name: string
  start_time: string
  end_time: string
  updated_at: string
}

export interface ChangeShiftStatusRequest {
  is_active: boolean
}

export interface ChangeShiftStatusResponse extends ApiItemWithLegacyId {
  is_active: boolean
  updated_at: string
}

export interface SearchShiftsRequest {
  searchCondition: {
    name?: string
    franchise_id?: string
    start_time?: string
    end_time?: string
    is_active?: boolean | ''
    is_deleted?: boolean
  }
  pageInfo: {
    pageNum: number
    pageSize: number
  }
}

export type SearchShiftsResponse = SearchResponse<ShiftItem>

export interface RestoreShiftResponse extends ApiItemWithLegacyId {
  restored: boolean
}

export interface SelectShiftOption extends ApiItemWithLegacyId {
  value?: string
  name: string
  franchise_id?: string
  start_time?: string
  end_time?: string
}

export interface CreateShiftAssignmentRequest {
  user_id: string
  shift_id: string
  work_date: string
  note?: string
}

export interface CreateShiftAssignmentResponse extends ApiItemWithLegacyId {
  user_id: string
  shift_id: string
  work_date: string
  note?: string | null
  status: ShiftAssignmentStatus
  created_at: string
  updated_at: string
}

export type BulkAssignShiftItem = CreateShiftAssignmentRequest

export interface BulkAssignShiftRequest {
  items: BulkAssignShiftItem[]
}

export interface BulkAssignShiftResponse {
  success: boolean
  created_count: number
  failed_count: number
  errors?: Array<{
    index: number
    message: string
  }>
}

export interface ShiftAssignmentItem extends ApiItemWithLegacyId {
  user_id: string
  user_name?: string
  shift_id: string
  shift_name?: string
  start_time?: string
  end_time?: string
  shift_start_time?: string
  shift_end_time?: string
  work_date: string
  note?: string | null
  status: ShiftAssignmentStatus
  assigned_by?: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface ChangeShiftAssignmentStatusRequest {
  status: ShiftAssignmentStatus
}

export interface ChangeShiftAssignmentStatusResponse extends ApiItemWithLegacyId {
  status: ShiftAssignmentStatus
  updated_at: string
}

export interface SearchShiftAssignmentsRequest {
  searchCondition: {
    shift_id?: string
    user_id?: string
    work_date?: string
    assigned_by?: string
    status?: ShiftAssignmentStatus | ''
    is_deleted?: boolean
  }
  pageInfo: {
    pageNum: number
    pageSize: number
  }
}

export type SearchShiftAssignmentsResponse = SearchResponse<ShiftAssignmentItem>

interface GetSelectShiftsByFranchiseParams extends Record<string, unknown> {
  franchise_id: string
}

interface GetShiftAssignmentsByUserParams extends Record<string, unknown> {
  date?: string
}

export const shiftApi = {
  createShift: (data: CreateShiftRequest): Promise<CreateShiftResponse | null> => {
    return httpClient.post<CreateShiftResponse, CreateShiftRequest>({
      url: '/shifts',
      data,
    })
  },

  searchShifts: (data: SearchShiftsRequest): Promise<SearchShiftsResponse> => {
    return httpClient.search<ShiftItem, SearchShiftsRequest>({
      url: '/shifts/search',
      data,
    }) as Promise<SearchShiftsResponse>
  },

  getShiftById: (id: string): Promise<ShiftItem | null> => {
    return httpClient.get<ShiftItem>({
      url: `/shifts/${id}`,
    })
  },

  updateShift: (id: string, data: UpdateShiftRequest): Promise<UpdateShiftResponse | null> => {
    return httpClient.put<UpdateShiftResponse, UpdateShiftRequest>({
      url: `/shifts/${id}`,
      data,
    })
  },

  deleteShift: (id: string): Promise<null> => {
    return httpClient.delete<null>({
      url: `/shifts/${id}`,
    })
  },

  restoreShift: (id: string): Promise<RestoreShiftResponse | null> => {
    return httpClient.patch<RestoreShiftResponse>({
      url: `/shifts/${id}/restore`,
    })
  },

  changeShiftStatus: (
    id: string,
    data: ChangeShiftStatusRequest,
  ): Promise<ChangeShiftStatusResponse | null> => {
    return httpClient.patch<ChangeShiftStatusResponse, ChangeShiftStatusRequest>({
      url: `/shifts/${id}/status`,
      data,
    })
  },

  getSelectShiftsByFranchise: (franchiseId: string): Promise<SelectShiftOption[] | null> => {
    return httpClient.get<SelectShiftOption[], GetSelectShiftsByFranchiseParams>({
      url: '/shifts/select',
      params: {
        franchise_id: franchiseId,
      },
    })
  },

  assignShiftToUser: (
    data: CreateShiftAssignmentRequest,
  ): Promise<CreateShiftAssignmentResponse | null> => {
    return httpClient.post<CreateShiftAssignmentResponse, CreateShiftAssignmentRequest>({
      url: '/shift-assignments',
      data,
    })
  },

  bulkAssignShifts: (data: BulkAssignShiftRequest): Promise<BulkAssignShiftResponse | null> => {
    return httpClient.post<BulkAssignShiftResponse, BulkAssignShiftRequest>({
      url: '/shift-assignments/bulk',
      data,
    })
  },

  searchShiftAssignments: (
    data: SearchShiftAssignmentsRequest,
  ): Promise<SearchShiftAssignmentsResponse> => {
    return httpClient.search<ShiftAssignmentItem, SearchShiftAssignmentsRequest>({
      url: '/shift-assignments/search',
      data,
    }) as Promise<SearchShiftAssignmentsResponse>
  },

  getShiftAssignmentById: (id: string): Promise<ShiftAssignmentItem | null> => {
    return httpClient.get<ShiftAssignmentItem>({
      url: `/shift-assignments/${id}`,
    })
  },

  changeShiftAssignmentStatus: (
    id: string,
    data: ChangeShiftAssignmentStatusRequest,
  ): Promise<ChangeShiftAssignmentStatusResponse | null> => {
    return httpClient.patch<
      ChangeShiftAssignmentStatusResponse,
      ChangeShiftAssignmentStatusRequest
    >({
      url: `/shift-assignments/${id}/status`,
      data,
    })
  },

  deleteShiftAssignment: (id: string): Promise<null> => {
    return httpClient.delete<null>({
      url: `/shift-assignments/${id}`,
    })
  },

  getShiftAssignmentsByUser: (
    userId: string,
    date?: string,
  ): Promise<ShiftAssignmentItem[] | null> => {
    return httpClient.get<ShiftAssignmentItem[], GetShiftAssignmentsByUserParams>({
      url: `/shift-assignments/user/${userId}`,
      params: date ? { date } : undefined,
    })
  },

  getShiftAssignmentsByFranchise: (franchiseId: string): Promise<ShiftAssignmentItem[] | null> => {
    return httpClient.get<ShiftAssignmentItem[]>({
      url: `/shift-assignments/franchise/${franchiseId}`,
    })
  },

  getShiftAssignmentsByShiftId: (shiftId: string): Promise<ShiftAssignmentItem[] | null> => {
    return httpClient.get<ShiftAssignmentItem[]>({
      url: `/shift-assignments/shift/${shiftId}`,
    })
  },
}
