import type { FilterOption } from './order.types';

export const PAGE_SIZE = 5;

export const statusConfig = {
  CANCELLED: {
    label: 'Đã huỷ',
    color: 'bg-red-500 text-white',
    textColor: 'text-red-600',
    bgLight: 'bg-red-50',
  },

  DRAFT: {
    label: 'Chờ xác nhận',
    color: 'bg-orange-500 text-white',
    textColor: 'text-orange-600',
    bgLight: 'bg-orange-50',
  },

  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-sky-500 text-white',
    textColor: 'text-sky-600',
    bgLight: 'bg-sky-50',
  },

  PREPARING: {
    label: 'Đang pha chế',
    color: 'bg-blue-500 text-white',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-50',
  },

  OUT_FOR_DELIVERY: {
    label: 'Đang giao hàng',
    color: 'bg-amber-500 text-white',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-50',
  },

  READY_FOR_PICKUP: {
    label: 'Chờ lấy hàng',
    color: 'bg-teal-500 text-white',
    textColor: 'text-teal-600',
    bgLight: 'bg-teal-50',
  },

  COMPLETED: {
    label: 'Hoàn tất',
    color: 'bg-emerald-500 text-white',
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