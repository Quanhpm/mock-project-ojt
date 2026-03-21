import type { FilterOption } from './order.types';

export const PAGE_SIZE = 5;

export const statusConfig = {
  COMPLETED: {
    label: 'Hoàn tất',
    color: 'bg-primary text-white',
    textColor: 'text-primary',
    bgLight: 'bg-primary/10',
  },
  PREPARING: {
    label: 'Đang pha chế',
    color: 'bg-secondary text-white',
    textColor: 'text-secondary',
    bgLight: 'bg-secondary/10',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-cyan-500 text-white',
    textColor: 'text-cyan-500',
    bgLight: 'bg-cyan-500/10',
  },
  READY_FOR_PICKUP: {
    label: 'Chờ lấy hàng',
    color: 'bg-blue-600 text-white',
    textColor: 'text-blue-600',
    bgLight: 'bg-blue-600/10',
  },
  CANCELLED: {
    label: 'Đã huỷ',
    color: 'bg-dark-shade text-white',
    textColor: 'text-dark-shade',
    bgLight: 'bg-dark-shade/10',
  },
  DRAFT: {
    label: 'Nháp',
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
