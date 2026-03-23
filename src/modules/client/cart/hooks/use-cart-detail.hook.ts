import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { HttpError } from '@/apis';
import {
  applyVoucher,
  cancelCart,
  deleteCartItem,
  getCartDetail,
  removeVoucher,
  updateCartItemOptions,
  updateCartItemQuantity,
} from '@/apis/endpointsCLIENT/cart.api';
import { getMenuByFranchise } from '@/apis/endpointsCLIENT/client.api';
import {
  extractCartsFromPayload,
  toCartDetail,
  type CartDetailView,
} from './cartApiMapper';

interface AvailableToppingOption {
  productFranchiseId: string;
  productName: string;
  priceSnapshot: number;
}

export function useCartDetail(cartId: string) {
  const [cart, setCart] = useState<CartDetailView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<CartDetailView['items'][number] | null>(null);
  const [editItemQuantity, setEditItemQuantity] = useState(1);
  const [editNote, setEditNote] = useState('');
  const [editOptions, setEditOptions] = useState<Record<string, number>>({});
  const [availableToppings, setAvailableToppings] = useState<AvailableToppingOption[]>([]);
  const [isLoadingToppings, setIsLoadingToppings] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [isRemovingVoucher, setIsRemovingVoucher] = useState(false);
  const [isCancellingCart, setIsCancellingCart] = useState(false);
  const [pendingQuantityChanges, setPendingQuantityChanges] = useState<Record<string, number>>({});
  const [isSavingQuantityChanges, setIsSavingQuantityChanges] = useState(false);

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
        setPendingQuantityChanges({});
        return;
      }

      setCart(toCartDetail(firstCart));
      setPendingQuantityChanges({});
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
    if (!cart || isDeleting) return false;
    setIsDeleting(cartItemId);

    try {
      await deleteCartItem(cartItemId);
      await loadCartDetail();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
      return true;
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể xóa sản phẩm khỏi cart. Vui lòng thử lại.';

      toast.error('Xóa sản phẩm thất bại', { description: message, duration: 5000 });
      return false;
    } finally {
      setIsDeleting(null);
    }
  }, [cart, isDeleting, loadCartDetail]);

  const updateQuantityLocally = useCallback((cartItemId: string, nextQty: number) => {
    setCart((prev) => {
      if (!prev) return prev;

      const updatedItems = prev.items.map((item) => {
        if (item.id !== cartItemId) return item;

        const perUnitLine = item.quantity > 0 ? item.lineTotal / item.quantity : item.unitPrice;
        const perUnitFinal = item.quantity > 0 ? item.finalLineTotal / item.quantity : item.unitPrice;

        return {
          ...item,
          quantity: nextQty,
          lineTotal: Math.round(perUnitLine * nextQty),
          finalLineTotal: Math.round(perUnitFinal * nextQty),
        };
      });

      const subtotalAmount = updatedItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const finalAmount = Math.max(
        0,
        subtotalAmount - prev.promotionDiscount - prev.voucherDiscount - prev.loyaltyDiscount,
      );

      return {
        ...prev,
        items: updatedItems,
        subtotalAmount,
        finalAmount,
        totalAmount: finalAmount,
      };
    });
  }, []);

  const setCartItemQuantity = useCallback((cartItemId: string, nextQty: number) => {
    if (!cart) return;

    const targetItem = cart.items.find((item) => item.id === cartItemId);
    if (!targetItem) return;

    const normalizedQty = Math.max(1, Math.min(999, Math.floor(nextQty)));
    if (normalizedQty === targetItem.quantity) return;

    updateQuantityLocally(cartItemId, normalizedQty);
    setPendingQuantityChanges((prev) => ({
      ...prev,
      [cartItemId]: normalizedQty,
    }));
  }, [cart, updateQuantityLocally]);

  const hasPendingQuantityChanges = Object.keys(pendingQuantityChanges).length > 0;

  const savePendingQuantityChanges = useCallback(async () => {
    if (!cart) return false;
    if (isSavingQuantityChanges) return false;

    const entries = Object.entries(pendingQuantityChanges);
    if (entries.length === 0) {
      return true;
    }

    setIsSavingQuantityChanges(true);
    try {
      for (const [cartItemId, quantity] of entries) {
        setIsUpdatingQuantity(cartItemId);
        await updateCartItemQuantity({
          cart_item_id: cartItemId,
          quantity,
        });
      }

      setPendingQuantityChanges({});
      toast.success('Đã lưu số lượng sản phẩm');
      return true;
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể lưu thay đổi số lượng.';
      toast.error('Lưu số lượng thất bại', { description: message, duration: 5000 });
      await loadCartDetail();
      return false;
    } finally {
      setIsSavingQuantityChanges(false);
      setIsUpdatingQuantity(null);
    }
  }, [cart, isSavingQuantityChanges, loadCartDetail, pendingQuantityChanges]);

  const increaseCartItemQuantity = useCallback((cartItemId: string) => {
    const targetItem = cart?.items.find((item) => item.id === cartItemId);
    if (!targetItem) return;
    setCartItemQuantity(cartItemId, targetItem.quantity + 1);
  }, [cart?.items, setCartItemQuantity]);

  const decreaseCartItemQuantity = useCallback((cartItemId: string) => {
    const targetItem = cart?.items.find((item) => item.id === cartItemId);
    if (!targetItem) return;
    setCartItemQuantity(cartItemId, targetItem.quantity - 1);
  }, [cart?.items, setCartItemQuantity]);

  const openEditPopup = useCallback((item: CartDetailView['items'][number]) => {
    setEditingItem(item);
    setEditItemQuantity(item.quantity);
    setEditNote(item.note ?? '');
    setEditOptions(
      Object.fromEntries(item.options.map((option) => [option.productFranchiseId, option.quantity])),
    );
  }, []);

  useEffect(() => {
    if (!editingItem || !cart?.franchiseId) {
      setAvailableToppings([]);
      setIsLoadingToppings(false);
      return;
    }

    let isCancelled = false;

    const loadToppingOptions = async () => {
      setIsLoadingToppings(true);
      try {
        const menu = await getMenuByFranchise(cart.franchiseId);
        const toppingCategory = menu?.find((category) => category.category_name.trim().toLowerCase() === 'topping');

        if (!toppingCategory?.category_id) {
          if (!isCancelled) setAvailableToppings([]);
          return;
        }

        const toppingMenu = await getMenuByFranchise(cart.franchiseId, toppingCategory.category_id);
        const mappedToppings = (toppingMenu ?? [])
          .flatMap((category) => category.products)
          .map((product) => {
            const selectedSize = product.sizes.find((size) => size.is_available);

            if (!selectedSize) return null;

            return {
              productFranchiseId: selectedSize.product_franchise_id,
              productName: product.name,
              priceSnapshot: selectedSize.price,
            };
          })
          .filter((option): option is AvailableToppingOption => option !== null);

        if (!isCancelled) {
          setAvailableToppings(
            mappedToppings.filter(
              (option, index, arr) => arr.findIndex((o) => o.productFranchiseId === option.productFranchiseId) === index,
            ),
          );
        }
      } catch {
        if (!isCancelled) {
          setAvailableToppings([]);
          toast.error('Không tải được danh sách topping');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingToppings(false);
        }
      }
    };

    loadToppingOptions();

    return () => {
      isCancelled = true;
    };
  }, [cart?.franchiseId, editingItem]);

  const closeEditPopup = useCallback(() => {
    if (isSavingEdit) return;
    setEditingItem(null);
    setEditItemQuantity(1);
    setEditNote('');
    setEditOptions({});
    setAvailableToppings([]);
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

    const optionIds = new Set<string>([
      ...editingItem.options.map((option) => option.productFranchiseId),
      ...availableToppings.map((option) => option.productFranchiseId),
    ]);

    const normalizedOptions = Array.from(optionIds).map((productFranchiseId) => ({
      productFranchiseId,
      quantity: Math.max(0, Math.min(999, Number(editOptions[productFranchiseId] ?? 0))),
    }));

    const optionsChanged = normalizedOptions.some((option) => {
      const original = editingItem.options.find((o) => o.productFranchiseId === option.productFranchiseId);
      return (original?.quantity ?? 0) !== option.quantity;
    });

    if (!noteChanged && !optionsChanged && !qtyChanged) {
      toast.info('Không có thay đổi để cập nhật');
      closeEditPopup();
      return;
    }

    setIsSavingEdit(true);

    try {
      if (qtyChanged) {
        await updateCartItemQuantity({
          cart_item_id: editingItem.id,
          quantity: editItemQuantity,
        });
      }

      if (optionsChanged) {
        await updateCartItemOptions({
          cart_item_id: editingItem.id,
          options: normalizedOptions
            .filter((option) => option.quantity > 0)
            .map((option) => ({
              product_franchise_id: option.productFranchiseId,
              quantity: option.quantity,
            })),
        });
      }

      if (noteChanged) {
        toast.info('Ghi chú chưa được cập nhật', {
          description: 'Hiện backend chưa có API cập nhật ghi chú trực tiếp cho cart item.',
        });
      }

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
    availableToppings,
    loadCartDetail,
  ]);

  const applyVoucherForCart = useCallback(async () => {
    if (!cart) return;

    if (hasPendingQuantityChanges) {
      toast.error('Bạn có thay đổi số lượng chưa lưu', {
        description: 'Vui lòng bấm "Lưu số lượng" trước khi áp dụng voucher.',
      });
      return;
    }

    const trimmedCode = voucherCode.trim();
    if (!trimmedCode) {
      toast.error('Vui lòng nhập mã giảm giá');
      return;
    }

    if (isApplyingVoucher || isRemovingVoucher) return;

    setIsApplyingVoucher(true);
    try {
      const voucherPayload = {
        voucher_code: trimmedCode,
      };
      await applyVoucher(cart.id, voucherPayload);
      await loadCartDetail();
      toast.success('Áp dụng mã giảm giá thành công');
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể áp dụng mã giảm giá.';
      toast.error('Áp dụng mã thất bại', { description: message, duration: 5000 });
    } finally {
      setIsApplyingVoucher(false);
    }
  }, [cart, hasPendingQuantityChanges, isApplyingVoucher, isRemovingVoucher, loadCartDetail, voucherCode]);

  const removeAllVoucherFromCart = useCallback(async () => {
    if (!cart || isRemovingVoucher || isApplyingVoucher) return;

    if (hasPendingQuantityChanges) {
      toast.error('Bạn có thay đổi số lượng chưa lưu', {
        description: 'Vui lòng bấm "Lưu số lượng" trước khi gỡ voucher.',
      });
      return;
    }

    setIsRemovingVoucher(true);
    try {
      await removeVoucher(cart.id);
      await loadCartDetail();
      setVoucherCode('');
      toast.success('Đã xóa tất cả voucher khỏi đơn hàng');
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể xóa voucher khỏi đơn hàng.';
      toast.error('Xóa voucher thất bại', { description: message, duration: 5000 });
    } finally {
      setIsRemovingVoucher(false);
    }
  }, [cart, hasPendingQuantityChanges, isRemovingVoucher, isApplyingVoucher, loadCartDetail]);

  const handleCancelCart = useCallback(async () => {
    if (!cart || isCancellingCart) return false;

    setIsCancellingCart(true);
    try {
      await cancelCart(cart.id);
      toast.success('Đã hủy giỏ hàng thành công');
      return true;
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể hủy giỏ hàng.';
      toast.error('Hủy giỏ hàng thất bại', { description: message, duration: 5000 });
      return false;
    } finally {
      setIsCancellingCart(false);
    }
  }, [cart, isCancellingCart]);

  return {
    cart,
    isLoading,
    isDeleting,
    isUpdatingQuantity,
    editingItem,
    editItemQuantity,
    editNote,
    editOptions,
    availableToppings,
    isLoadingToppings,
    isSavingEdit,
    voucherCode,
    isApplyingVoucher,
    isRemovingVoucher,
    isCancellingCart,
    isSavingQuantityChanges,
    hasPendingQuantityChanges,
    pendingQuantityChanges,
    loadCartDetail,
    handleDeleteItem,
    handleCancelCart,
    savePendingQuantityChanges,
    setCartItemQuantity,
    increaseCartItemQuantity,
    decreaseCartItemQuantity,
    openEditPopup,
    closeEditPopup,
    updateEditItemQty,
    updateEditQtyFromInput,
    updateOptionQtyInPopup,
    saveEditedItem,
    setVoucherCode,
    applyVoucherForCart,
    removeAllVoucherFromCart,
    setEditNote,
  };
}
