import { useMemo } from 'react';
import { formatCurrency } from '@/utils';
import { statusConfig } from '../../order.config';
import type { OrderData } from '../../order.types';
import { STATUS_COLORS } from './order-detail.constants';

interface OrderPaymentInfoProps {
  pricing: OrderData['pricing'];
  status: OrderData['status']['code'];
}

function OrderPaymentInfo({ pricing, status }: OrderPaymentInfoProps) {
  const calculatedPricing = useMemo(
    () => ({
      subtotal: pricing.subtotal ?? pricing.total,
      promotionDiscount: pricing.promotionDiscount ?? 0,
      voucherDiscount: pricing.voucherDiscount ?? 0,
      final: pricing.finalAmount ?? pricing.total,
    }),
    [pricing.finalAmount, pricing.promotionDiscount, pricing.subtotal, pricing.total, pricing.voucherDiscount],
  );

  return (
    <div className="p-6 rounded-xl bg-slate-50/50 border border-slate-100">
      <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">
        Chi tiết thanh toán
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Tổng tiền hàng</span>
          <span className="text-[#1a130c] font-medium">{formatCurrency(calculatedPricing.subtotal)}</span>
        </div>

        {calculatedPricing.promotionDiscount > 0 ? (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Giảm giá hệ thống</span>
            <span className="text-emerald-700 font-medium">
              -{formatCurrency(calculatedPricing.promotionDiscount)}
            </span>
          </div>
        ) : null}

        {calculatedPricing.voucherDiscount > 0 ? (
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Voucher giảm giá</span>
            <span className="text-emerald-700 font-medium">
              -{formatCurrency(calculatedPricing.voucherDiscount)}
            </span>
          </div>
        ) : null}

        <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-200 px-4 py-4 shadow-sm">
          <div className="flex items-end justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">Tổng cộng</span>
            <span className="text-3xl font-black text-primary tracking-tight">{formatCurrency(calculatedPricing.final)}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Đã bao gồm mọi khoản giảm giá áp dụng.</p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-between items-end">
          <span className="text-xs text-slate-500">Thanh toán bằng</span>
          <span className={`text-sm font-bold ${STATUS_COLORS[status].text}`}>{statusConfig[status].label}</span>
        </div>
      </div>
    </div>
  );
}

export default OrderPaymentInfo;
