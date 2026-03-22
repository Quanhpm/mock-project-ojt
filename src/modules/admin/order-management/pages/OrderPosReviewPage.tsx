import { 
  ArrowLeft, 
  Loader2, 
  Minus, 
  Plus, 
  Store, 
  Trash2, 
  Truck, 
  MapPin, 
  Clock, 
  TicketPercent, 
  CreditCard, 
  ShoppingCart 
} from "lucide-react";
import { useOrderPosReviewPage } from "../hooks/use-order-pos-review-page";
import { PosProductConfigModal } from "../partials/pos/PosProductConfigModal";

const currency = new Intl.NumberFormat("vi-VN");

export const OrderPosReviewPage = () => {
  const {
    cart,
    resolvedCustomer,
    displayItems,
    draftAddress,
    draftPhone,
    draftMessage,
    voucherCode,
    isLoadingCart,
    isMutatingCart,
    canCheckout,
    canApplyVoucher,
    isProductConfiguratorOpen,
    productBeingConfigured,
    configuredSize,
    configuredQuantity,
    configuredNote,
    supportsToppings,
    toppingGroups,
    selectedToppings,
    configuredTotalPrice,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    setVoucherCode,
    editCartItem,
    closeProductConfigurator,
    saveEditedCartItem,
    setConfiguredSize,
    setConfiguredNote,
    increaseConfiguredQuantity,
    decreaseConfiguredQuantity,
    increaseConfiguredToppingQuantity,
    decreaseConfiguredToppingQuantity,
    applyVoucher,
    removeVoucher,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
    checkoutCart,
    goBackToBuilder,
  } = useOrderPosReviewPage();

  if (isLoadingCart) {
    return null;
  }

  if (!cart) {
    return (
      <main className="flex bg-[#f9f9f9] h-[calc(100vh-48px)] flex-col items-center justify-center p-8 w-full rounded-2xl border border-gray-200 shadow-sm">
        <p className="text-xl font-bold text-gray-900 mb-4">Không tìm thấy đơn hàng để kiểm tra</p>
        <button
          onClick={goBackToBuilder}
          className="flex items-center gap-2 px-6 py-3 bg-amber-800 text-white rounded-xl font-bold hover:bg-amber-900 transition"
        >
          <ArrowLeft size={20} />
          Quay lại chọn món
        </button>
      </main>
    );
  }

  const customerName = resolvedCustomer?.name || cart.customer_name || 'Khách vãng lai';

  return (
    <div className="h-[calc(100vh-48px)] overflow-y-auto bg-[#f9f9f9] rounded-2xl border border-gray-200 shadow-sm relative">
      <main className="pt-6 pb-28 lg:pb-8 px-4 lg:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 font-sans text-gray-900">
        {/* Left Column: Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Section */}
          <header>
            <button 
              onClick={goBackToBuilder}
              className="flex items-center gap-2 text-amber-800 mb-4 hover:underline text-sm font-semibold w-fit"
            >
              <ArrowLeft size={16} /> Quay lại chọn món
            </button>
            <p className="text-amber-800 font-semibold tracking-wider text-sm uppercase mb-2">
              Bước 2 / Kiểm tra đơn hàng
            </p>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Xác nhận đơn hàng</h1>
          </header>

          {/* Cart Details & Branch Info */}
          <section className="bg-white rounded-xl p-6 space-y-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-800 shrink-0">
                  <Store size={24} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Chi nhánh</p>
                  <h3 className="font-bold text-lg">{cart.franchise_name || cart.franchise_id || "Boutique Brews HCM"}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-bold uppercase tracking-tighter">Đang hoạt động</span>
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-8 py-4">
              {displayItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có món nào được chọn</p>
              ) : displayItems.map((item) => (
                <div
                  key={item.cart_item_id}
                  onClick={() => editCartItem(item)}
                  className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-transparent p-3 transition hover:border-amber-200 hover:bg-amber-50/40 sm:flex-row sm:gap-6"
                >
                  <div className="relative w-full sm:w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center ring-1 ring-black/5">
                    {item.product?.image_url || item.product_image_url ? (
                      <img
                        src={item.product?.image_url || item.product_image_url}
                        alt={item.product?.name || item.product_name || "Sản phẩm"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="text-gray-300" size={32} />
                    )}
                  </div>
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 pr-2">
                        <h4 className="text-lg font-bold text-gray-900 line-clamp-2">
                          {item.product?.name || item.product_name || item.product_franchise_id}
                        </h4>
                        {item.selected_size_label && (
                          <p className="text-sm font-medium text-amber-800 mt-0.5">Size {item.selected_size_label}</p>
                        )}
                        {item.options && item.options.length > 0 && (
                          <p className="text-sm text-gray-500 mt-0.5">
                            + {item.options.map((t) => `${t.product?.name || t.product_name} (x${t.quantity})`).join(', ')}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-sm text-gray-500 italic mt-0.5">"{item.note}"</p>
                        )}
                      </div>
                      <span className="font-bold text-lg whitespace-nowrap text-gray-900 text-right">
                        {currency.format(item.final_line_total)}đ
                      </span>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 bg-gray-50 p-1 rounded-full ring-1 ring-black/5">
                        <button 
                          onClick={(event) => {
                            event.stopPropagation();
                            void decreaseCartItemQuantity(item);
                          }}
                          disabled={isMutatingCart}
                          className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm ring-1 ring-black/5 disabled:opacity-50 text-gray-600"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                        <button 
                          onClick={(event) => {
                            event.stopPropagation();
                            void addOneMoreOfCartItem(item);
                          }}
                          disabled={isMutatingCart}
                          className="w-8 h-8 rounded-full bg-amber-800 text-white flex items-center justify-center hover:bg-amber-900 transition-colors shadow-sm disabled:opacity-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={(event) => {
                          event.stopPropagation();
                          void removeCartItem(item.cart_item_id);
                        }}
                        disabled={isMutatingCart}
                        className="text-gray-400 hover:text-red-600 flex items-center gap-1.5 text-sm font-bold transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={16} /> Xóa
                      </button>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Nhấn vào món để chỉnh topping, ghi chú hoặc đổi size
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notes Section */}
            <div className="pt-6 border-t border-gray-100">
              <label className="block text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">
                GHI CHÚ TRƯỚC KHI THANH TOÁN
              </label>
              <textarea 
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                disabled={isMutatingCart}
                className="w-full bg-transparent border-0 border-b-2 border-gray-200 focus:border-amber-800 focus:ring-0 px-0 py-4 text-gray-900 placeholder:text-gray-400 transition-all min-h-[100px] resize-none disabled:opacity-50" 
                placeholder="Thêm ghi chú tổng cho cửa hàng (Ví dụ: Mang về, nhiều đá...)"
              />
            </div>
          </section>

          {/* Delivery Info */}
          <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <Truck className="text-amber-800" size={24} />
              <h3 className="font-bold text-xl">Thông tin giao hàng</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 flex gap-4 ring-1 ring-black/5">
                <MapPin className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">Địa chỉ nhận hàng</p>
                  <input 
                    type="text"
                    value={draftAddress}
                    onChange={(e) => setDraftAddress(e.target.value)}
                    disabled={isMutatingCart}
                    placeholder="Nhập địa chỉ..."
                    className="mt-1 w-full bg-transparent border-none p-0 text-sm text-gray-600 focus:ring-0 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 flex gap-4 ring-1 ring-black/5">
                <Clock className="text-gray-400 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900">Thời gian phục vụ</p>
                  <p className="mt-1 text-sm text-gray-600">Sớm nhất có thể (10 - 20 phút)</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar (Order Summary) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-6 h-fit space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-2xl shadow-black/5 border border-gray-100 text-sm leading-relaxed">
            {/* Summary Header */}
            <div className="mb-8 border-b border-gray-100 pb-6 w-full">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">TÓM TẮT ĐƠN HÀNG</h2>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold tracking-wider">
                  #{cart._id.slice(-6).toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400">Bước 2: Kiểm tra đơn hàng</p>
            </div>

            {/* Customer Info */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Khách hàng</span>
                <span className="font-bold text-gray-900 truncate max-w-[150px] text-right" title={customerName}>
                  {customerName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số điện thoại</span>
                <span className="font-medium text-gray-900">
                  <input
                    type="tel"
                    value={draftPhone}
                    onChange={(e) => setDraftPhone(e.target.value)}
                    disabled={isMutatingCart}
                    className="bg-transparent border-none p-0 focus:ring-0 text-right font-medium text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                    placeholder="Nhập SĐT..."
                  />
                </span>
              </div>
            </div>

            {/* Voucher Input */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
                VOUCHER / MÃ GIẢM GIÁ
              </label>
              
              {cart.voucher_code ? (
                <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <TicketPercent size={18} />
                    <span>{cart.voucher_code}</span>
                  </div>
                  {removeVoucher ? (
                    <button 
                      onClick={() => { void removeVoucher(); }}
                      disabled={isMutatingCart}
                      className="text-xs font-bold text-red-600 hover:text-red-700 disabled:opacity-50 transition"
                    >
                      Bỏ mã
                    </button>
                  ) : null}
                </div>
              ) : (
                <div className="flex gap-2">
                  <input 
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    disabled={isMutatingCart}
                    className="flex-grow bg-gray-50 ring-1 ring-black/5 border-0 focus:bg-white focus:ring-2 focus:ring-amber-800 rounded-xl text-sm px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none disabled:opacity-50 transition" 
                    placeholder="Nhập mã giảm giá" 
                    type="text"
                  />
                  <button 
                    onClick={() => { void applyVoucher(); }}
                    disabled={!canApplyVoucher || isMutatingCart}
                    className="bg-amber-800 px-4 py-2 rounded-xl font-bold text-white hover:bg-amber-900 transition-colors disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-400 shrink-0"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
              <div className="flex justify-between text-gray-500">
                <span>Tạm tính</span>
                <span className="font-semibold text-gray-900">{currency.format(cart.subtotal_amount)}đ</span>
              </div>
              
              {!!cart.promotion_discount && cart.promotion_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Khuyến mãi</span>
                  <span className="font-semibold">-{currency.format(cart.promotion_discount)}đ</span>
                </div>
              )}

              {!!cart.voucher_discount && cart.voucher_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Mã giảm giá</span>
                  <span className="font-semibold">-{currency.format(cart.voucher_discount)}đ</span>
                </div>
              )}

              <div className="flex justify-between text-gray-500">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-gray-900">0đ</span>
              </div>

              <div className="flex justify-between items-end pt-4 mt-4 border-t border-gray-100 border-dashed">
                <span className="text-lg font-bold text-gray-900 uppercase tracking-tight">TỔNG CỘNG</span>
                <div className="text-right">
                  <span className="block text-3xl font-black text-amber-800">
                    {currency.format(cart.final_amount)}<span className="text-xl inline-block mt-0.5">đ</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button 
              onClick={() => { void checkoutCart(); }}
              disabled={!canCheckout || isMutatingCart}
              className="w-full mt-8 bg-amber-800 text-white font-bold py-5 rounded-2xl shadow-xl shadow-amber-800/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:bg-amber-900"
            >
              {isMutatingCart ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <CreditCard size={20} />
              )}
              <span className="uppercase tracking-wider">
                {isMutatingCart ? "Đang xử lý..." : "Xác nhận thanh toán"}
              </span>
            </button>
            <p className="text-center mt-6 text-xs text-gray-400 px-4">
              Bật tính năng thông báo sau khi xác nhận đơn hàng tại quầy!
            </p>
          </div>
        </aside>
      </main>

      {/* Mobile Navigation Shell */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md px-6 py-4 flex justify-around items-center border-t border-gray-200 z-50">
        <button 
          onClick={goBackToBuilder}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-amber-800 transition w-20"
        >
          <ShoppingCart size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center">Giỏ hàng</span>
        </button>
        <div className="flex flex-col items-center gap-1 text-amber-800 w-20">
          <Store size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center">Chi tiết</span>
        </div>
        <button 
          onClick={() => { void checkoutCart(); }}
          disabled={!canCheckout || isMutatingCart}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-amber-800 transition disabled:opacity-50 w-20"
        >
          <CreditCard size={20} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center">Checkout</span>
        </button>
      </div>

      <PosProductConfigModal
        open={isProductConfiguratorOpen}
        product={productBeingConfigured}
        selectedSize={configuredSize}
        quantity={configuredQuantity}
        note={configuredNote}
        totalPrice={configuredTotalPrice}
        supportsToppings={supportsToppings}
        toppingGroups={toppingGroups}
        selectedToppings={selectedToppings}
        isSubmitting={isMutatingCart}
        confirmLabel="Cập nhật món"
        onClose={closeProductConfigurator}
        onConfirm={() => {
          void saveEditedCartItem();
        }}
        onSelectSize={setConfiguredSize}
        onNoteChange={setConfiguredNote}
        onIncreaseQuantity={increaseConfiguredQuantity}
        onDecreaseQuantity={decreaseConfiguredQuantity}
        onIncreaseTopping={increaseConfiguredToppingQuantity}
        onDecreaseTopping={decreaseConfiguredToppingQuantity}
      />
    </div>
  );
};

export default OrderPosReviewPage;
