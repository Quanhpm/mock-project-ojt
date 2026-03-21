import { create } from "zustand";

// ======================== State Interface ========================

interface LoadingState {
  // Dùng counter thay vì boolean để xử lý nhiều API call đồng thời
  // Ví dụ: 3 request cùng lúc → counter = 3, khi tất cả xong → counter = 0 → ẩn
  activeRequests: number;
  isLoading: boolean;

  increment: () => void;
  decrement: () => void;
}

// ======================== Store ========================

export const useLoadingStore = create<LoadingState>((set) => ({
  activeRequests: 0,
  isLoading: false,

  increment: () =>
    set((state) => ({
      activeRequests: state.activeRequests + 1,
      isLoading: true,
    })),

  decrement: () =>
    set((state) => {
      const next = Math.max(0, state.activeRequests - 1);
      return {
        activeRequests: next,
        isLoading: next > 0,
      };
    }),
}));
