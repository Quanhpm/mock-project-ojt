import React from 'react';
import { motion } from 'framer-motion';
import { GripVertical, Package } from 'lucide-react';
import type { EnrichedProductFranchiseItem } from '../hooks/useProductFranchiseList.hook.ts';

interface ProductFranchiseDragOverlayProps {
    product: EnrichedProductFranchiseItem | null;
}

export const ProductFranchiseDragOverlay: React.FC<ProductFranchiseDragOverlayProps> = ({ product }) => {
    if (!product) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            className="w-[320px] rounded-2xl border border-amber-200 bg-white/95 p-4 shadow-2xl backdrop-blur-sm"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    {product.image_url || product.product?.image_url ? (
                        <img
                            src={product.image_url || product.product?.image_url}
                            alt={product.product_name}
                            className="h-full w-full rounded-xl object-cover"
                        />
                    ) : (
                        <Package size={22} />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                        {product.product_name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                        {product.product_sku} • {product.size}
                    </p>
                </div>
                <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
                    <GripVertical size={16} />
                </div>
            </div>
            <p className="mt-3 text-xs font-medium text-amber-700">
                Thả vào một category ở sidebar để assign.
            </p>
        </motion.div>
    );
};

export default ProductFranchiseDragOverlay;
