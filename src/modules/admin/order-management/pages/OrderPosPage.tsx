import { PosCartSidebar } from "../partials/pos/PosCartSidebar";
import { PosCategoryTabs } from "../partials/pos/PosCategoryTabs";
import { PosHeader } from "../partials/pos/PosHeader";
import { PosProductConfigModal } from "../partials/pos/PosProductConfigModal";
import { PosProductGrid } from "../partials/pos/PosProductGrid";
import { useOrderPosPage } from "../hooks/use-order-pos-page";

export const OrderPosPage = () => {
  const {
    franchiseId,
    franchiseName,
    franchiseOptions,
    categories,
    products,
    selectedCategory,
    searchQuery,
    customerKeyword,
    customerResults,
    selectedCustomer,
    cart,
    displayItems,
    displaySubtotal,
    displayFinalAmount,
    draftAddress,
    draftPhone,
    draftMessage,
    isLoadingMenu,
    isSearchingCustomers,
    isMutatingCart,
    isSwitchingFranchise,
    canCheckout,
    isProductConfiguratorOpen,
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
    setDraftAddress,
    setDraftPhone,
    setDraftMessage,
    switchFranchise,
    searchCustomers,
    selectCustomer,
    clearSelectedCustomer,
    addProductToCart,
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
    saveCartInfo,
    checkoutCart,
  } = useOrderPosPage();

  return (
    <main className="flex min-h-[calc(100vh-132px)] flex-1 overflow-hidden rounded-3xl bg-gray-50">
      <section className="relative flex min-w-0 flex-1 flex-col overflow-hidden border-r border-gray-100">
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

        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {franchiseId ? (
            <PosProductGrid
              products={products}
              isLoading={isLoadingMenu}
              disabled={isMutatingCart}
              onAdd={addProductToCart}
            />
          ) : (
            <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 text-center">
              <p className="text-lg font-semibold text-gray-900">Chưa chọn chi nhánh bán hàng</p>
              <p className="mt-2 max-w-xl text-sm text-gray-500">
                Hãy chọn chi nhánh ngay trên thanh POS để tải danh sách product franchise và bắt đầu tạo cart.
              </p>
            </div>
          )}
        </div>
      </section>

      <PosCartSidebar
        cart={cart}
        items={displayItems}
        subtotalAmount={displaySubtotal}
        finalAmount={displayFinalAmount}
        selectedCustomer={selectedCustomer}
        customerKeyword={customerKeyword}
        customerResults={customerResults}
        draftAddress={draftAddress}
        draftPhone={draftPhone}
        draftMessage={draftMessage}
        isSearchingCustomers={isSearchingCustomers}
        isMutatingCart={isMutatingCart}
        onCustomerKeywordChange={setCustomerKeyword}
        onSearchCustomers={searchCustomers}
        onSelectCustomer={selectCustomer}
        onClearCustomer={clearSelectedCustomer}
        onAddressChange={setDraftAddress}
        onPhoneChange={setDraftPhone}
        onMessageChange={setDraftMessage}
        onAddOneMore={addOneMoreOfCartItem}
        onDecreaseItem={decreaseCartItemQuantity}
        onRemoveItem={removeCartItem}
        onSaveCartInfo={() => {
          void saveCartInfo();
        }}
        canCheckout={canCheckout}
        onCheckout={() => {
          void checkoutCart();
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
  );
};

export default OrderPosPage;
