import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OrderListUiState {
  selectedOrderId: string | null;
  isMobileDetailOpen: boolean;
  isDetailFocused: boolean;
  setSelectedOrderId: (orderId: string | null) => void;
  setIsMobileDetailOpen: (isOpen: boolean) => void;
  setIsDetailFocused: (isFocused: boolean) => void;
  openOrderDetail: (orderId: string) => void;
  closeMobileDetail: () => void;
  resetOrderListUi: () => void;
}

const createDefaultState = () => ({
  selectedOrderId: null,
  isMobileDetailOpen: false,
  isDetailFocused: false,
});

export const useOrderListUiStore = create<OrderListUiState>()(
  persist(
    (set) => ({
      ...createDefaultState(),
      setSelectedOrderId: (selectedOrderId) => set({ selectedOrderId }),
      setIsMobileDetailOpen: (isMobileDetailOpen) => set({ isMobileDetailOpen }),
      setIsDetailFocused: (isDetailFocused) => set({ isDetailFocused }),
      openOrderDetail: (selectedOrderId) =>
        set({
          selectedOrderId,
          isMobileDetailOpen: true,
          isDetailFocused: true,
        }),
      closeMobileDetail: () => set({ isMobileDetailOpen: false }),
      resetOrderListUi: () =>
        set({
          ...createDefaultState(),
        }),
    }),
    {
      name: "admin-order-list-ui",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        selectedOrderId: state.selectedOrderId,
        isMobileDetailOpen: state.isMobileDetailOpen,
        isDetailFocused: state.isDetailFocused,
      }),
    },
  ),
);

export const resetOrderListUi = () => {
  useOrderListUiStore.getState().resetOrderListUi();
};
