import { create } from "zustand";
import type { CartItem } from "../models/cart.models";
import type { CustomerOption } from "../models/customer.models";

const DEFAULT_COUNTER_MESSAGE = "Mua tại quầy";

const getDraftItemUnitPrice = (item: CartItem) => {
  const optionTotal = item.options.reduce((sum, option) => {
    const optionPrice = option.final_price ?? option.price_snapshot ?? 0;
    return sum + optionPrice * option.quantity;
  }, 0);

  return item.product_cart_price + optionTotal;
};

const recalculateDraftItemTotals = (item: CartItem, quantity: number): CartItem => {
  const nextTotal = getDraftItemUnitPrice(item) * quantity;

  return {
    ...item,
    quantity,
    line_total: nextTotal,
    final_line_total: nextTotal,
  };
};

const isSameDraftConfig = (left: CartItem, right: CartItem) => {
  return (
    left.product_franchise_id === right.product_franchise_id &&
    left.note === right.note &&
    left.options_hash === right.options_hash
  );
};

const mergeDraftItemIntoList = (items: CartItem[], draftItem: CartItem) => {
  const existingItem = items.find((item) => isSameDraftConfig(item, draftItem));

  if (!existingItem) {
    return [...items, draftItem];
  }

  return items.map((item) =>
    isSameDraftConfig(item, draftItem)
      ? recalculateDraftItemTotals(item, item.quantity + draftItem.quantity)
      : item,
  );
};

interface PosSessionState {
  selectedCustomer: CustomerOption | null;
  activeCartId: string | null;
  reviewContactCustomerId: string | null;
  selectedAdminFranchiseId: string | null;
  selectedAdminFranchiseName: string | null;
  selectedCategory: string;
  searchQuery: string;
  customerKeyword: string;
  draftItems: CartItem[];
  draftAddress: string;
  draftPhone: string;
  draftMessage: string;
  voucherCode: string;
  setSelectedCustomer: (customer: CustomerOption | null) => void;
  setActiveCartId: (cartId: string | null) => void;
  setReviewContactCustomerId: (customerId: string | null) => void;
  setSelectedAdminFranchiseId: (franchiseId: string | null) => void;
  setSelectedAdminFranchiseName: (franchiseName: string | null) => void;
  setSelectedCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  setCustomerKeyword: (keyword: string) => void;
  setDraftItems: (items: CartItem[]) => void;
  setDraftAddress: (address: string) => void;
  setDraftPhone: (phone: string) => void;
  setDraftMessage: (message: string) => void;
  setVoucherCode: (voucherCode: string) => void;
  addDraftItem: (item: CartItem) => void;
  replaceDraftItem: (cartItemId: string, item: CartItem) => void;
  incrementDraftItem: (cartItemId: string) => void;
  decrementDraftItem: (cartItemId: string) => void;
  removeDraftItem: (cartItemId: string) => void;
  resetSession: (payload?: { defaultAddress?: string; defaultMessage?: string }) => void;
}

export const usePosSessionStore = create<PosSessionState>((set) => ({
  selectedCustomer: null,
  activeCartId: null,
  reviewContactCustomerId: null,
  selectedAdminFranchiseId: null,
  selectedAdminFranchiseName: null,
  selectedCategory: "all",
  searchQuery: "",
  customerKeyword: "",
  draftItems: [],
  draftAddress: "",
  draftPhone: "",
  draftMessage: DEFAULT_COUNTER_MESSAGE,
  voucherCode: "",
  setSelectedCustomer: (selectedCustomer) =>
    set((state) => ({
      selectedCustomer,
      reviewContactCustomerId:
        state.selectedCustomer?.id === selectedCustomer?.id
          ? state.reviewContactCustomerId
          : null,
    })),
  setActiveCartId: (activeCartId) => set({ activeCartId }),
  setReviewContactCustomerId: (reviewContactCustomerId) => set({ reviewContactCustomerId }),
  setSelectedAdminFranchiseId: (selectedAdminFranchiseId) => set({ selectedAdminFranchiseId }),
  setSelectedAdminFranchiseName: (selectedAdminFranchiseName) => set({ selectedAdminFranchiseName }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setCustomerKeyword: (customerKeyword) => set({ customerKeyword }),
  setDraftItems: (draftItems) => set({ draftItems }),
  setDraftAddress: (draftAddress) => set({ draftAddress }),
  setDraftPhone: (draftPhone) => set({ draftPhone }),
  setDraftMessage: (draftMessage) => set({ draftMessage }),
  setVoucherCode: (voucherCode) => set({ voucherCode }),
  addDraftItem: (draftItem) =>
    set((state) => {
      return {
        draftItems: mergeDraftItemIntoList(state.draftItems, draftItem),
      };
    }),
  replaceDraftItem: (cartItemId, draftItem) =>
    set((state) => ({
      draftItems: mergeDraftItemIntoList(
        state.draftItems.filter((item) => item.cart_item_id !== cartItemId),
        draftItem,
      ),
    })),
  incrementDraftItem: (cartItemId) =>
    set((state) => ({
      draftItems: state.draftItems.map((item) =>
        item.cart_item_id === cartItemId
          ? recalculateDraftItemTotals(item, item.quantity + 1)
          : item,
      ),
    })),
  decrementDraftItem: (cartItemId) =>
    set((state) => {
      const currentItem = state.draftItems.find((item) => item.cart_item_id === cartItemId);

      if (!currentItem) {
        return state;
      }

      if (currentItem.quantity <= 1) {
        return {
          draftItems: state.draftItems.filter((item) => item.cart_item_id !== cartItemId),
        };
      }

      return {
        draftItems: state.draftItems.map((item) =>
          item.cart_item_id === cartItemId
            ? recalculateDraftItemTotals(item, item.quantity - 1)
            : item,
        ),
      };
    }),
  removeDraftItem: (cartItemId) =>
    set((state) => ({
      draftItems: state.draftItems.filter((item) => item.cart_item_id !== cartItemId),
    })),
  resetSession: (payload) =>
    set({
      selectedCustomer: null,
      activeCartId: null,
      reviewContactCustomerId: null,
      selectedCategory: "all",
      searchQuery: "",
      customerKeyword: "",
      draftItems: [],
      draftAddress: payload?.defaultAddress ?? "",
      draftPhone: "",
      draftMessage: payload?.defaultMessage ?? DEFAULT_COUNTER_MESSAGE,
      voucherCode: "",
    }),
}));
