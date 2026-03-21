import type { OrderData } from '../../order.types';

export type OrderStatusCode = OrderData['status']['code'];

export const STATUS_COLORS: Record<
  OrderStatusCode,
  {
    card: string;
    text: string;
    badge: string;
  }
> = {
  COMPLETED: {
    card: 'bg-emerald-500/10 border-emerald-500/20',
    text: 'text-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-500',
  },
  CANCELLED: {
    card: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-500',
    badge: 'bg-rose-500/10 text-rose-500',
  },
  READY_FOR_PICKUP: {
    card: 'bg-blue-600/10 border-blue-600/20',
    text: 'text-blue-600',
    badge: 'bg-blue-600/10 text-blue-600',
  },
  CONFIRMED: {
    card: 'bg-cyan-500/10 border-cyan-500/20',
    text: 'text-cyan-500',
    badge: 'bg-cyan-500/10 text-cyan-500',
  },
  PREPARING: {
    card: 'bg-primary/10 border-primary/20',
    text: 'text-primary',
    badge: 'bg-primary/10 text-primary',
  },
  DRAFT: {
    card: 'bg-zinc-500/10 border-zinc-500/20',
    text: 'text-zinc-500',
    badge: 'bg-zinc-500/10 text-zinc-500',
  },
};

export function getStatusIcon(status: OrderStatusCode): string {
  switch (status) {
    case 'COMPLETED':
      return 'check_circle';
    case 'PREPARING':
      return 'skillet';
    case 'CONFIRMED':
      return 'pending';
    case 'READY_FOR_PICKUP':
      return 'inventory';
    case 'CANCELLED':
      return 'cancel';
    default:
      return 'receipt';
  }
}
