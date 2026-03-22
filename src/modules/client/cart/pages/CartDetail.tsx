import { useCallback, useState } from 'react';
import { ArrowLeft, Award, ShieldCheck, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';
import { CartDetailItemCard, CartEditModal, Confirm } from '../components';
import { useCartDetail } from '../hook/use-cart-detail.hook';
import { useCheckoutHandler } from '../hook/useCheckoutHandler';

// --- CartDetail Page ---

function CartDetail() {
  const navigate = useNavigate();
  const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null);
  const { cartId = '' } = useParams<{ cartId: string }>();
  const {
    cart,
    isLoading,
    isDeleting,
    isUpdatingQuantity,
    editingItem,
    editItemQuantity,
    editNote,
    editOptions,
    availableToppings,
    isLoadingToppings,
    isSavingEdit,
    voucherCode,
    isApplyingVoucher,
    isRemovingVoucher,
    handleDeleteItem,
    setCartItemQuantity,
    increaseCartItemQuantity,
    decreaseCartItemQuantity,
    openEditPopup,
    closeEditPopup,
    updateEditItemQty,
    updateEditQtyFromInput,
    updateOptionQtyInPopup,
    saveEditedItem,
    setVoucherCode,
    applyVoucherForCart,
    removeAllVoucherFromCart,
    setEditNote,
  } = useCartDetail(cartId);
  const { handleCheckout } = useCheckoutHandler(cartId);

  const formatCurrency = (amount: number) => `${amount.toLocaleString('vi-VN')} ₫`;
  const totalDiscount = (cart?.promotionDiscount ?? 0) + (cart?.voucherDiscount ?? 0) + (cart?.loyaltyDiscount ?? 0);

  const openDeleteConfirm = useCallback((itemId: string) => {
    setPendingDeleteItemId(itemId);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    if (isDeleting) return;
    setPendingDeleteItemId(null);
  }, [isDeleting]);

  const confirmDeleteItem = useCallback(() => {
    if (!pendingDeleteItemId) return;
    void handleDeleteItem(pendingDeleteItemId);
    setPendingDeleteItemId(null);
  }, [handleDeleteItem, pendingDeleteItemId]);

  if (isLoading) {
    return <div className="min-h-[calc(100vh-4rem)] bg-white" />;
  }

  if (!cart) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={80} className="mx-auto text-[var(--cf-secondary)] opacity-30 mb-4" />
          <h2 className="text-2xl font-bold text-[var(--cf-dark)] mb-2">Không tìm thấy cart</h2>
          <button
            onClick={() => navigate(ROUTER_URL.HOME_ROUTER.CART)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--cf-secondary)] text-white font-semibold rounded-lg hover:bg-[var(--cf-dark)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            Quay lại danh sách cart
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] text-[var(--cf-dark)] bg-gradient-to-b from-[var(--cf-bg)] via-[var(--cf-bg)] to-white">
      <main className="container mx-auto px-4 md:px-6 pb-20 pt-8 md:pt-10">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <button
              onClick={() => navigate(ROUTER_URL.HOME_ROUTER.CART)}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--cf-primary)]/70 hover:text-[var(--cf-primary)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              Quay lại danh sách
            </button>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-[var(--cf-dark)]">
              Giỏ hàng của bạn
              <span className="ml-3 text-xl md:text-2xl font-semibold text-[var(--cf-primary)]/45">({cart.items.length} sản phẩm)</span>
            </h1>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 items-start">
          <section className="flex-1">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 mb-5 text-xs font-bold text-[var(--cf-primary)]/55 uppercase tracking-[0.16em]">
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right pr-4">Tổng cộng</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-5">
              {cart.items.map((item) => {
                return (
                  <CartDetailItemCard
                    formatCurrency={formatCurrency}
                    isDeleting={isDeleting === item.id}
                    isUpdatingQuantity={isUpdatingQuantity === item.id}
                    item={item}
                    key={item.id}
                    onDecreaseQty={decreaseCartItemQuantity}
                    onDelete={openDeleteConfirm}
                    onEdit={openEditPopup}
                    onIncreaseQty={increaseCartItemQuantity}
                    onSubmitQty={setCartItemQuantity}
                  />
                );
              })}
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate(ROUTER_URL.MENU)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--cf-primary)] hover:text-[var(--cf-dark)] transition-colors cursor-pointer"
              >
                <ArrowLeft size={16} />
                Tiếp tục mua sắm
              </button>
            </div>
          </section>

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
                    onChange={(e) => setVoucherCode(e.target.value)}
                    disabled={isApplyingVoucher || isRemovingVoucher}
                  />
                  <button
                    className="bg-[var(--cf-primary)] text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--cf-dark)] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={applyVoucherForCart}
                    disabled={isApplyingVoucher || isRemovingVoucher}
                    type="button"
                  >
                    {isApplyingVoucher ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                </div>
                {cart.voucherDiscount > 0 && (
                  <button
                    className="mt-3 px-2 py-3 text-xs border font-bold uppercase tracking-[0.17em] text-red-600 hover:text-red-700 cursor-pointer"
                    onClick={removeAllVoucherFromCart}
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
                  <span>{formatCurrency(cart.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-[#2D6A4F] font-semibold bg-[#2D6A4F]/8 px-4 py-2 rounded-xl">
                  <span>Giảm giá</span>
                  <span>-{formatCurrency(totalDiscount)}</span>
                </div>
                {cart.voucherDiscount > 0 && (
                  <div className="flex justify-between text-[#2D6A4F] font-medium text-sm">
                    <span>Voucher</span>
                    <span>-{formatCurrency(cart.voucherDiscount)}</span>
                  </div>
                )}
                {/* <div className="flex justify-between text-[var(--cf-primary)]/65 text-sm border-t border-[var(--cf-primary)]/10 pt-4">
                  <span className="italic">Phí vận chuyển</span>
                  <span className="font-medium">Sẽ được tính ở bước tiếp theo</span>
                </div> */}
              </div>

              <div className="flex items-center gap-2 bg-[#2D6A4F]/10 text-[#2D6A4F] px-4 py-3 rounded-2xl mb-8 border border-[#2D6A4F]/20">
                <Sparkles size={18} />
                <span className="font-bold text-sm">Bạn đã tiết kiệm {formatCurrency(totalDiscount)}</span>
              </div>

              <div className="border-t border-dashed border-[var(--cf-primary)]/20 pt-7 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-[var(--cf-primary)]/70">Tổng thanh toán</span>
                  <span className="text-3xl font-black tracking-tight text-[var(--cf-primary)]">{formatCurrency(cart.finalAmount)}</span>
                </div>
                <p className="text-right text-[10px] text-[var(--cf-primary)]/45 uppercase tracking-[0.15em] font-bold mt-1">Đã bao gồm VAT nếu có</p>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-[var(--cf-primary)] text-white font-extrabold py-4 rounded-xl hover:bg-[var(--cf-dark)] transition-all active:scale-[0.98] shadow-[0px_18px_34px_rgba(139,29,29,0.3)] uppercase tracking-[0.12em] text-base cursor-pointer"
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
        </div>
      </main>

      <CartEditModal
        editItemQuantity={editItemQuantity}
        editNote={editNote}
        editOptions={editOptions}
        availableToppings={availableToppings}
        editingItem={editingItem}
        formatCurrency={formatCurrency}
        isLoadingToppings={isLoadingToppings}
        isSavingEdit={isSavingEdit}
        onChangeItemQty={updateEditItemQty}
        onChangeItemQtyInput={updateEditQtyFromInput}
        onChangeNote={setEditNote}
        onChangeOptionQty={updateOptionQtyInPopup}
        onClose={closeEditPopup}
        onSave={saveEditedItem}
      />

      <Confirm
        cancelText="Không"
        confirmText="Xóa sản phẩm"
        isOpen={Boolean(pendingDeleteItemId)}
        message="Sản phẩm sẽ bị xóa khỏi giỏ hàng của bạn. Hành động này không thể hoàn tác."
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteItem}
        title="Xác nhận xóa sản phẩm"
        type="danger"
      />
    </div>
  );
}

export default CartDetail;
