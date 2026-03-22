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

  const setCartItemQuantity = useCallback(async (cartItemId: string, nextQty: number) => {
    if (!cart || isUpdatingQuantity) return;

    const targetItem = cart.items.find((item) => item.id === cartItemId);
    if (!targetItem) return;

    const normalizedQty = Math.max(1, Math.min(999, Math.floor(nextQty)));
    if (normalizedQty === targetItem.quantity) return;

    setIsUpdatingQuantity(cartItemId);
    try {
      await updateCartItemQuantity({
        cart_item_id: cartItemId,
        quantity: normalizedQty,
      });
      await loadCartDetail();
      toast.success('Đã cập nhật số lượng sản phẩm');
    } catch (err) {
      const message = err instanceof HttpError
        ? err.message
        : 'Không thể cập nhật số lượng món.';
      toast.error('Cập nhật số lượng thất bại', { description: message, duration: 5000 });
    } finally {
      setIsUpdatingQuantity(null);
    }
  }, [cart, isUpdatingQuantity, loadCartDetail]);

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
  }, [cart, isApplyingVoucher, isRemovingVoucher, loadCartDetail, voucherCode]);

  const removeAllVoucherFromCart = useCallback(async () => {
    if (!cart || isRemovingVoucher || isApplyingVoucher) return;

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
  }, [cart, isRemovingVoucher, isApplyingVoucher, loadCartDetail]);

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
    loadCartDetail,
    handleDeleteItem,
    handleCancelCart,
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
