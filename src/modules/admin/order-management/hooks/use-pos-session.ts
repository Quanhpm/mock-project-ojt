import { usePosSessionStore } from "../stores/pos-session.store";

export const usePosSession = () => {
  const selectedCustomer = usePosSessionStore((state) => state.selectedCustomer);
  const activeCartId = usePosSessionStore((state) => state.activeCartId);
  const selectedCategory = usePosSessionStore((state) => state.selectedCategory);
  const searchQuery = usePosSessionStore((state) => state.searchQuery);
  const customerKeyword = usePosSessionStore((state) => state.customerKeyword);
  const draftItems = usePosSessionStore((state) => state.draftItems);
  const draftAddress = usePosSessionStore((state) => state.draftAddress);
  const draftPhone = usePosSessionStore((state) => state.draftPhone);
  const draftMessage = usePosSessionStore((state) => state.draftMessage);
  const setSelectedCustomer = usePosSessionStore((state) => state.setSelectedCustomer);
  const setActiveCartId = usePosSessionStore((state) => state.setActiveCartId);
  const setSelectedCategory = usePosSessionStore((state) => state.setSelectedCategory);
  const setSearchQuery = usePosSessionStore((state) => state.setSearchQuery);
  const setCustomerKeyword = usePosSessionStore((state) => state.setCustomerKeyword);
  const setDraftItems = usePosSessionStore((state) => state.setDraftItems);
  const setDraftAddress = usePosSessionStore((state) => state.setDraftAddress);
  const setDraftPhone = usePosSessionStore((state) => state.setDraftPhone);
  const setDraftMessage = usePosSessionStore((state) => state.setDraftMessage);
  const addDraftItem = usePosSessionStore((state) => state.addDraftItem);
  const incrementDraftItem = usePosSessionStore((state) => state.incrementDraftItem);
  const decrementDraftItem = usePosSessionStore((state) => state.decrementDraftItem);
  const removeDraftItem = usePosSessionStore((state) => state.removeDraftItem);
  const resetSession = usePosSessionStore((state) => state.resetSession);

  return {
    selectedCustomer,
    activeCartId,
    selectedCategory,
    searchQuery,
    customerKeyword,
    draftItems,
    draftAddress,
    draftPhone,
    draftMessage,
    setSelectedCustomer,
    setActiveCartId,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
    setDraftItems,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    addDraftItem,
    incrementDraftItem,
    decrementDraftItem,
    removeDraftItem,
    resetSession,
  };
};
