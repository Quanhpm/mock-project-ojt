import type { FilterOption } from './order.types';

export const PAGE_SIZE = 5;

export const statusConfig = {
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-600',
    textColor: 'text-red-600',
    bgLight: 'bg-red-50',
  },

  DRAFT: {
    label: 'Chờ thanh toán',
    color: 'bg-orange-100 text-orange-600',
    textColor: 'text-orange-600',
    bgLight: 'bg-orange-50',
  },

  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-600',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
  },

  PREPARING: {
    label: 'Đang chuẩn bị',
    color: 'bg-indigo-100 text-indigo-600',
    textColor: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
  },

  READY_FOR_PICKUP: {
    label: 'Đã bàn giao shipper',
    color: 'bg-cyan-100 text-cyan-600',
    textColor: 'text-cyan-600',
    bgLight: 'bg-cyan-50',
  },

  OUT_FOR_DELIVERY: {
    label: 'Đang giao hàng',
    color: 'bg-amber-100 text-amber-600',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-50',
  },

  COMPLETED: {
    label: 'Hoàn thành',
    color: 'bg-emerald-100 text-emerald-600',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
  },
} as const;

export const filterOptions: Array<{ value: FilterOption; label: string }> = [
  { value: 'all', label: 'Gần nhất' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'pending', label: 'Chưa hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
];

const filterStatusMap: Record<Exclude<FilterOption, 'all'>, keyof typeof statusConfig> = {
  completed: 'COMPLETED',
  pending: 'PREPARING',
  cancelled: 'CANCELLED',
};

const filterHoverClassMapByStatus: Record<keyof typeof statusConfig, { active: string; inactive: string }> = {
  CANCELLED: {
    active: 'hover:text-red-700 hover:bg-red-50',
    inactive: 'hover:text-red-600 hover:bg-red-50',
  },
  DRAFT: {
    active: 'hover:text-orange-700 hover:bg-orange-50',
    inactive: 'hover:text-orange-600 hover:bg-orange-50',
  },
  CONFIRMED: {
    active: 'hover:text-sky-700 hover:bg-sky-50',
    inactive: 'hover:text-sky-600 hover:bg-sky-50',
  },
  PREPARING: {
    active: 'hover:text-blue-700 hover:bg-blue-50',
    inactive: 'hover:text-blue-600 hover:bg-blue-50',
  },
  OUT_FOR_DELIVERY: {
    active: 'hover:text-amber-700 hover:bg-amber-50',
    inactive: 'hover:text-amber-600 hover:bg-amber-50',
  },
  READY_FOR_PICKUP: {
    active: 'hover:text-teal-700 hover:bg-teal-50',
    inactive: 'hover:text-teal-600 hover:bg-teal-50',
  },
  COMPLETED: {
    active: 'hover:text-emerald-700 hover:bg-emerald-50',
    inactive: 'hover:text-emerald-600 hover:bg-emerald-50',
  },
};

export const FILTER_ACTIVE_BASE_CLASS = 'bg-white border border-zinc-200 shadow-md';
export const FILTER_INACTIVE_CLASS = 'text-zinc-600 border border-transparent';

export const filterActiveTextClassMap: Record<FilterOption, string> = {
  all: 'text-primary',
  completed: statusConfig[filterStatusMap.completed].textColor,
  pending: statusConfig[filterStatusMap.pending].textColor,
  cancelled: statusConfig[filterStatusMap.cancelled].textColor,
};

export const filterActiveHoverClassMap: Record<FilterOption, string> = {
  all: 'hover:text-primary hover:bg-primary/10',
  completed: filterHoverClassMapByStatus[filterStatusMap.completed].active,
  pending: filterHoverClassMapByStatus[filterStatusMap.pending].active,
  cancelled: filterHoverClassMapByStatus[filterStatusMap.cancelled].active,
};

export const filterInactiveHoverClassMap: Record<FilterOption, string> = {
  all: 'hover:text-primary hover:bg-primary/10',
  completed: filterHoverClassMapByStatus[filterStatusMap.completed].inactive,
  pending: filterHoverClassMapByStatus[filterStatusMap.pending].inactive,
  cancelled: filterHoverClassMapByStatus[filterStatusMap.cancelled].inactive,
};
