import { useMemo } from 'react';
import { formatDate } from '@/utils';
import type { OrderStatusCode } from './order-detail.constants';

type TimelineCode = 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'READY_FOR_PICKUP' | 'COMPLETED';

interface TimelineStepData {
  code: TimelineCode;
  label: string;
  description: string;
}

interface TimelineStepProps {
  step: TimelineStepData;
  isPassed: boolean;
  isCurrent: boolean;
}

interface OrderTimelineProps {
  status: OrderStatusCode;
  createdAt: string;
}

function TimelineStep({ step, isPassed, isCurrent }: TimelineStepProps) {
  const isPreparingCurrent = isCurrent && step.code === 'PREPARING';

  return (
    <div className={`relative flex items-start gap-4 transition-transform ${isCurrent ? 'translate-x-1' : ''}`}>
      <div
        className={`z-10 size-6 rounded-full flex items-center justify-center shrink-0 ${
          isPassed
            ? 'bg-primary'
            : isCurrent
            ? 'bg-primary/20 border-2 border-primary animate-pulse'
            : 'bg-transparent border-2 border-slate-300'
        }`}
      >
        {isPassed ? (
          <span className="material-symbols-outlined text-white text-sm">check</span>
        ) : isCurrent ? (
          <span
            className={`material-symbols-outlined text-primary text-sm ${
              isPreparingCurrent ? 'animate-[spin_2.5s_linear_infinite]' : ''
            }`}
          >
            {isPreparingCurrent ? 'skillet' : 'pending_actions'}
          </span>
        ) : null}
      </div>

      <div>
        <p
          className={`text-sm font-bold ${
            isCurrent
              ? 'text-primary'
              : isPassed
              ? 'text-[#1a130c]'
              : 'text-slate-400'
          }`}
        >
          {step.label}
        </p>
        <p
          className={`text-xs ${
            isCurrent || isPassed
              ? 'text-slate-700'
              : 'text-slate-500'
          }`}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}

function OrderTimeline({ status, createdAt }: OrderTimelineProps) {
  const timelineSteps = useMemo<TimelineStepData[]>(
    () => [
      { code: 'DRAFT', label: 'Đã đặt hàng', description: formatDate(createdAt) },
      { code: 'CONFIRMED', label: 'Đã xác nhận', description: 'Cửa hàng đã xác nhận đơn hàng' },
      { code: 'PREPARING', label: 'Đang chuẩn bị', description: 'Đang pha chế thức uống' },
      { code: 'READY_FOR_PICKUP', label: 'Sẵn sàng nhận món', description: 'Đơn hàng đã sẵn sàng tại cửa hàng' },
      { code: 'COMPLETED', label: 'Hoàn thành', description: 'Đã giao hàng thành công' },
    ],
    [createdAt],
  );

  const currentStepIndex = timelineSteps.findIndex((step) => step.code === status);

  return (
    <div className="p-6 rounded-xl bg-slate-50/50 border border-slate-100">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-6">
        Tiến độ đơn hàng
      </h3>
      {status === 'CANCELLED' ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-rose-500">close</span>
          <div>
            <p className="text-sm font-bold text-rose-700">Đơn hàng đã bị hủy</p>
            <p className="text-xs text-rose-700">Đơn hàng không thể tiếp tục xử lý.</p>
          </div>
        </div>
      ) : (
        <div className="relative space-y-6">
          <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />
          {timelineSteps.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const isPassed = currentStepIndex > index;

            return <TimelineStep key={step.code} step={step} isCurrent={isCurrent} isPassed={isPassed} />;
          })}
        </div>
      )}
    </div>
  );
}

export default OrderTimeline;
