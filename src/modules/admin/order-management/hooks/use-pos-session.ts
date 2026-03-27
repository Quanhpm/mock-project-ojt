import { usePosSessionStore } from "../stores/pos-session.store";

export const usePosSession = () => {
  const sessionFranchiseId = usePosSessionStore((state) => state.sessionFranchiseId);
  const selectedCustomer = usePosSessionStore((state) => state.selectedCustomer);
  const activeCartId = usePosSessionStore((state) => state.activeCartId);
  const selectedCategory = usePosSessionStore((state) => state.selectedCategory);
  const searchQuery = usePosSessionStore((state) => state.searchQuery);
  const customerKeyword = usePosSessionStore((state) => state.customerKeyword);
  const setSessionFranchiseId = usePosSessionStore((state) => state.setSessionFranchiseId);
  const setSelectedCustomer = usePosSessionStore((state) => state.setSelectedCustomer);
  const setActiveCartId = usePosSessionStore((state) => state.setActiveCartId);
  const setSelectedCategory = usePosSessionStore((state) => state.setSelectedCategory);
  const setSearchQuery = usePosSessionStore((state) => state.setSearchQuery);
  const setCustomerKeyword = usePosSessionStore((state) => state.setCustomerKeyword);
  const resetSession = usePosSessionStore((state) => state.resetSession);

  return {
    sessionFranchiseId,
    selectedCustomer,
    activeCartId,
    selectedCategory,
    searchQuery,
    customerKeyword,
    setSessionFranchiseId,
    setSelectedCustomer,
    setActiveCartId,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
    resetSession,
  };
};
