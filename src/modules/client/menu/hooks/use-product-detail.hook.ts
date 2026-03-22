import { useState, useEffect } from 'react';
import {
  getProductDetail,
  type ProductDetailResponse,
  type ProductSize,
} from '@/apis/endpointsCLIENT/productDetail.api';
import { getMenuByFranchise } from '@/apis/endpointsCLIENT/client.api';

export interface ProductToppingOption {
  product_id: string;
  product_franchise_id: string;
  name: string;
  price: number;
  image_url: string;
}

export interface UseProductDetailReturn {
  product: ProductDetailResponse | null;
  loading: boolean;
  selectedSize: ProductSize | null;
  toppingOptions: ProductToppingOption[];
  setSelectedSize: (size: ProductSize) => void;
}

export function useProductDetail(
  franchiseId: string,
  productId: string,
): UseProductDetailReturn {
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [toppingOptions, setToppingOptions] = useState<ProductToppingOption[]>([]);

  useEffect(() => {
    if (!productId || !franchiseId) {
      setProduct(null);
      setSelectedSize(null);
      setToppingOptions([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadProductDetail = async () => {
      setLoading(true);

      try {
        const data = await getProductDetail(franchiseId, productId);
        if (!isMounted) return;

        setProduct(data);
        const firstAvailableSize =
          data?.sizes?.find((size) => size.is_available) ?? data?.sizes?.[0] ?? null;
        setSelectedSize(firstAvailableSize);

        // If product doesn't have toppings, skip fetching them
        if (!data?.is_have_topping) {
          setToppingOptions([]);
          return;
        }

        // Fetch menu and extract topping category products
        const menu = await getMenuByFranchise(franchiseId, '');
        if (!isMounted) return;

        const toppings = (menu ?? [])
          .filter((category) => category.category_name?.trim().toLowerCase().includes('topping'))
          .flatMap((category) => category.products)
          .map((item) => {
            const availableSize = item.sizes.find((size) => size.is_available);
            if (!availableSize) return null;

            return {
              product_id: item.product_id,
              product_franchise_id: availableSize.product_franchise_id,
              name: item.name,
              price: availableSize.price,
              image_url: item.image_url,
            } as ProductToppingOption;
          })
          .filter((item): item is ProductToppingOption => item !== null);

        setToppingOptions(toppings);
      } catch (err) {
        console.error('[useProductDetail] Failed to load product:', err);
        if (isMounted) {
          setProduct(null);
          setSelectedSize(null);
          setToppingOptions([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProductDetail();

    return () => {
      isMounted = false;
    };
  }, [productId, franchiseId]);

  return { product, loading, selectedSize, toppingOptions, setSelectedSize };
}
