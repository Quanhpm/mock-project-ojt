import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HttpError } from '@/apis';
import {
  addCartItem,
  deleteCartItem,
  getCartDetail,
  removeCartItemOption,
  updateCartItemOption,
} from '@/apis/endpointsCLIENT/cart.api';
import {
  extractCartsFromPayload,
  toCartDetail,
  type CartDetailView,
} from './cartApiMapper';

export function useCartDetail(cartId: string) {
  const [cart, setCart] = useState<CartDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CartDetailView['items'][number] | null>(null);
  const [editItemQuantity, setEditItemQuantity] = useState(1);
  const [editNote, setEditNote] = useState('');
  const [editOptions, setEditOptions] = useState<Record<string, number>>({});
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const loadCartDetail = useCallback(async () => {
    if (!cartId) {
      setIsLoading(false);
      return;
    }

    try {
      const payload = await getCartDetail(cartId);
      const parsed = extractCartsFromPayload(payload);
      const firstCart = parsed[0];

      if (!firstCart) {
        setCart(null);
        return;
      }

      setCart(toCartDetail(firstCart));
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không tải được chi tiết giỏ hàng. Vui lòng thử lại.';

      toast.error('Tải chi tiết cart thất bại', { description: message, duration: 5000 });
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [cartId]);

  useEffect(() => {
    loadCartDetail();
  }, [loadCartDetail]);

  const handleDeleteItem = useCallback(async (cartItemId: string) => {
    if (!cart || isDeleting) return;
    setIsDeleting(cartItemId);

    try {
      await deleteCartItem(cartItemId);
      await loadCartDetail();
      toast.success('Da xoa san pham khoi gio hang');
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể xóa sản phẩm khỏi cart. Vui lòng thử lại.';

      toast.error('Xóa sản phẩm thất bại', { description: message, duration: 5000 });
    } finally {
      setIsDeleting(null);
    }
  }, [cart, isDeleting, loadCartDetail]);

  const openEditPopup = useCallback((item: CartDetailView['items'][number]) => {
    setEditingItem(item);
    setEditItemQuantity(item.quantity);
    setEditNote(item.note ?? '');
    setEditOptions(
      Object.fromEntries(item.options.map((option) => [option.productFranchiseId, option.quantity])),
    );
  }, []);

  const closeEditPopup = useCallback(() => {
    if (isSavingEdit) return;
    setEditingItem(null);
    setEditItemQuantity(1);
    setEditNote('');
    setEditOptions({});
  }, [isSavingEdit]);

  const updateEditItemQty = useCallback((nextQty: number) => {
    setEditItemQuantity(Math.max(1, Math.min(999, Math.floor(nextQty))));
  }, []);

  const updateEditQtyFromInput = useCallback((rawValue: string) => {
    const nextQty = Number(rawValue);
    if (!Number.isFinite(nextQty)) return;
    updateEditItemQty(nextQty);
  }, [updateEditItemQty]);

  const updateOptionQtyInPopup = useCallback((optionId: string, rawValue: string) => {
    const nextQty = Number(rawValue);
    setEditOptions((prev) => ({
      ...prev,
      [optionId]: Number.isFinite(nextQty) ? Math.max(0, Math.min(999, nextQty)) : 0,
    }));
  }, []);

  const saveEditedItem = useCallback(async () => {
    if (!cart || !editingItem) return;

    const trimmedNote = editNote.trim();
    const currentNote = editingItem.note ?? '';
    const noteChanged = currentNote !== trimmedNote;
    const qtyChanged = editItemQuantity !== editingItem.quantity;

    const normalizedOptions = editingItem.options.map((option) => ({
      productFranchiseId: option.productFranchiseId,
      quantity: Math.max(0, Math.min(999, Number(editOptions[option.productFranchiseId] ?? 0))),
    }));

    const optionsChanged = normalizedOptions.some((option) => {
      const original = editingItem.options.find((o) => o.productFranchiseId === option.productFranchiseId);
      return (original?.quantity ?? 0) !== option.quantity;
    });

    if (!noteChanged && !optionsChanged && !qtyChanged) {
      closeEditPopup();
      return;
    }

    setIsSavingEdit(true);

    try {
      if (qtyChanged || noteChanged) {
        if (!editingItem.productFranchiseId) {
          toast.error('Thiếu dữ liệu sản phẩm', {
            description: 'Backend chưa trả product_franchise_id nên chưa thể cập nhật món.',
          });
          return;
        }

        const qtyDelta = editItemQuantity - editingItem.quantity;
        await addCartItem({
          franchise_id: cart.franchiseId,
          product_franchise_id: editingItem.productFranchiseId,
          quantity: qtyDelta,
          address: cart.address,
          phone: cart.phone,
          note: trimmedNote || undefined,
          options: normalizedOptions
            .filter((option) => option.quantity > 0)
            .map((option) => ({
              product_franchise_id: option.productFranchiseId,
              quantity: option.quantity,
            })),
        });
      }

      await Promise.all(
        normalizedOptions.map(async (option) => {
          const original = editingItem.options.find(
            (o) => o.productFranchiseId === option.productFranchiseId,
          );
          const originalQty = original?.quantity ?? 0;

          if (option.quantity === originalQty) return;

          if (option.quantity <= 0) {
            await removeCartItemOption({
              cart_item_id: editingItem.id,
              option_product_franchise_id: option.productFranchiseId,
            });
            return;
          }

          await updateCartItemOption({
            cart_item_id: editingItem.id,
            option_product_franchise_id: option.productFranchiseId,
            quantity: option.quantity,
          });
        }),
      );

      await loadCartDetail();
      closeEditPopup();
      toast.success('Đã cập nhật món trong giỏ hàng');
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể cập nhật món trong giỏ hàng.';
      toast.error('Cập nhật món thất bại', { description: message, duration: 5000 });
    } finally {
      setIsSavingEdit(false);
    }
  }, [
    cart,
    closeEditPopup,
    editItemQuantity,
    editNote,
    editOptions,
    editingItem,
    loadCartDetail,
  ]);

  return {
    cart,
    isLoading,
    isDeleting,
    editingItem,
    editItemQuantity,
    editNote,
    editOptions,
    isSavingEdit,
    loadCartDetail,
    handleDeleteItem,
    openEditPopup,
    closeEditPopup,
    updateEditItemQty,
    updateEditQtyFromInput,
    updateOptionQtyInPopup,
    saveEditedItem,
    setEditNote,
  };
}
