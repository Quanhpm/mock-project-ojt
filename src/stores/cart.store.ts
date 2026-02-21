import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Topping
export type SugarLevel = 0 | 30 | 50 | 70 | 100;
export type IceLevel = 0 | 30 | 50 | 70 | 100;
export type SizeCode = "S" | "M" | "L";

export type Size = {
  code: SizeCode;     // "S", "M", "L"
  label: string;     // "Size S", "Size M", "Size L"
  bonusPrice: number;    // giá topping (snapshot)
};

export type Topping = {
  code: string;     // "PEARL", "PUDDING"
  name: string;     // "Trân châu", "Pudding"
  price: number;    // giá topping (snapshot)
};

export type ItemOptions = {
  size?: Size;
  sugar: SugarLevel;
  ice: IceLevel;
  toppings: Topping[];
  note?: string;
};


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
