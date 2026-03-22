import { Award, ShieldCheck, Truck, Wallet } from 'lucide-react';

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
  onCheckout: () => void;
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
  formatCurrency,
}: CartDetailSummaryAsideProps) {
  return (
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
          onClick={onCheckout}
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
  );
}

export default CartDetailSummaryAside;
