import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';
import { CartDetailItemCard, CartEditModal } from '../components';
import { useCartDetail } from '../hook/use-cart-detail.hook';

// --- CartDetail Page ---

function CartDetail() {
  const navigate = useNavigate();
  const { cartId = '' } = useParams<{ cartId: string }>();
  const {
    cart,
    isLoading,
    isDeleting,
    editingItem,
    editItemQuantity,
    editNote,
    editOptions,
    isSavingEdit,
    handleDeleteItem,
    openEditPopup,
    closeEditPopup,
    updateEditItemQty,
    updateEditQtyFromInput,
    updateOptionQtyInPopup,
    saveEditedItem,
    setEditNote,
  } = useCartDetail(cartId);

  const formatCurrency = (amount: number) => `${amount.toLocaleString('vi-VN')} ₫`;
  const totalDiscount = (cart?.promotionDiscount ?? 0) + (cart?.voucherDiscount ?? 0) + (cart?.loyaltyDiscount ?? 0);

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
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] text-[var(--cf-dark)]">
      <main className="container mx-auto px-4 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          <section className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Giỏ hàng của bạn
                <span className="text-sm font-normal text-[var(--cf-primary)]/70">({cart.items.length} sản phẩm)</span>
              </h1>
              <button
                onClick={() => navigate(ROUTER_URL.HOME_ROUTER.CART)}
                className="text-sm text-[var(--cf-primary)] hover:text-[var(--cf-dark)] font-medium inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Quay lại danh sách
              </button>
            </div>

            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b border-[var(--cf-primary)]/15 text-xs font-semibold text-[var(--cf-primary)]/70 uppercase tracking-wider">
              <div className="col-span-5">Sản phẩm</div>
              <div className="col-span-2 text-center">Đơn giá</div>
              <div className="col-span-2 text-center">Số lượng</div>
              <div className="col-span-2 text-right">Tổng cộng</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-4 mt-4">
              {cart.items.map((item) => {
                return (
                  <CartDetailItemCard
                    formatCurrency={formatCurrency}
                    isDeleting={isDeleting === item.id}
                    item={item}
                    key={item.id}
                    onDelete={handleDeleteItem}
                    onEdit={openEditPopup}
                  />
                );
              })}
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate(ROUTER_URL.MENU)}
                className="text-[var(--cf-primary)] font-medium hover:text-[var(--cf-dark)] transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Tiếp tục mua sắm
              </button>
            </div>
          </section>

          <aside className="w-full lg:w-[380px]">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[var(--cf-primary)]/15 sticky top-8">
              <h2 className="text-lg font-bold mb-6 border-b border-[var(--cf-primary)]/15 pb-4">Tóm tắt đơn hàng</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-[var(--cf-primary)]/80 mb-2" htmlFor="promo">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input
                    className="block w-full border-[var(--cf-primary)]/25 rounded-lg focus:ring-[var(--cf-primary)] focus:border-[var(--cf-primary)] text-sm"
                    id="promo"
                    placeholder="Nhập mã..."
                    type="text"
                  />
                  <button className="bg-[var(--cf-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--cf-dark)] transition-colors cursor-pointer whitespace-nowrap">
                    Áp dụng
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[var(--cf-primary)]/80">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(cart.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between text-[var(--cf-primary)]/80">
                  <span>Giảm giá</span>
                  <span className="text-green-700">-{formatCurrency(totalDiscount)}</span>
                </div>
                <div className="flex justify-between text-[var(--cf-primary)]/80 border-t border-[var(--cf-primary)]/10 pt-4">
                  <span>Phí vận chuyển</span>
                  <span className="italic text-xs">Sẽ được tính ở bước tiếp theo</span>
                </div>
                <div className="flex justify-between items-end border-t border-[var(--cf-primary)]/10 pt-4 mt-2">
                  <span className="text-lg font-bold text-[var(--cf-dark)]">Tổng cộng</span>
                  <span className="text-2xl font-bold text-[var(--cf-primary)]">{formatCurrency(cart.finalAmount)}</span>
                </div>
                <p className="text-xs text-[var(--cf-primary)]/55 text-right italic">(Đã bao gồm VAT nếu có)</p>
              </div>

              <button
                onClick={() => navigate(ROUTER_URL.HOME_ROUTER.CHECKOUT)}
                className="w-full bg-[var(--cf-primary)] text-white font-bold py-4 rounded-2xl hover:bg-[var(--cf-dark)] transition-all active:scale-[0.98] shadow-lg shadow-[var(--cf-primary)]/25 uppercase tracking-wider text-lg cursor-pointer"
              >
                Thanh toán
              </button>
            </div>
          </aside>
        </div>
      </main>

      <CartEditModal
        editItemQuantity={editItemQuantity}
        editNote={editNote}
        editOptions={editOptions}
        editingItem={editingItem}
        formatCurrency={formatCurrency}
        isSavingEdit={isSavingEdit}
        onChangeItemQty={updateEditItemQty}
        onChangeItemQtyInput={updateEditQtyFromInput}
        onChangeNote={setEditNote}
        onChangeOptionQty={updateOptionQtyInPopup}
        onClose={closeEditPopup}
        onSave={saveEditedItem}
      />
    </div>
  );
}

export default CartDetail;
