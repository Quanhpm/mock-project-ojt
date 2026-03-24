import { formatDate } from '@/utils';
import { statusConfig } from '../../order.config';
import type { OrderData } from '../../order.types';
import { getStatusIcon, STATUS_COLORS } from './order-detail.constants';

interface InfoCardProps {
  title: string;
  icon?: string;
  value: React.ReactNode;
}

interface OrderStatusHeaderProps {
  order: OrderData;
}

function InfoCard({ title, icon, value }: InfoCardProps) {
  return (
    <div className="p-4 rounded-lg bg-slate-50/50 border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
        {title}
      </p>
      <div className="flex items-center gap-2">
        {icon ? <span className="material-symbols-outlined text-base text-primary">{icon}</span> : null}
        <p className="text-base font-bold text-[#1a130c]">{value}</p>
      </div>
    </div>
  );
}

function OrderStatusHeader({ order }: OrderStatusHeaderProps) {
  const statusCode = order.status.code;
  const config = statusConfig[statusCode];
  const statusColors = STATUS_COLORS[statusCode];
  const failedReason = order.failedReason?.trim();
  const shouldShowFailedReason = statusCode === 'CANCELLED' && Boolean(failedReason);

  return (
    <>
      <div className={`p-4 rounded-lg border ${statusColors.card} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined ${statusCode === 'PREPARING' ? 'animate-pulse' : ''} ${statusColors.text}`}
          >
            {getStatusIcon(statusCode)}
          </span>
          <div>
            <p className={`text-sm font-semibold ${statusColors.text}`}>Trạng thái đơn hàng</p>
            <p className="text-lg font-bold text-[#1a130c]">{config.label}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Ngày đặt</p>
          <p className="text-sm font-bold text-[#1a130c]">{formatDate(order.meta.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard title="Kênh đặt hàng" value={order.channel} />
        <InfoCard title="Số lượng món" icon="shopping_basket" value={order.meta.items_count} />
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-primary text-xl">info</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a130c] mb-1">Thông tin đơn hàng</p>
            <p className="text-xs text-slate-600">
              Đơn hàng được đặt qua kênh <span className="font-semibold">{order.channel}</span> tại cửa hàng{' '}
              <span className="font-semibold">{order.store.name}</span>.
            </p>
          </div>
        </div>
      </div>

      {shouldShowFailedReason ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-xl text-rose-600">report</span>
            <div className="flex-1">
              <p className="mb-1 text-sm font-semibold text-rose-700">Lý do hủy đơn</p>
              <p className="text-sm leading-relaxed text-rose-900">{failedReason}</p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default OrderStatusHeader;
