import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemOptions } from '../types/product-option.type';

// ── Helpers ──────────────────────────────────────────────

const generateId = (): string =>
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

/** Deep-clone an ItemOptions object so every cart item owns its own snapshot. */
const cloneOptions = (opt?: ItemOptions): ItemOptions | undefined => {
  if (!opt) return undefined;
  return {
    size: opt.size ? { ...opt.size } : undefined,
    sugar: { ...opt.sugar },
    ice: { ...opt.ice },
    toppings: opt.toppings.map(t => ({ ...t })),
    note: opt.note,
  };
};

/**
 * Deterministic configuration key used to detect duplicate configs.
 * Two items with the same productId + configKey are considered identical.
 */
const configKey = (opt?: ItemOptions): string => {
  if (!opt) return 'no_opt';
  const size = opt.size?.code ?? 'NO_SIZE';
  const sugar = opt.sugar.value;
  const ice = opt.ice.value;
  const toppings = (opt.toppings ?? []).map(t => t.code).sort().join(',');
  const note = (opt.note ?? '').trim();
  return `s:${size}|sg:${sugar}|ic:${ice}|tp:[${toppings}]|n:${note}`;
};

/** Compare two ItemOptions by value (not reference). */
export const isSameConfiguration = (a?: ItemOptions, b?: ItemOptions): boolean =>
  configKey(a) === configKey(b);

// ── Types ────────────────────────────────────────────────

export interface CartItem {
  /** Unique UUID for every cart line — never shared between items. */
  id: string;
  productId: string;
  franchiseId?: string;
  name: string;
  /** Base price (snapshot at time of add). */
  price: number;
  quantity: number;
  image_url: string;
  SKU?: string;
  options?: ItemOptions;
  /** Pre-computed extras (size bonus + toppings). */
  extras_total?: number;
}

export type CartItemInput = Omit<CartItem, 'id' | 'quantity'>;

interface CartState {
  items: CartItem[];
  addItem: (product: CartItemInput, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCartItem: (
    id: string,
    data: Pick<CartItem, 'options' | 'extras_total' | 'quantity'> & { price?: number },
  ) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// ── Format helper (UI) ──────────────────────────────────

export const formatOptionsNote = (item: CartItem) => {
  const opt = item.options;
  if (!opt) return 'size: S || sugar: 0% || ice: 0%';

  const sizeText = opt.size?.code ? `size ${opt.size.code}` : '';
  const sugarText = `sugar: ${opt.sugar.label}`;
  const iceText = `ice: ${opt.ice.label}`;
  const toppingText =
    opt.toppings?.length
      ? `topping: ${opt.toppings.map(t => t.code).join(', ')}`
      : '';
  return [sizeText, sugarText, iceText, toppingText].filter(Boolean).join(' || ');
};

// ── Store ────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      /**
       * Add a product to the cart.
       * If an item with the same productId AND identical configuration already
       * exists, its quantity is merged. Otherwise, a brand-new line is created
       * with a fresh UUID and deep-cloned options.
       */
      addItem: (product, quantity = 1) => {
        const items = get().items;
        const qty = Math.max(1, Math.floor(quantity));
        const newKey = configKey(product.options);

        const existing = items.find(
          item => item.productId === product.productId && configKey(item.options) === newKey,
        );

        if (existing) {
          set({
            items: items.map(item =>
              item.id === existing.id
                ? { ...item, quantity: item.quantity + qty }
                : item,
            ),
          });
        } else {
          const newItem: CartItem = {
            ...product,
            id: generateId(),
            quantity: qty,
            options: cloneOptions(product.options),
          };
          set({ items: [...items, newItem] });
        }
      },

      /** Remove a single cart line by its unique id. */
      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) });
      },

      /** Set absolute quantity for a cart line. Removes it when ≤ 0. */
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, quantity } : item,
          ),
        });
      },

      /**
       * Update a cart item's configuration (size / sugar / ice / toppings / note).
       *
       * Split / merge logic:
       *  - Config UNCHANGED  → update in-place (quantity / note only).
       *  - Config CHANGED:
       *      • Remove the original item.
       *      • If another line for the same product with the NEW config already
       *        exists  → merge quantity into it.
       *      • Otherwise      → insert a brand-new line with a fresh UUID.
       */
      updateCartItem: (id, data) => {
        const items = get().items;
        const target = items.find(item => item.id === id);
        if (!target) return;

        const oldKey = configKey(target.options);
        const newKey = configKey(data.options);

        // ── Config unchanged: simple in-place update ──
        if (oldKey === newKey) {
          set({
            items: items.map(item =>
              item.id === id
                ? {
                    ...item,
                    ...(data.price !== undefined ? { price: data.price } : {}),
                    options: cloneOptions(data.options),
                    extras_total: data.extras_total,
                    quantity: data.quantity,
                  }
                : item,
            ),
          });
          return;
        }

        // ── Config changed: reduce original quantity by the edited qty ──
        const remainingQty = target.quantity - data.quantity;

        // Remove original line or reduce its quantity
        const withoutOld =
          remainingQty <= 0
            ? items.filter(item => item.id !== id)
            : items.map(item =>
                item.id === id ? { ...item, quantity: remainingQty } : item,
              );

        // Check if a line with the new config already exists
        const mergeTarget = withoutOld.find(
          item =>
            item.productId === target.productId && configKey(item.options) === newKey,
        );

        if (mergeTarget) {
          // Merge into existing line
          set({
            items: withoutOld.map(item =>
              item.id === mergeTarget.id
                ? { ...item, quantity: item.quantity + data.quantity }
                : item,
            ),
          });
        } else {
          // Create a new separate line with a fresh UUID
          const newItem: CartItem = {
            ...target,
            id: generateId(),
            ...(data.price !== undefined ? { price: data.price } : {}),
            options: cloneOptions(data.options),
            extras_total: data.extras_total,
            quantity: data.quantity,
          };
          set({ items: [...withoutOld, newItem] });
        }
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () =>
        get().items.reduce((total, item) => total + item.quantity, 0),

      getTotalPrice: () =>
        get().items.reduce((total, item) => {
          const extras = item.extras_total ?? 0;
          return total + item.quantity * (item.price + extras);
        }, 0),
    }),
    { name: 'cart-storage' },
  ),
);
