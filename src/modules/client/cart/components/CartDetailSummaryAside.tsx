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
  getCheckoutPrefill: () => Promise<CheckoutPayload>;
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
  getCheckoutPrefill,
  formatCurrency,
}: CartDetailSummaryAsideProps) {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [isPrefillingCheckout, setIsPrefillingCheckout] = useState(false);

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

  const openCheckoutModal = async () => {
    if (isSubmittingCheckout || isPrefillingCheckout) return;

    setIsCheckoutModalOpen(true);
    setIsPrefillingCheckout(true);

    try {
      const checkoutPrefill = await getCheckoutPrefill();
      reset({
        address: checkoutPrefill.address,
        phone: checkoutPrefill.phone,
        message: checkoutPrefill.message ?? '',
      });
    } finally {
      setIsPrefillingCheckout(false);
    }
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
        <div className="rounded-[28px] border border-[var(--cf-primary)]/10 bg-white p-5 shadow-[0px_24px_60px_rgba(30,18,18,0.1)] md:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--cf-dark)]">Tóm tắt đơn hàng</h2>
              <p className="mt-1 text-sm leading-relaxed text-[var(--cf-primary)]/65">
                Kiểm tra ưu đãi và tổng tiền trước khi thanh toán.
              </p>
            </div>

            <div className="hidden rounded-2xl bg-[var(--cf-primary)]/6 px-4 py-3 text-right sm:block">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cf-primary)]/45">
                Thanh toán
              </p>
              <p className="mt-1 text-xl font-black text-[var(--cf-primary)]">
                {formatCurrency(finalAmount)}
              </p>
            </div>
          </div>

          <div className="mb-7">
            <label className="mb-3 block text-xs font-bold uppercase tracking-[0.13em] text-[var(--cf-primary)]/65" htmlFor="promo">
              Mã giảm giá
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className="block w-full rounded-2xl border border-[var(--cf-primary)]/15 bg-[var(--cf-bg)]/80 px-4 py-3 text-sm focus:border-[var(--cf-primary)] focus:ring-[var(--cf-primary)]/20"
                id="promo"
                placeholder="Nhập mã ưu đãi..."
                type="text"
                value={voucherCode}
                onChange={(event) => onChangeVoucherCode(event.target.value)}
                disabled={isApplyingVoucher || isRemovingVoucher}
              />
              <button
                className="whitespace-nowrap rounded-2xl bg-[var(--cf-primary)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--cf-dark)] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                onClick={onApplyVoucher}
                disabled={isApplyingVoucher || isRemovingVoucher}
                type="button"
              >
                {isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
              </button>
            </div>
            {voucherDiscount > 0 && (
              <button
                className="mt-3 text-xs font-bold uppercase tracking-[0.17em] text-red-600 transition-colors hover:text-red-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                onClick={onRemoveVouchers}
                disabled={isApplyingVoucher || isRemovingVoucher}
                type="button"
              >
                {isRemovingVoucher ? 'Đang xóa voucher...' : 'Xóa tất cả voucher khỏi đơn'}
              </button>
            )}
          </div>

          <div className="mb-7 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-[var(--cf-bg)]/70 px-4 py-3 text-sm font-medium text-[var(--cf-primary)]/80">
              <span>Tạm tính</span>
              <span>{formatCurrency(subtotalAmount)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-[#2D6A4F]/8 px-4 py-3 text-sm font-semibold text-[#2D6A4F]">
              <span>Giảm giá</span>
              <span>-{formatCurrency(totalDiscount)}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex items-center justify-between px-1 text-sm font-medium text-[#2D6A4F]">
                <span>Voucher</span>
                <span>-{formatCurrency(voucherDiscount)}</span>
              </div>
            )}
          </div>

          <div className="mb-7 flex items-center gap-2 rounded-2xl border border-[#2D6A4F]/20 bg-[#2D6A4F]/10 px-4 py-3 text-[#2D6A4F]">
            <Wallet size={18} />
            <span className="text-sm font-bold">
              Bạn đã tiết kiệm {formatCurrency(totalDiscount)}
            </span>
          </div>

          <div className="border-t border-dashed border-[var(--cf-primary)]/20 pt-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-[var(--cf-primary)]/70">Tổng thanh toán</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cf-primary)]/45">
                  Đã bao gồm VAT nếu có
                </p>
              </div>
              <span className="text-3xl font-black tracking-tight text-[var(--cf-primary)]">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              void openCheckoutModal();
            }}
            className="mt-7 hidden w-full rounded-2xl bg-[var(--cf-primary)] py-4 text-base font-extrabold uppercase tracking-[0.12em] text-white shadow-[0px_18px_34px_rgba(139,29,29,0.3)] transition-all hover:bg-[var(--cf-dark)] active:scale-[0.98] cursor-pointer lg:block"
            type="button"
          >
            Tiến hành thanh toán
          </button>

          <p className="mt-5 text-center text-xs font-medium text-[var(--cf-primary)]/60">
            Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
          </p>
        </div>

        <div className="mt-7 hidden justify-center gap-7 text-[var(--cf-primary)]/30 lg:flex">
          <ShieldCheck size={30} />
          <Truck size={30} />
          <Award size={30} />
        </div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--cf-primary)]/10 bg-white/95 backdrop-blur lg:hidden">
        <div className="container mx-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+0.9rem)] pt-3">
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[var(--cf-bg)]/70 px-4 py-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--cf-primary)]/45">
                Tổng thanh toán
              </p>
              <p className="mt-1 truncate text-xl font-black text-[var(--cf-primary)]">
                {formatCurrency(finalAmount)}
              </p>
              {totalDiscount > 0 && (
                <p className="mt-1 text-xs font-medium text-[#2D6A4F]">
                  Tiết kiệm {formatCurrency(totalDiscount)}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                void openCheckoutModal();
              }}
              className="shrink-0 rounded-2xl bg-[var(--cf-primary)] px-5 py-3 text-sm font-extrabold uppercase tracking-[0.08em] text-white shadow-[0px_18px_34px_rgba(139,29,29,0.22)] transition-all hover:bg-[var(--cf-dark)] active:scale-[0.98] cursor-pointer"
              type="button"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm md:p-8">
          <div className="absolute inset-0" onClick={closeCheckoutModal} />

          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_40px_rgba(0,60,115,0.08)]">
            <header className="sticky top-0 z-10 flex items-center justify-between bg-white px-6 py-6 md:px-10 md:py-8">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold leading-tight tracking-tight text-[var(--cf-dark)]">
                  Thông tin giao hàng
                </h3>
                <p className="text-sm leading-relaxed text-[var(--cf-primary)]/70">
                  Vui lòng xác nhận địa chỉ, số điện thoại và lời nhắn cho đơn hàng.
                </p>
              </div>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800"
                disabled={isSubmittingCheckout}
                className="rounded-full p-2 text-[var(--cf-primary)]/70 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form
              className="space-y-6 bg-white px-6 py-8 md:px-10 md:py-10"
              onSubmit={(event) => {
                event.preventDefault();
                void submitCheckout();
              }}
            >
              <div className="space-y-3">
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[var(--cf-primary)]/75" htmlFor="checkout-address">
                  Địa chỉ giao hàng
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--cf-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--cf-primary)]/10"
                    disabled={isSubmittingCheckout || isPrefillingCheckout}
                    id="checkout-address"
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-[var(--cf-dark)] transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="Nhập địa chỉ giao hàng"
                    type="text"
                    {...register('address')}
                  />
                </div>
                {errors.address?.message ? (
                  <p className="text-xs text-red-600">{errors.address.message}</p>
                ) : null}
              </div>

              <div className="space-y-3">
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[var(--cf-primary)]/75" htmlFor="checkout-phone">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--cf-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--cf-primary)]/10"
                    disabled={isSubmittingCheckout || isPrefillingCheckout}
                    id="checkout-phone"
                    type="text"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-[var(--cf-dark)] transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="Nhập số điện thoại"
                    type="text"
                    {...register('phone')}
                  />
                </div>
                {errors.phone?.message ? (
                  <p className="text-xs text-red-600">{errors.phone.message}</p>
                ) : null}
              </div>

              <div className="space-y-3">
                <label className="block text-[13px] font-bold uppercase tracking-wider text-[var(--cf-primary)]/75" htmlFor="checkout-message">
                  Lời nhắn cho cửa hàng
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-4 text-slate-400">
                    <MessageSquare size={18} />
                  </div>
                  <textarea
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition-all focus:border-[var(--cf-primary)] focus:bg-white focus:ring-4 focus:ring-[var(--cf-primary)]/10"
                    disabled={isSubmittingCheckout || isPrefillingCheckout}
                    id="checkout-message"
                    rows={4}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-[var(--cf-dark)] transition-all placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    placeholder="Ví dụ: giao trong giờ hành chính..."
                    rows={3}
                    {...register('message')}
                  />
                </div>
                {errors.message?.message ? (
                  <p className="text-xs text-red-600">{errors.message.message}</p>
                ) : null}
              </div>

              <div className="mt-2 flex items-start gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 p-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--cf-primary)] text-white shadow-[0px_12px_24px_rgba(139,29,29,0.25)]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[var(--cf-dark)]">Giao hàng bảo mật</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--cf-primary)]/70">
                    Thông tin của bạn được bảo vệ và chỉ dùng để xử lý đơn hàng.
                  </p>
                </div>
              </div>

              <footer className="flex items-center justify-end gap-3 border-t border-slate-200/80 pt-2 md:gap-4">
                <button
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-[var(--cf-primary)] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmittingCheckout}
                  className="rounded-xl border border-[var(--cf-primary)]/20 bg-[var(--cf-bg)] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[var(--cf-primary)] transition-all hover:bg-[var(--cf-primary)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Hủy
                </button>
                <button
                  className="flex-1 rounded-full bg-[linear-gradient(135deg,#7F5539,#A26A45)] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_30px_rgba(127,85,57,0.24)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmittingCheckout || isPrefillingCheckout}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--cf-primary)] px-7 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-[0px_18px_34px_rgba(139,29,29,0.3)] transition-all hover:bg-[var(--cf-dark)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPrefillingCheckout ? 'Đang tải...' : isSubmittingCheckout ? 'Đang xử lý...' : 'Xác nhận'}
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
