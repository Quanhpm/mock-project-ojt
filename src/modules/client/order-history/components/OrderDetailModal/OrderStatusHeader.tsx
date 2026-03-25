import { formatDate } from '@/utils';
import { Info, ShoppingBasket } from 'lucide-react';
import { statusConfig } from '../../order.config';
import type { OrderData } from '../../order.types';
import { STATUS_COLORS, STATUS_ICONS } from './order-detail.constants';

interface InfoCardProps {
  title: string;
  icon?: React.ReactNode;
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
        {icon}
        <p className="text-base font-bold text-[#1a130c]">{value}</p>
      </div>
    </div>
  );
}

function OrderStatusHeader({ order }: OrderStatusHeaderProps) {
  const statusCode = order.status.code;
  const config = statusConfig[statusCode];
  const statusColors = STATUS_COLORS[statusCode];
  const customerMessage = order.message?.trim();
  const StatusIcon = STATUS_ICONS[statusCode];

  return (
    <>
      <div className={`p-4 rounded-lg border ${statusColors.card} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <StatusIcon className={`size-5 ${statusCode === 'PREPARING' ? 'animate-pulse' : ''} ${statusColors.text}`} />
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
        <InfoCard
          title="Số lượng món"
          icon={<ShoppingBasket className="size-4 text-primary" />}
          value={order.meta.items_count}
        />
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex items-start gap-3">
          <Info className="size-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a130c] mb-1">Thông tin đơn hàng</p>
            <p className="text-xs text-slate-600">
              Đơn hàng được đặt qua kênh <span className="font-semibold text-emerald-400">{order.channel}</span> tại cửa hàng{' '}
              <span className="font-semibold text-sky-400">{order.store.name}</span>.
            </p>
            {customerMessage ? (
              <p className="text-xs text-slate-700 mt-2">
                <span className="font-semibold text-yellow-600">Ghi chú của khách:</span> {customerMessage}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default OrderStatusHeader;
