import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import type { CartItem } from '@/stores/cart.store';
import { useCartStore } from '@/stores/cart.store';
import type { Topping, SugarOption, IceOption, Size } from '@/types/product-option.type';
import {
  SIZE_OPTIONS,
  TOPPINGS,
  SUGAR_LEVELS,
  ICE_LEVELS,
} from '@/types/product-option.type';

interface CartItemEditorProps {
  item: CartItem;
  onClose: () => void;
}

function CartItemEditor({ item, onClose }: CartItemEditorProps) {
  const updateCartItem = useCartStore((s) => s.updateCartItem);

  const [size, setSize] = useState<Size>(
    item.options?.size ?? SIZE_OPTIONS[0]
  );
  const [sugar, setSugar] = useState<SugarOption>(
    item.options?.sugar ?? SUGAR_LEVELS[0]
  );
  const [ice, setIce] = useState<IceOption>(
    item.options?.ice ?? ICE_LEVELS[0]
  );
  const [toppings, setToppings] = useState<Topping[]>(
    item.options?.toppings ?? []
  );
  const [note, setNote] = useState(item.options?.note ?? '');
  const [qty, setQty] = useState(item.quantity);

  const { extrasTotal, totalPrice } = useMemo(() => {
    const sizeExtra = size?.bonusPrice ?? 0;
    const toppingExtra = toppings.reduce((sum, t) => sum + t.price, 0);
    const extrasTotal = sizeExtra + toppingExtra;
    const totalPrice = (item.price + extrasTotal) * qty;
    return { extrasTotal, totalPrice };
  }, [item.price, size, toppings, qty]);

  const toggleTopping = (t: Topping) => {
    setToppings((prev) =>
      prev.some((x) => x.code === t.code)
        ? prev.filter((x) => x.code !== t.code)
        : [...prev, t]
    );
  };

  const handleUpdate = () => {
    updateCartItem(item.id, {
      options: { size, sugar, ice, toppings, note: note.trim() || undefined },
      extras_total: extrasTotal,
      quantity: qty,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--cf-dark)]">
                Chỉnh sửa
              </h2>
              <p className="text-sm text-[var(--cf-primary)]/60">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Size */}
          <section className="space-y-3">
            <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
              Kích thước
            </h3>
            <div className="flex flex-wrap gap-3">
              {SIZE_OPTIONS.map((s) => {
                const active = size.code === s.code;
                return (
                  <button
                    key={s.code}
                    onClick={() => setSize(s)}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--cf-primary)] text-white shadow-md'
                        : 'bg-white border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-gray-50'
                    }`}
                  >
                    {s.label}{' '}
                    {s.bonusPrice > 0 ? `+${s.bonusPrice / 1000}k` : ''}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Sugar & Ice */}
          <div className="grid grid-cols-2 gap-6">
            <section className="space-y-3">
              <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                Mức đường
              </h3>
              <div className="flex flex-wrap gap-2">
                {SUGAR_LEVELS.map((s) => {
                  const active = sugar.value === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => setSugar(s)}
                      className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-[var(--cf-primary)] text-white shadow-md'
                          : 'bg-white text-[var(--cf-primary)] border border-[var(--cf-primary)] hover:bg-gray-50'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                Mức đá
              </h3>
              <div className="flex flex-wrap gap-2">
                {ICE_LEVELS.map((i) => {
                  const active = ice.value === i.value;
                  return (
                    <button
                      key={i.value}
                      onClick={() => setIce(i)}
                      className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-[var(--cf-primary)] text-white shadow-md'
                          : 'bg-white text-[var(--cf-primary)] border border-[var(--cf-primary)] hover:bg-gray-50'
                      }`}
                    >
                      {i.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Toppings */}
          <section className="space-y-3">
            <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
              Toppings
            </h3>
            <div className="flex flex-wrap gap-3">
              {TOPPINGS.map((t) => {
                const active = toppings.some((x) => x.code === t.code);
                return (
                  <button
                    key={t.code}
                    onClick={() => toggleTopping(t)}
                    className={`px-5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      active
                        ? 'border-[var(--cf-primary)] bg-[var(--cf-primary)] text-white font-bold shadow-sm'
                        : 'border-[var(--cf-primary)] bg-white text-[var(--cf-primary)] font-medium hover:bg-gray-50'
                    }`}
                  >
                    {t.name}{' '}
                    <span className="text-xs opacity-70">+{t.price / 1000}k</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Note */}
          <section className="space-y-3">
            <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
              Ghi chú
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú cho món này..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[var(--cf-primary)] focus:ring-1 focus:ring-[var(--cf-primary)] outline-none transition-all resize-none text-sm"
            />
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            {/* Quantity */}
            <div className="flex items-center bg-gray-50 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-lg cursor-pointer"
              >
                −
              </button>
              <span className="px-5 font-bold text-[var(--cf-primary)]">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-lg cursor-pointer"
              >
                +
              </button>
            </div>

            {/* Total */}
            <div className="text-right">
              <p className="text-xs text-[var(--cf-primary)]/60 uppercase tracking-wider">
                Tổng cộng
              </p>
              <p className="text-2xl font-black text-[var(--cf-primary)]">
                {totalPrice.toLocaleString('vi-VN')}đ
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleUpdate}
              className="flex-2 py-3 bg-[var(--cf-primary)] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-md cursor-pointer"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItemEditor;
