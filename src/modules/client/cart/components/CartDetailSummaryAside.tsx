import {
  Award,
  ChevronRight,
  MapPin,
  MessageSquare,
  Phone,
  ShieldCheck,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { CheckoutPayload } from '../hooks/use-checkout-handler.hook';
import { checkoutInfoSchema, type CheckoutInfoFormValues } from '../schemas/checkout.schema';

interface CartDetailSummaryAsideProps {
  subtotalAmount: number;
  voucherDiscount: number;
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

function CartDetailSummaryAside({
  subtotalAmount,
  voucherDiscount,
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

  const openCheckoutModal = async () => {
    setIsCheckoutModalOpen(true);
    setIsPrefillingCheckout(true);

    const checkoutPrefill = await getCheckoutPrefill();
    reset({
      address: checkoutPrefill.address,
      phone: checkoutPrefill.phone,
      message: checkoutPrefill.message ?? '',
    });

    setIsPrefillingCheckout(false);
  };

  const closeCheckoutModal = () => {
    if (isSubmittingCheckout) return;
    setIsCheckoutModalOpen(false);
  };

  const submitCheckout = handleSubmit(
    async (formValues) => {
      setIsSubmittingCheckout(true);
      const didCheckout = await onCheckout(formValues);
      setIsSubmittingCheckout(false);
      if (didCheckout) {
        setIsCheckoutModalOpen(false);
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
        <div className="bg-white p-7 rounded-[2rem] shadow-[0px_24px_60px_rgba(30,18,18,0.1)] border border-[var(--cf-primary)]/10">
        <h2 className="text-2xl font-extrabold mb-7">Tóm tắt đơn hàng</h2>

        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-[0.13em] text-[var(--cf-primary)]/65 mb-3" htmlFor="promo">Mã giảm giá</label>
          <div className="flex gap-2">
            <input
              className="block w-full px-4 py-2 bg-[var(--cf-bg)]/80 border-[var(--cf-primary)]/15 rounded-xl focus:ring-[var(--cf-primary)]/20 focus:border-[var(--cf-primary)] text-sm"
              id="promo"
              placeholder="Nhập mã ưu đãi..."
              type="text"
              value={voucherCode}
              onChange={(e) => onChangeVoucherCode(e.target.value)}
              disabled={isApplyingVoucher || isRemovingVoucher}
            />
            <button
              className="bg-[var(--cf-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--cf-dark)] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onApplyVoucher}
              disabled={isApplyingVoucher || isRemovingVoucher}
              type="button"
            >
              {isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
            </button>
          </div>
          {voucherDiscount > 0 && (
            <button
              className="mt-3 px-2 py-3 text-xs border font-bold uppercase tracking-[0.17em] text-red-600 hover:text-red-700 cursor-pointer"
              onClick={onRemoveVouchers}
              disabled={isApplyingVoucher || isRemovingVoucher}
              type="button"
            >
              {isRemovingVoucher ? 'Đang xóa voucher...' : 'Xóa tất cả voucher khỏi đơn'}
            </button>
          )}
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-[var(--cf-primary)]/80 font-medium">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotalAmount)}</span>
          </div>
          <div className="flex justify-between text-[#2D6A4F] font-semibold bg-[#2D6A4F]/8 px-4 py-2 rounded-xl">
            <span>Giảm giá</span>
            <span>-{formatCurrency(totalDiscount)}</span>
          </div>
          {voucherDiscount > 0 && (
            <div className="flex justify-between text-[#2D6A4F] font-medium text-sm">
              <span>Voucher</span>
              <span>-{formatCurrency(voucherDiscount)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-[#2D6A4F]/10 text-[#2D6A4F] px-4 py-3 rounded-2xl mb-8 border border-[#2D6A4F]/20">
          <Wallet size={18} />
          <span className="font-bold text-sm">Bạn đã tiết kiệm {formatCurrency(totalDiscount)}</span>
        </div>

        <div className="border-t border-dashed border-[var(--cf-primary)]/20 pt-7 mb-8">
          <div className="flex justify-between items-end">
            <span className="font-bold text-[var(--cf-primary)]/70">Tổng thanh toán</span>
            <span className="text-3xl font-black tracking-tight text-[var(--cf-primary)]">{formatCurrency(finalAmount)}</span>
          </div>
          <p className="text-right text-[10px] text-[var(--cf-primary)]/45 uppercase tracking-[0.15em] font-bold mt-1">Đã bao gồm VAT nếu có</p>
        </div>

        <button
          onClick={() => {
            void openCheckoutModal();
          }}
          className="w-full bg-[var(--cf-primary)] text-white font-extrabold py-4 rounded-xl hover:bg-[var(--cf-dark)] transition-all active:scale-[0.98] shadow-[0px_18px_34px_rgba(139,29,29,0.3)] uppercase tracking-[0.12em] text-base cursor-pointer"
          type="button"
        >
          Tiến hành thanh toán
        </button>

        <p className="text-center mt-5 text-xs text-[var(--cf-primary)]/60 font-medium">
          Bằng cách đặt hàng, bạn đồng ý với Điều khoản dịch vụ của chúng tôi.
        </p>
        </div>

        <div className="mt-7 flex justify-center gap-7 text-[var(--cf-primary)]/30">
          <ShieldCheck size={30} />
          <Truck size={30} />
          <Award size={30} />
        </div>
      </aside>

      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0" onClick={closeCheckoutModal} />

          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-[0_20px_40px_rgba(0,60,115,0.08)] overflow-hidden">
            <header className="flex items-center justify-between px-6 md:px-10 py-6 md:py-8 sticky top-0 z-10 bg-white">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold tracking-tight text-[var(--cf-dark)] leading-tight">Thông tin giao hàng</h3>
                <p className="text-sm text-[var(--cf-primary)]/70 leading-relaxed">
                  Vui lòng xác nhận địa chỉ, số điện thoại và lời nhắn cho đơn hàng.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCheckoutModal}
                disabled={isSubmittingCheckout}
                className="p-2 rounded-full text-[var(--cf-primary)]/70 hover:bg-slate-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </header>

            <div className="px-6 md:px-10">
              <div className="h-px w-full bg-slate-200" />
            </div>

            <form
              className="px-6 md:px-10 py-8 md:py-10 space-y-6 bg-white"
              onSubmit={(e) => {
                e.preventDefault();
                void submitCheckout();
              }}
            >
              <div className="space-y-3">
                <label className="block text-[13px] font-bold tracking-wider text-[var(--cf-primary)]/75 uppercase" htmlFor="checkout-address">
                  Địa chỉ giao hàng
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={18} />
                  </div>
                  <input
                    id="checkout-address"
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[var(--cf-dark)] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="Nhập địa chỉ giao hàng"
                    disabled={isSubmittingCheckout || isPrefillingCheckout}
                    {...register('address')}
                  />
                </div>
                {errors.address?.message && (
                  <p className="text-xs text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[13px] font-bold tracking-wider text-[var(--cf-primary)]/75 uppercase" htmlFor="checkout-phone">
                  Số điện thoại
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                    <Phone size={18} />
                  </div>
                  <input
                    id="checkout-phone"
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[var(--cf-dark)] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all"
                    placeholder="Nhập số điện thoại"
                    disabled={isSubmittingCheckout || isPrefillingCheckout}
                    {...register('phone')}
                  />
                </div>
                {errors.phone?.message && (
                  <p className="text-xs text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-[13px] font-bold tracking-wider text-[var(--cf-primary)]/75 uppercase" htmlFor="checkout-message">
                  Lời nhắn cho cửa hàng
                </label>
                <div className="relative">
                  <div className="absolute top-4 left-4 pointer-events-none text-slate-400">
                    <MessageSquare size={18} />
                  </div>
                  <textarea
                    id="checkout-message"
                    rows={4}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[var(--cf-dark)] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
                    placeholder="Ví dụ: giao trong giờ hành chính..."
                    disabled={isSubmittingCheckout || isPrefillingCheckout}
                    {...register('message')}
                  />
                </div>
                {errors.message?.message && (
                  <p className="text-xs text-red-600">{errors.message.message}</p>
                )}
              </div>

              <div className="mt-2 p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[var(--cf-primary)] flex items-center justify-center text-white shrink-0 shadow-[0px_12px_24px_rgba(139,29,29,0.25)]">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-[var(--cf-dark)] text-sm">Giao hàng bảo mật</h4>
                  <p className="text-xs text-[var(--cf-primary)]/70 mt-1 leading-relaxed">
                    Thông tin của bạn được bảo vệ và chỉ dùng để xử lý đơn hàng.
                  </p>
                </div>
              </div>

              <footer className="flex justify-end items-center gap-3 md:gap-4 pt-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={closeCheckoutModal}
                  disabled={isSubmittingCheckout}
                  className="px-6 py-3 rounded-xl text-sm font-bold tracking-wider text-[var(--cf-primary)] bg-[var(--cf-bg)] hover:bg-[var(--cf-primary)]/10 border border-[var(--cf-primary)]/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingCheckout || isPrefillingCheckout}
                  className="px-7 py-3 rounded-xl text-sm font-bold tracking-wider text-white bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] transition-all shadow-[0px_18px_34px_rgba(139,29,29,0.3)] disabled:opacity-60 disabled:cursor-not-allowed uppercase inline-flex items-center gap-1.5"
                >
                  {isPrefillingCheckout ? 'Đang tải...' : isSubmittingCheckout ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
                  {!isPrefillingCheckout && !isSubmittingCheckout && <ChevronRight size={16} />}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default CartDetailSummaryAside;
