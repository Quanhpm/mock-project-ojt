import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { CartItem } from '@/stores/cart.store';
import { useCartStore } from '@/stores/cart.store';
import { getAllFranchises } from '@/apis/endpointsCLIENT/client.api';
import {
  getProductDetail as getProductDetailByFranchise,
  type ProductSize,
} from '@/apis/endpointsCLIENT/productDetail.api';

interface CartItemEditorProps {
  item: CartItem;
  onClose: () => void;
}

function CartItemEditor({ item, onClose }: CartItemEditorProps) {
  const updateCartItem = useCartStore((s) => s.updateCartItem);

  const [sizes, setSizes] = useState<ProductSize[]>([]);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [productLoading, setProductLoading] = useState(true);

  useEffect(() => {
    setProductLoading(true);

    const loadSizes = async () => {
      try {
        let franchiseId = item.franchiseId;
        if (!franchiseId) {
          const franchises = await getAllFranchises();
          franchiseId = franchises?.[0]?.id ?? '';
        }
        if (!franchiseId) return;
        const data = await getProductDetailByFranchise(franchiseId, item.productId);
        if (data?.sizes?.length) {
          setSizes(data.sizes);
          const match = data.sizes.find(s => s.size === item.options?.size?.code);
          setSelectedSize(match ?? data.sizes[0]);
        }
      } catch {
        // silently fail
      } finally {
        setProductLoading(false);
      }
    };

    loadSizes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.productId]);

  const [note, setNote] = useState(item.options?.note ?? '');
  const [qty, setQty] = useState(item.quantity);

  const totalPrice = useMemo(() => {
    const basePrice = selectedSize?.price ?? item.price;
    return basePrice * qty;
  }, [selectedSize, item.price, qty]);

  const handleUpdate = () => {
    const sizeCode = selectedSize?.size ?? item.options?.size?.code ?? 'S';
    updateCartItem(item.id, {
      price: selectedSize?.price ?? item.price,
      options: {
        size: { code: sizeCode as 'S' | 'M' | 'L', label: `Size ${sizeCode}`, bonusPrice: 0 },
        sugar: { value: 100, label: '100%' },
        ice: { value: 100, label: '100%' },
        toppings: [],
        note: note.trim() || undefined,
      },
      extras_total: 0,
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
              Size
            </h3>
            <div className="flex flex-wrap gap-3">
              {productLoading && (
                <span className="text-sm text-[var(--cf-primary)]/60">Đang tải...</span>
              )}
              {!productLoading && sizes.map((s) => {
                const active = selectedSize?.product_franchise_id === s.product_franchise_id;
                return (
                  <button
                    key={s.product_franchise_id}
                    onClick={() => setSelectedSize(s)}
                    disabled={!s.is_available}
                    className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                      active
                        ? 'bg-[var(--cf-primary)] text-white shadow-md'
                        : 'bg-white border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-gray-50'
                    }`}
                  >
                    {s.size} — {s.price.toLocaleString()}đ
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
