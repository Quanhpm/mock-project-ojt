import { useState, useEffect } from "react";
import { getProductDetail, type ProductDetailResponse, type ProductSize } from "@/apis/endpointsCLIENT/productDetail.api";

interface UseProductDetailReturn {
    product: ProductDetailResponse | null;
    loading: boolean;
    selectedSize: ProductSize | null;
    setSelectedSize: (size: ProductSize) => void;
}

export function useProductDetail(franchiseId: string, productId: string): UseProductDetailReturn {
    const [product, setProduct] = useState<ProductDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

    useEffect(() => {
        if (!productId || !franchiseId) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getProductDetail(franchiseId, productId)
            .then((data) => {
                setProduct(data);
                if (data?.sizes?.length) setSelectedSize(data.sizes[0]);
            })
            .catch((err) => {
                console.error("[useProductDetail] Failed to load product:", err);
                setProduct(null);
            })
            .finally(() => setLoading(false));
    }, [productId, franchiseId]);

    return { product, loading, selectedSize, setSelectedSize };
}
