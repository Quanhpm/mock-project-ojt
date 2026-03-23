import { usePosSessionStore } from "../stores/pos-session.store";

export const usePosSession = () => {
  const selectedCustomer = usePosSessionStore((state) => state.selectedCustomer);
  const activeCartId = usePosSessionStore((state) => state.activeCartId);
  const reviewContactCustomerId = usePosSessionStore((state) => state.reviewContactCustomerId);
  const selectedAdminFranchiseId = usePosSessionStore((state) => state.selectedAdminFranchiseId);
  const selectedAdminFranchiseName = usePosSessionStore(
    (state) => state.selectedAdminFranchiseName,
  );
  const selectedCategory = usePosSessionStore((state) => state.selectedCategory);
  const searchQuery = usePosSessionStore((state) => state.searchQuery);
  const customerKeyword = usePosSessionStore((state) => state.customerKeyword);
  const draftItems = usePosSessionStore((state) => state.draftItems);
  const draftAddress = usePosSessionStore((state) => state.draftAddress);
  const draftPhone = usePosSessionStore((state) => state.draftPhone);
  const draftMessage = usePosSessionStore((state) => state.draftMessage);
  const voucherCode = usePosSessionStore((state) => state.voucherCode);
  const setSelectedCustomer = usePosSessionStore((state) => state.setSelectedCustomer);
  const setActiveCartId = usePosSessionStore((state) => state.setActiveCartId);
  const setReviewContactCustomerId = usePosSessionStore(
    (state) => state.setReviewContactCustomerId,
  );
  const setSelectedAdminFranchiseId = usePosSessionStore((state) => state.setSelectedAdminFranchiseId);
  const setSelectedAdminFranchiseName = usePosSessionStore(
    (state) => state.setSelectedAdminFranchiseName,
  );
  const setSelectedCategory = usePosSessionStore((state) => state.setSelectedCategory);
  const setSearchQuery = usePosSessionStore((state) => state.setSearchQuery);
  const setCustomerKeyword = usePosSessionStore((state) => state.setCustomerKeyword);
  const setDraftItems = usePosSessionStore((state) => state.setDraftItems);
  const setDraftAddress = usePosSessionStore((state) => state.setDraftAddress);
  const setDraftPhone = usePosSessionStore((state) => state.setDraftPhone);
  const setDraftMessage = usePosSessionStore((state) => state.setDraftMessage);
  const setVoucherCode = usePosSessionStore((state) => state.setVoucherCode);
  const addDraftItem = usePosSessionStore((state) => state.addDraftItem);
  const replaceDraftItem = usePosSessionStore((state) => state.replaceDraftItem);
  const incrementDraftItem = usePosSessionStore((state) => state.incrementDraftItem);
  const decrementDraftItem = usePosSessionStore((state) => state.decrementDraftItem);
  const removeDraftItem = usePosSessionStore((state) => state.removeDraftItem);
  const resetSession = usePosSessionStore((state) => state.resetSession);

  return {
    selectedCustomer,
    activeCartId,
    reviewContactCustomerId,
    selectedAdminFranchiseId,
    selectedAdminFranchiseName,
    selectedCategory,
    searchQuery,
    customerKeyword,
    draftItems,
    draftAddress,
    draftPhone,
    draftMessage,
    voucherCode,
    setSelectedCustomer,
    setActiveCartId,
    setReviewContactCustomerId,
    setSelectedAdminFranchiseId,
    setSelectedAdminFranchiseName,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
    setDraftItems,
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    setVoucherCode,
    addDraftItem,
    replaceDraftItem,
    incrementDraftItem,
    decrementDraftItem,
    removeDraftItem,
    resetSession,
  };
};
