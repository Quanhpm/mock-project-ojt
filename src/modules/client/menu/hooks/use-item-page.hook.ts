import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HttpError } from '@/apis';
import { addCartItem } from '@/apis/endpointsCLIENT/cart.api';
import { useToast } from '@/hooks/use-toast.hook';
import { ROUTER_URL } from '@/routes/router.const';
import { useClientAuthStore } from '../../auth-client/stores/client-auth.store';
import { useProductDetail } from './use-product-detail.hook';

export function useItemPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { success, error } = useToast();

  // Extract navigation state
  const locationState = location.state as { franchiseId?: string; productId?: string } | null;
  const franchiseId = locationState?.franchiseId ?? '';
  const productId = locationState?.productId ?? '';

  // Get auth state
  const isLoggedIn = useClientAuthStore((state) => state.isLoggedIn);

  // Load product details
  const { product, loading, selectedSize, toppingOptions, setSelectedSize } = useProductDetail(
    franchiseId,
    productId,
  );

  // Local state for cart interaction
  const [qty, setQty] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<typeof toppingOptions>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  // Compute product images
  const images = useMemo(() => {
    if (!product) return [];
    return [product.image_url, ...(product.images_url ?? []).filter((url) => url !== product.image_url)];
  }, [product]);

  // Compute total topping price
  const toppingsPrice = useMemo(
    () => selectedToppings.reduce((sum, topping) => sum + topping.price, 0),
    [selectedToppings],
  );

  // Compute final price
  const totalPrice = useMemo(() => {
    if (!selectedSize) return 0;
    return (selectedSize.price + toppingsPrice) * qty;
  }, [selectedSize, toppingsPrice, qty]);

  const isProductAvailable = useMemo(
    () => (product?.sizes ?? []).some((size) => size.is_available),
    [product],
  );

  // Toggle topping selection
  const toggleTopping = (productFranchiseId: string) => {
    setSelectedToppings((current) => {
      const exists = current.some((item) => item.product_franchise_id === productFranchiseId);
      if (exists) {
        return current.filter((item) => item.product_franchise_id !== productFranchiseId);
      }

      const topping = toppingOptions.find((item) => item.product_franchise_id === productFranchiseId);
      return topping ? [...current, topping] : current;
    });
  };

  // Quantity helpers
  const decreaseQty = () => setQty((current) => Math.max(1, current - 1));
  const increaseQty = () => setQty((current) => current + 1);
  const updateQtyFromInput = (rawValue: string) => {
    setQty(Math.min(999, Math.max(1, parseInt(rawValue, 10) || 1)));
  };

  // Navigation helpers
  const goToMenu = () => navigate(ROUTER_URL.MENU);
  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
      return;
    }

    goToMenu();
  };

  // Add to cart handler
  const handleAddToCart = async () => {
    if (isAddingToCart) return;

    // Check if user is logged in
    if (!isLoggedIn) {
      error('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
      setTimeout(() => {
        navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN, {
          state: { from: ROUTER_URL.MENU },
        });
      }, 1500);
      return;
    }

    if (!product || !selectedSize) return;

    if (!isProductAvailable || !selectedSize.is_available) {
      error('Sản phẩm tạm hết hàng', 'Sản phẩm này hiện không khả dụng để thêm vào giỏ hàng');
      return;
    }

    // Validate franchise selection
    if (!franchiseId) {
      error('Thiếu thông tin cửa hàng', 'Không xác định được chi nhánh để thêm vào giỏ hàng');
      return;
    }

    setIsAddingToCart(true);

    try {
      await addCartItem({
        franchise_id: franchiseId,
        product_franchise_id: selectedSize.product_franchise_id,
        quantity: qty,
        options: selectedToppings.map((topping) => ({
          product_franchise_id: topping.product_franchise_id,
          quantity: 1,
        })),
        note:
          selectedToppings.length > 0
            ? `Topping: ${selectedToppings.map((topping) => topping.name).join(', ')}`
            : undefined,
      });

      success('Đã thêm vào giỏ hàng', `${product.name} đã được thêm vào giỏ hàng`);
      goToMenu();
    } catch (err) {
      const errorMessage =
        err instanceof HttpError
          ? err.message
          : 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.';

      error('Thêm vào giỏ hàng thất bại', errorMessage);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return {
    franchiseId,
    productId,
    product,
    loading,
    selectedSize,
    toppingOptions,
    setSelectedSize,
    qty,
    selectedToppings,
    isAddingToCart,
    activeImg,
    images,
    totalPrice,
    isProductAvailable,
    setActiveImg,
    toggleTopping,
    decreaseQty,
    increaseQty,
    updateQtyFromInput,
    handleAddToCart,
    goBack,
    goToMenu,
  };
}
