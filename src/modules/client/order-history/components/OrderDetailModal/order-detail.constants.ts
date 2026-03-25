import type { OrderData } from '../../order.types';
import type { LucideIcon } from 'lucide-react';
import { CheckCircle2, Clock3, LoaderCircle, Package, Receipt, XCircle } from 'lucide-react';

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
    text: 'text-emerald-700',
    badge: 'bg-emerald-500/10 text-emerald-700',
  },
  CANCELLED: {
    card: 'bg-rose-500/10 border-rose-500/20',
    text: 'text-rose-700',
    badge: 'bg-rose-500/10 text-rose-700',
  },
  READY_FOR_PICKUP: {
    card: 'bg-blue-600/10 border-blue-600/20',
    text: 'text-blue-700',
    badge: 'bg-blue-600/10 text-blue-700',
  },
  CONFIRMED: {
    card: 'bg-cyan-500/10 border-cyan-500/20',
    text: 'text-cyan-700',
    badge: 'bg-cyan-500/10 text-cyan-700',
  },
  PREPARING: {
    card: 'bg-primary/10 border-primary/20',
    text: 'text-primary',
    badge: 'bg-primary/10 text-primary',
  },
  DRAFT: {
    card: 'bg-zinc-500/10 border-zinc-500/20',
    text: 'text-zinc-700',
    badge: 'bg-zinc-500/10 text-zinc-700',
  },
  OUT_FOR_DELIVERY: {
    card: 'bg-amber-500/10 border-amber-500/20',
    text: 'text-amber-700',
    badge: 'bg-amber-500/10 text-amber-700',
  },
};

export const STATUS_ICONS: Record<OrderStatusCode, LucideIcon> = {
  COMPLETED: CheckCircle2,
  CANCELLED: XCircle,
  READY_FOR_PICKUP: Package,
  CONFIRMED: Clock3,
  PREPARING: LoaderCircle,
  DRAFT: Receipt,
};
