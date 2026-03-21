import type { FilterOption } from './order.types';

export const PAGE_SIZE = 5;

export const statusConfig = {
  COMPLETED: {
    label: 'Hoàn tất',
    color: 'bg-emerald-500 text-white',
    textColor: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
  },
  PREPARING: {
    label: 'Đang pha chế',
    color: 'bg-blue-600 text-white',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-600/50',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-cyan-500 text-white',
    textColor: 'text-cyan-500',
    bgLight: 'bg-cyan-500/10',
  },
  READY_FOR_PICKUP: {
    label: 'Chờ lấy hàng',
    color: ' bg-amber-500 text-white',
    textColor: 'text-amber-600',
    bgLight: 'bg-amber-500/10',
  },
  CANCELLED: {
    label: 'Đã huỷ',
    color: 'bg-rose-500 text-white',
    textColor: 'text-rose-600',
    bgLight: 'bg-rose-50',
  },
  DRAFT: {
    label: 'Chờ thanh toán',
    color: 'bg-gray-400 text-white',
    textColor: 'text-gray-400',
    bgLight: 'bg-gray-400/10',
  },
} as const;

export const filterOptions: Array<{ value: FilterOption; label: string }> = [
  { value: 'all', label: 'Gần nhất' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'pending', label: 'Chưa hoàn thành' },
  { value: 'cancelled', label: 'Đã huỷ' },
];
