import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreditCard,
  MapPin,
  MessageSquare,
  Phone,
  Tag,
  Ticket,
  Wallet,
  X,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { CheckoutPayload } from '../hooks/use-checkout-handler.hook';
import { checkoutInfoSchema, type CheckoutInfoFormValues } from '../schemas/checkout.schema';

interface SummaryRowProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone?: 'default' | 'discount';
}

interface CartDetailSummaryAsideProps {
  subtotalAmount: number;
  voucherDiscount: number;
  promotionDiscount: number;
  finalAmount: number;
  totalDiscount: number;
  voucherCode: string;
  isApplyingVoucher: boolean;
  isRemovingVoucher: boolean;
  onChangeVoucherCode: (value: string) => void;
  onApplyVoucher: () => void;
  onRemoveVouchers: () => void;
  onCheckout: (payload: CheckoutPayload) => Promise<boolean>;
  formatCurrency: (amount: number) => string;
}

function SummaryRow({ icon: Icon, label, value, tone = 'default' }: SummaryRowProps) {
  const isDiscount = tone === 'discount';

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            isDiscount ? 'bg-emerald-100 text-emerald-700' : 'bg-[var(--cf-primary)]/10 text-[var(--cf-primary)]'
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>

      <span className={`shrink-0 text-sm font-bold ${isDiscount ? 'text-emerald-700' : 'text-slate-900'}`}>
        {value}
      </span>
    </div>
  );
}

function SummaryDivider() {
  return <div className="border-t border-dashed border-slate-200/90" />;
}

function CartDetailSummaryAside({
  subtotalAmount,
  voucherDiscount,
  promotionDiscount,
  finalAmount,
  totalDiscount,
  voucherCode,
  isApplyingVoucher,
  isRemovingVoucher,
  onChangeVoucherCode,
  onApplyVoucher,
  onRemoveVouchers,
  onCheckout,
  formatCurrency,
}: CartDetailSummaryAsideProps) {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutInfoFormValues>({
    resolver: zodResolver(checkoutInfoSchema),
    mode: 'onBlur',
    defaultValues: {
      address: '',
      phone: '',
      message: '',
    },
  });

  useEffect(() => {
    if (!isCheckoutModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmittingCheckout) {
        setIsCheckoutModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCheckoutModalOpen, isSubmittingCheckout]);

  const openCheckoutModal = () => {
    if (isSubmittingCheckout) return;

    reset({
      address: '',
      phone: '',
      message: '',
    });
    setIsCheckoutModalOpen(true);
  };

  const closeCheckoutModal = () => {
    if (isSubmittingCheckout) return;
    setIsCheckoutModalOpen(false);
  };

  const submitCheckout = handleSubmit(
    async (formValues) => {
      setIsSubmittingCheckout(true);

      try {
        const didCheckout = await onCheckout(formValues);
        if (didCheckout) {
          setIsCheckoutModalOpen(false);
        }
      } finally {
        setIsSubmittingCheckout(false);
      }
    },
    () => {
      toast.error('Thông tin thanh toán chưa hợp lệ', {
        description: 'Vui lòng kiểm tra lại địa chỉ và số điện thoại.',
      });
    },
  );

  return (
    <>
      <aside className="w-full lg:w-[390px] lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-[1.75rem] border border-[var(--cf-primary)]/10 bg-white p-5 shadow-[0px_18px_40px_rgba(30,18,18,0.08)]">
          <div className="mb-5">
            <h2 className="text-[1.75rem] font-black tracking-tight text-[var(--cf-primary)]">
              Tóm tắt đơn hàng
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--cf-primary)]/60">
              Tổng quan thanh toán
            </p>
          </div>

          <div className="mb-5">
            <label
              className="mb-2 block text-[11px] font-bold uppercase tracking-[0.13em] text-[var(--cf-primary)]/65"
              htmlFor="promo"
            >
              Mã giảm giá
            </label>
            <div className="flex gap-2">
              <input
                className="block w-full rounded-xl border-[var(--cf-primary)]/15 bg-[var(--cf-bg)]/80 px-3.5 py-2 text-sm focus:border-[var(--cf-primary)] focus:ring-[var(--cf-primary)]/20"
                disabled={isApplyingVoucher || isRemovingVoucher}
                id="promo"
                onChange={(e) => onChangeVoucherCode(e.target.value)}
                placeholder="Nhập mã ưu đãi..."
                type="text"
                value={voucherCode}
              />
              <button
                className="whitespace-nowrap rounded-xl bg-[var(--cf-primary)] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[var(--cf-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isApplyingVoucher || isRemovingVoucher}
                onClick={onApplyVoucher}
                type="button"
              >
                {isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
              </button>
            </div>

            {voucherDiscount > 0 ? (
              <button
                className="mt-2 text-[11px] font-bold uppercase tracking-[0.14em] text-red-600 hover:text-red-700"
                disabled={isApplyingVoucher || isRemovingVoucher}
                onClick={onRemoveVouchers}
                type="button"
              >
                {isRemovingVoucher ? 'Đang xóa voucher...' : 'Xóa voucher khỏi đơn'}
              </button>
            ) : null}
          </div>

          <div className="rounded-[1.25rem] bg-[var(--cf-bg)]/55 px-4 py-4">
            <div className="mb-2">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[var(--cf-primary)]/45">
                Chi tiết thanh toán
              </p>
            </div>

            <div>
              <SummaryRow
                icon={Wallet}
                label="Tạm tính"
                value={formatCurrency(subtotalAmount)}
              />
              <SummaryRow
                icon={Ticket}
                label="Giảm từ voucher"
                tone="discount"
                value={`-${formatCurrency(voucherDiscount)}`}
              />
              <SummaryRow
                icon={Tag}
                label="Giảm khuyến mãi"
                tone="discount"
                value={`-${formatCurrency(promotionDiscount)}`}
              />

              <SummaryDivider />

              <div className="flex items-center justify-between py-3 text-emerald-700">
                <span className="text-sm font-bold">Tổng giảm giá</span>
                <span className="text-sm font-black">-{formatCurrency(totalDiscount)}</span>
              </div>

              <SummaryDivider />

              <div className="mt-3 flex items-start gap-3 rounded-[1rem] bg-white px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--cf-primary)] text-white">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--cf-primary)]/45">
                    Tổng thanh toán
                  </p>
                  <div className="mt-1.5 flex items-end justify-between gap-3">
                    <span className="text-sm font-semibold text-[var(--cf-primary)]/70">
                      Thành tiền
                    </span>
                    <span className="whitespace-nowrap text-right text-[clamp(1.5rem,6vw,2rem)] font-black leading-none tracking-tight tabular-nums text-[var(--cf-primary)]">
                      {formatCurrency(finalAmount)}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--cf-primary)]/35">
                    Đã bao gồm VAT
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            className="mt-4 flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#7F5539,#A26A45)] px-6 py-3.5 text-sm font-black uppercase tracking-[0.16em] text-white shadow-[0_16px_30px_rgba(127,85,57,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_36px_rgba(127,85,57,0.3)] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmittingCheckout}
            onClick={() => {
              openCheckoutModal();
            }}
            type="button"
          >
            {isSubmittingCheckout ? 'Đang xử lý...' : 'Tiến hành thanh toán'}
          </button>
        </div>
      </aside>

      {isCheckoutModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-4 backdrop-blur-sm md:items-center">
          <button
            aria-label="Đóng modal thanh toán"
            className="absolute inset-0"
            onClick={closeCheckoutModal}
            type="button"
          />

          <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-t-[1.75rem] border border-[var(--cf-primary)]/10 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.16)] md:rounded-[1.75rem]">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h3 className="text-xl font-black tracking-tight text-[var(--cf-primary)]">
                  Thông tin giao hàng
                </h3>
                <p className="mt-1 text-sm text-[var(--cf-primary)]/60">
                  Nhập địa chỉ, số điện thoại và lời nhắn cho đơn hàng.
                </p>
              </div>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                disabled={isSubmittingCheckout}
                onClick={closeCheckoutModal}
                type="button"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form
              className="space-y-5 px-5 py-5"
              onSubmit={(event) => {
                event.preventDefault();
                void submitCheckout();
              }}
            >
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--cf-primary)]/60"
                  htmlFor="checkout-address"
                >
                  Địa chỉ giao hàng
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--cf-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--cf-primary)]/10"
                    disabled={isSubmittingCheckout}
                    id="checkout-address"
                    placeholder="Nhập địa chỉ giao hàng"
                    type="text"
                    {...register('address')}
                  />
                </div>
                {errors.address?.message ? (
                  <p className="text-xs text-red-600">{errors.address.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--cf-primary)]/60"
                  htmlFor="checkout-phone"
                >
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--cf-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--cf-primary)]/10"
                    disabled={isSubmittingCheckout}
                    id="checkout-phone"
                    placeholder="Nhập số điện thoại"
                    type="text"
                    {...register('phone')}
                  />
                </div>
                {errors.phone?.message ? (
                  <p className="text-xs text-red-600">{errors.phone.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label
                  className="block text-xs font-bold uppercase tracking-[0.14em] text-[var(--cf-primary)]/60"
                  htmlFor="checkout-message"
                >
                  Lời nhắn
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-3 text-slate-400">
                    <MessageSquare className="h-4.5 w-4.5" />
                  </div>
                  <textarea
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--cf-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--cf-primary)]/10"
                    disabled={isSubmittingCheckout}
                    id="checkout-message"
                    placeholder="Ví dụ: giao trong giờ hành chính..."
                    rows={3}
                    {...register('message')}
                  />
                </div>
                {errors.message?.message ? (
                  <p className="text-xs text-red-600">{errors.message.message}</p>
                ) : null}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[var(--cf-primary)] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmittingCheckout}
                  onClick={closeCheckoutModal}
                  type="button"
                >
                  Hủy
                </button>
                <button
                  className="flex-1 rounded-full bg-[linear-gradient(135deg,#7F5539,#A26A45)] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_30px_rgba(127,85,57,0.24)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmittingCheckout}
                  type="submit"
                >
                  {isSubmittingCheckout ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CartDetailSummaryAside;
