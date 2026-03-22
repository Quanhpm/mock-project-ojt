import { PosCategoryTabs } from "../partials/pos/PosCategoryTabs";
import { PosDraftSidebar } from "../partials/pos/PosDraftSidebar";
import { PosExistingActiveCartModal } from "../partials/pos/PosExistingActiveCartModal";
import { PosFranchiseSelectionGate } from "../partials/pos/PosFranchiseSelectionGate";
import { PosHeader } from "../partials/pos/PosHeader";
import { PosProductConfigModal } from "../partials/pos/PosProductConfigModal";
import { PosProductGrid } from "../partials/pos/PosProductGrid";
import { useOrderPosPage } from "../hooks/use-order-pos-page";

export const OrderPosPage = () => {
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    requiresFranchiseSelection,
    categories,
    products,
    selectedCategory,
    searchQuery,
    customerKeyword,
    customerResults,
    selectedCustomer,
    displayItems,
    displaySubtotal,
    isLoadingMenu,
    isSearchingCustomers,
    isMutatingCart,
    isCheckingActiveCart,
    isSwitchingFranchise,
    hasPersistedCart,
    existingActiveCart,
    canContinue,
    isExistingCartModalOpen,
    isProductConfiguratorOpen,
    isEditingConfiguredProduct,
    productBeingConfigured,
    configuredSize,
    configuredQuantity,
    configuredNote,
    supportsToppings,
    toppingGroups,
    selectedToppings,
    configuredTotalPrice,
    setSelectedCategory,
    setSearchQuery,
    setCustomerKeyword,
    switchFranchise,
    searchCustomers,
    selectCustomer,
    clearSelectedCustomer,
    addProductToCart,
    editCartItem,
    closeProductConfigurator,
    confirmConfiguredProduct,
    setConfiguredSize,
    setConfiguredNote,
    increaseConfiguredQuantity,
    decreaseConfiguredQuantity,
    increaseConfiguredToppingQuantity,
    decreaseConfiguredToppingQuantity,
    addOneMoreOfCartItem,
    decreaseCartItemQuantity,
    removeCartItem,
    continueToReview,
    closeExistingCartModal,
    useExistingServerCart,
    mergeDraftIntoExistingCart,
  } = useOrderPosPage();

  return (
    <>
      {requiresFranchiseSelection ? (
        <main
          className="flex min-h-0 flex-1 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 shadow-sm"
          style={{ height: "calc(100vh - 48px)" }}
        >
          <PosFranchiseSelectionGate
            franchiseOptions={franchiseOptions}
            isLoading={isSwitchingFranchise}
            onSelectFranchise={switchFranchise}
          />
        </main>
      ) : (
        <main
          className="flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm"
          style={{ height: "calc(100vh - 48px)" }}
        >
          <section className="relative flex min-w-0 flex-1 basis-0 flex-col overflow-hidden border-r border-gray-100">
            <PosHeader
              franchiseId={franchiseId}
              franchiseName={franchiseName}
              franchiseOptions={franchiseOptions}
              searchQuery={searchQuery}
              isSwitchingFranchise={isSwitchingFranchise}
              onSearchChange={setSearchQuery}
              onSwitchFranchise={switchFranchise}
            />

            <PosCategoryTabs
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
              {franchiseId ? (
                <PosProductGrid
                  products={products}
                  isLoading={isLoadingMenu}
                  disabled={isMutatingCart || isCheckingActiveCart}
                  onAdd={addProductToCart}
                />
              ) : (
                <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 text-center">
                  <p className="text-lg font-semibold text-gray-900">Chưa chọn chi nhánh phục vụ</p>
                  <p className="mt-2 max-w-xl text-sm text-gray-500">
                    Hãy chọn chi nhánh để tải thực đơn và bắt đầu tạo đơn hàng tại quầy.
                  </p>
                </div>
              )}
            </div>
          </section>

          <PosDraftSidebar
            items={displayItems}
            subtotalAmount={displaySubtotal}
            selectedCustomer={selectedCustomer}
            customerKeyword={customerKeyword}
            customerResults={customerResults}
            isSearchingCustomers={isSearchingCustomers}
            isMutatingCart={isMutatingCart || isCheckingActiveCart}
            hasPersistedCart={hasPersistedCart}
            onCustomerKeywordChange={setCustomerKeyword}
            onSearchCustomers={searchCustomers}
            onSelectCustomer={selectCustomer}
            onClearCustomer={clearSelectedCustomer}
            onEditItem={editCartItem}
            onAddOneMore={addOneMoreOfCartItem}
            onDecreaseItem={decreaseCartItemQuantity}
            onRemoveItem={removeCartItem}
            canContinue={canContinue}
            onContinue={() => {
              void continueToReview();
            }}
          />

          <PosProductConfigModal
            open={isProductConfiguratorOpen}
            product={productBeingConfigured}
            selectedSize={configuredSize}
            quantity={configuredQuantity}
            note={configuredNote}
            totalPrice={configuredTotalPrice}
            supportsToppings={supportsToppings}
            toppingGroups={toppingGroups}
            selectedToppings={selectedToppings}
            isSubmitting={isMutatingCart}
            confirmLabel={isEditingConfiguredProduct ? "Cập nhật món" : "Thêm vào đơn"}
            onClose={closeProductConfigurator}
            onConfirm={() => {
              void confirmConfiguredProduct();
            }}
            onSelectSize={setConfiguredSize}
            onNoteChange={setConfiguredNote}
            onIncreaseQuantity={increaseConfiguredQuantity}
            onDecreaseQuantity={decreaseConfiguredQuantity}
            onIncreaseTopping={increaseConfiguredToppingQuantity}
            onDecreaseTopping={decreaseConfiguredToppingQuantity}
          />
        </main>
      )}

      <PosExistingActiveCartModal
        open={isExistingCartModalOpen}
        existingCart={existingActiveCart}
        draftItems={displayItems}
        isSubmitting={isMutatingCart}
        onClose={closeExistingCartModal}
        onUseExistingCart={useExistingServerCart}
        onMergeDraftIntoCart={() => {
          void mergeDraftIntoExistingCart();
        }}
      />
    </>
  );
};

export default OrderPosPage;
