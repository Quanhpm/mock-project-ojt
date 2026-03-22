import type { CartDetailItemView } from '../hooks/cartApiMapper';
import CartEditModal from './CartEditModal';
import { Confirm } from './Confirm';

interface CartDetailDialogsProps {
  editItemQuantity: number;
  editNote: string;
  editOptions: Record<string, number>;
  availableToppings: Array<{
    productFranchiseId: string;
    productName: string;
    priceSnapshot: number;
  }>;
  editingItem: CartDetailItemView | null;
  formatCurrency: (amount: number) => string;
  isLoadingToppings: boolean;
  isSavingEdit: boolean;
  onChangeItemQty: (nextQty: number) => void;
  onChangeItemQtyInput: (rawValue: string) => void;
  onChangeNote: (note: string) => void;
  onChangeOptionQty: (optionId: string, rawValue: string) => void;
  onCloseEditModal: () => void;
  onSaveEditModal: () => void;
  isDeleteItemConfirmOpen: boolean;
  onCloseDeleteItemConfirm: () => void;
  onConfirmDeleteItem: () => void | Promise<void>;
  isCancelCartConfirmOpen: boolean;
  isCancellingCart: boolean;
  onCloseCancelCartConfirm: () => void;
  onConfirmCancelCart: () => void | Promise<void>;
}

function CartDetailDialogs({
  editItemQuantity,
  editNote,
  editOptions,
  availableToppings,
  editingItem,
  formatCurrency,
  isLoadingToppings,
  isSavingEdit,
  onChangeItemQty,
  onChangeItemQtyInput,
  onChangeNote,
  onChangeOptionQty,
  onCloseEditModal,
  onSaveEditModal,
  isDeleteItemConfirmOpen,
  onCloseDeleteItemConfirm,
  onConfirmDeleteItem,
  isCancelCartConfirmOpen,
  isCancellingCart,
  onCloseCancelCartConfirm,
  onConfirmCancelCart,
}: CartDetailDialogsProps) {
  return (
    <>
      <CartEditModal
        editItemQuantity={editItemQuantity}
        editNote={editNote}
        editOptions={editOptions}
        availableToppings={availableToppings}
        editingItem={editingItem}
        formatCurrency={formatCurrency}
        isLoadingToppings={isLoadingToppings}
        isSavingEdit={isSavingEdit}
        onChangeItemQty={onChangeItemQty}
        onChangeItemQtyInput={onChangeItemQtyInput}
        onChangeNote={onChangeNote}
        onChangeOptionQty={onChangeOptionQty}
        onClose={onCloseEditModal}
        onSave={onSaveEditModal}
      />

      <Confirm
        cancelText="Không"
        confirmText="Xóa sản phẩm"
        isOpen={isDeleteItemConfirmOpen}
        message="Sản phẩm sẽ bị xóa khỏi giỏ hàng của bạn. Hành động này không thể hoàn tác."
        onClose={onCloseDeleteItemConfirm}
        onConfirm={onConfirmDeleteItem}
        title="Xác nhận xóa sản phẩm"
        type="danger"
      />

      <Confirm
        cancelText="Không"
        confirmText={isCancellingCart ? 'Đang xóa...' : 'Xóa giỏ hàng'}
        isOpen={isCancelCartConfirmOpen}
        message="Giỏ hàng sẽ bị hủy toàn bộ. Hành động này không thể hoàn tác."
        onClose={onCloseCancelCartConfirm}
        onConfirm={onConfirmCancelCart}
        title="Xác nhận xóa giỏ hàng"
        type="danger"
      />
    </>
  );
}

export default CartDetailDialogs;

