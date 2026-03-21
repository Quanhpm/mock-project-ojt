import { useState, useEffect } from "react";
import { getProductDetail, type ProductDetailResponse, type ProductSize } from "@/apis/endpointsCLIENT/productDetail.api";
import { getMenuByFranchise } from "@/apis/endpointsCLIENT/client.api";

export interface ProductToppingOption {
    product_id: string;
    product_franchise_id: string;
    name: string;
    price: number;
    image_url: string;
}

interface UseProductDetailReturn {
    product: ProductDetailResponse | null;
    loading: boolean;
    selectedSize: ProductSize | null;
    toppingOptions: ProductToppingOption[];
    setSelectedSize: (size: ProductSize) => void;
}

export function useProductDetail(franchiseId: string, productId: string): UseProductDetailReturn {
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

        let mounted = true;

        const loadProductDetail = async () => {
            setLoading(true);

            try {
                const data = await getProductDetail(franchiseId, productId);
                if (!mounted) return;

                setProduct(data);
                setSelectedSize(data?.sizes?.[0] ?? null);

                if (!data?.is_have_topping) {
                    setToppingOptions([]);
                    return;
                }

                const menu = await getMenuByFranchise(franchiseId, "");
                if (!mounted) return;

                const toppings = (menu ?? [])
                    .filter((category) => category.category_name?.toLowerCase().includes("topping"))
                    .flatMap((category) => category.products)
                    .map((item) => {
                        const firstAvailableSize = item.sizes.find((size) => size.is_available) ?? item.sizes[0];
                        if (!firstAvailableSize) return null;

                        return {
                            product_id: item.product_id,
                            product_franchise_id: firstAvailableSize.product_franchise_id,
                            name: item.name,
                            price: firstAvailableSize.price,
                            image_url: item.image_url,
                        };
                    })
                    .filter((item): item is ProductToppingOption => item !== null);

                setToppingOptions(toppings);
            } catch (err) {
                console.error("[useProductDetail] Failed to load product:", err);
                if (mounted) {
                    setProduct(null);
                    setSelectedSize(null);
                    setToppingOptions([]);
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadProductDetail();

        return () => {
            mounted = false;
        };
    }, [productId, franchiseId]);

    return { product, loading, selectedSize, toppingOptions, setSelectedSize };
}
