import { useState } from 'react';
import { useCartStore, formatOptionsNote } from '@/stores/cart.store';
import type { CartItem } from '@/stores/cart.store';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Pencil, NotebookPen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTER_URL } from '@/routes/router.const';
import { Confirm } from '../components/Confirm';
import CartItemEditor from '../components/CartItemEditor';

function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();

  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [removeItemConfirm, setRemoveItemConfirm] = useState<{
    show: boolean;
    itemId: string | null;
    productName: string;
  }>({ show: false, itemId: null, productName: '' });

  // Xóa sau khi gắn cart API
  const orderId = "69bb7e9fe1d19ff0cdb25cd1"
  const handleCheckout = () => {
    // TODO: Navigate to checkout page
    navigate(ROUTER_URL.HOME_ROUTER.CHECKOUT, { state: {orderId}});
  };

  const handleClearCart = () => {
    setShowClearAllConfirm(true);
  };

  const handleConfirmClearCart = () => {
    clearCart();
  };

  const handleRemoveItem = (itemId: string, productName: string) => {
    setRemoveItemConfirm({ show: true, itemId, productName });
  };

  const handleConfirmRemoveItem = () => {
    if (removeItemConfirm.itemId) {
      removeItem(removeItemConfirm.itemId);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={80} className="mx-auto text-[var(--cf-secondary)] opacity-30 mb-4" />
          <h2 className="text-2xl font-bold text-[var(--cf-dark)] mb-2">
            Giỏ hàng trống
          </h2>
          <p className="text-[var(--cf-primary)]/60 mb-6">
            Bạn chưa có sản phẩm nào trong giỏ hàng
          </p>
          <button
            onClick={() => navigate(ROUTER_URL.MENU)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--cf-secondary)] text-white font-semibold rounded-lg hover:bg-[var(--cf-dark)] transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--cf-bg)] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--cf-dark)]">Giỏ hàng của bạn</h1>
            <p className="text-[var(--cf-primary)]/60 mt-1">
              Bạn có {items.length} sản phẩm trong giỏ hàng
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={16} />
            Xóa tất cả
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 flex gap-4 hover:shadow-lg transition-shadow"
              >
                {/* Product Image */}
                <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ShoppingBag size={32} />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--cf-dark)] text-lg mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-[var(--cf-primary)]/60 mb-1">
                    SKU: {item.SKU}
                  </p>
                  <p className="text-sm text-[var(--cf-primary)]/70 mb-3">
                    {formatOptionsNote(item)}
                  </p>
                  {item.options?.note && (
                    <div className="flex items-center gap-1.5 text-sm text-[var(--cf-secondary)] bg-[var(--cf-bg)] rounded-lg px-3 py-1.5 mb-3 italic">
                      <NotebookPen size={13} className="text-[var(--cf-primary)] flex-shrink-0" />
                      <span><span className="font-semibold not-italic text-[var(--cf-dark)]">Ghi chú:</span> {item.options.note}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={999}
                        value={item.quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 1 && val <= 999) {
                            updateQuantity(item.id, val);
                          }
                        }}
                        className="font-semibold text-[var(--cf-dark)] w-12 text-center border border-gray-200 rounded-md py-1 focus:outline-none focus:border-[var(--cf-secondary)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, Math.min(999, item.quantity + 1))}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <div className="font-bold text-[var(--cf-secondary)] text-lg">
                        {((item.price + (item.extras_total ?? 0)) * item.quantity).toLocaleString('vi-VN')} ₫
                      </div>
                      <div className="text-sm text-[var(--cf-primary)]/60">
                        {(item.price + (item.extras_total ?? 0)).toLocaleString('vi-VN')} ₫ × {item.quantity}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-[var(--cf-primary)] hover:text-[var(--cf-secondary)] p-2 transition-colors cursor-pointer"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleRemoveItem(item.id, item.name)}
                    className="text-red-500 hover:text-red-600 p-2 transition-colors cursor-pointer"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-[var(--cf-dark)] mb-4">
                Tổng đơn hàng
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-[var(--cf-primary)]">
                  <span>Tạm tính</span>
                  <span className="font-semibold">
                    {getTotalPrice().toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <div className="flex justify-between text-[var(--cf-primary)]">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">Miễn phí</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-[var(--cf-dark)]">Tổng cộng</span>
                  <span className="font-bold text-[var(--cf-secondary)] text-xl">
                    {getTotalPrice().toLocaleString('vi-VN')} ₫
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-[var(--cf-accent-light)] to-[var(--cf-secondary)] text-[var(--cf-dark)] font-bold rounded-lg hover:from-[var(--cf-secondary)] hover:to-[var(--cf-dark)] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
              >
                Tiến hành thanh toán
              </button>

              <button
                onClick={() => navigate(ROUTER_URL.MENU)}
                className="w-full mt-3 py-3 border-2 border-[var(--cf-secondary)] text-[var(--cf-secondary)] font-semibold rounded-lg hover:bg-[var(--cf-secondary)] hover:text-white transition-colors cursor-pointer"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Clear All Dialog */}
      <Confirm
        isOpen={showClearAllConfirm}
        onClose={() => setShowClearAllConfirm(false)}
        onConfirm={handleConfirmClearCart}
        title="Xóa tất cả sản phẩm"
        message="Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng? Hành động này không thể hoàn tác."
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        type="danger"
      />

      {/* Confirm Remove Item Dialog */}
      <Confirm
        isOpen={removeItemConfirm.show}
        onClose={() => setRemoveItemConfirm({ show: false, itemId: null, productName: '' })}
        onConfirm={handleConfirmRemoveItem}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa "${removeItemConfirm.productName}" khỏi giỏ hàng?`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Edit Cart Item Modal */}
      {editingItem && (
        <CartItemEditor
          item={editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}

export default Cart;