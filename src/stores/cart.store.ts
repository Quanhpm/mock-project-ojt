import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemOptions } from '../types/product-option.type';


export interface CartItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  SKU: string;

  options?: ItemOptions;
  extras_total?: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const optionsKey = (opt?: ItemOptions) => {
  if (!opt) return "no_opt";
  const toppingCodes = (opt.toppings ?? []).map(t => t.code).sort().join(",");
  const sizeCode = opt.size?.code ?? "NO_SIZE";
  return `z${sizeCode}-s${opt.sugar}-i${opt.ice}-t[${toppingCodes}]-n:${(opt.note ?? "").trim()}`;
};

export   // option note
  const formatOptionsNote = (item: any) => {
    const opt = item.options;
    if (!opt) return "size: s || sugar: 0% || ice: 0%";

    const sizeText = opt.size?.code ? `size ${String(opt.size.code)}` : "";
    const sugarText = `sugar: ${opt.sugar.label}`;
    const iceText = `ice: ${opt.ice.label}`;
    const toppingText =
      opt.toppings?.length ? `topping: ${opt.toppings.map((t: any) => t.code).join(", ")}` : "";
    return [sizeText, sugarText, iceText, toppingText].filter(Boolean).join(" || ");
  };

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(
          item => item.productId === product.productId &&
            optionsKey(item.options) === optionsKey(product.options)
        );


        const qty = Math.max(1, Math.floor(quantity));

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + qty }
                : item
            )
          });
        }
        else {
          set({
            items: [...items, { ...product, quantity: qty }]
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.productId !== productId)
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.productId === productId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const extras = item.extras_total ?? 0;
          return total + (item.quantity * (item.price + extras));
        }, 0);
      }

    }),
    {
      name: 'cart-storage',
    }
  )
);
