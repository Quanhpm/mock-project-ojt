import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useCartStore } from "@/stores/cart.store";
import products from "@/mockdata/products.json"

interface ItemType {
    id: number;
    SKU: string;
    name: string;
    description: string;
    content: string;
    image_url: string;
    category_id: number;
    min_price: number;
    max_price: number;
    is_active: boolean;
    is_deleted: boolean;
}

function Item() {
    const { id } = useParams<{ id: string }>();
    console.log("param", id);
    const product = products.find(u => u.id === Number(id));
    const navigate = useNavigate();

    if (!product) {
        return <div>Product not found</div>;
    }

    const [qty, setQty] = useState(1);
    const dec = () => setQty((q) => Math.max(1, q - 1));
    const inc = () => setQty((q) => q + 1);

    const addItem = useCartStore((s) => s.addItem);
    const handleAddToCart = () => {
        addItem(
            {
                id: product.id,            
                productId: product.id,     
                name: product.name,
                price: product.min_price,   
                image_url: product.image_url,
                SKU: product.SKU,
            },
            qty 
        );
    };

    const getBaseName = (name: string) => {
        return name.replace(/size\s*[A-Z]/i, "").trim()
    }

    const getSameProductsDifferentSize = (
        currentProduct: ItemType,
        allProducts: ItemType[]
    ) => {
        const baseName = getBaseName(currentProduct.name)

        return allProducts.filter(
            (p) =>
                getBaseName(p.name) === baseName
        )
    }

    const otherSizes = getSameProductsDifferentSize(
        product,
        products as ItemType[]
    );


    return (
        <div className="min-h-screen w-full px-4 py-8 md:px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
                <div className="space-y-6">
                    <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
                        <img
                            src={product?.image_url}
                            alt={product?.name}
                            className="w-full h-full object-cover object-center"
                        />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-3xl font-bold text-gray-900">{product?.name}</h3>
                        <h5 className="text-2xl font-semibold text-orange-600">
                            {product?.min_price?.toLocaleString()}đ
                        </h5>
                        <p className="text-gray-600 leading-relaxed">
                            {product?.description}
                            <span className="block mt-2 text-sm text-gray-400 italic">
                                {product?.content}
                            </span>
                        </p>
                    </div>
                </div>

                {/* CỘT PHẢI: Chọn Size và Thêm vào giỏ (Chiều cao linh hoạt theo nội dung) */}
                <div className="flex flex-col gap-6 p-6 border border-gray-100 rounded-2xl shadow-sm bg-white">
                    {otherSizes.length > 1 && (
                        <div>
                            <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Chọn kích thước</span>
                            <div className="flex flex-wrap gap-3 mt-4">
                                {otherSizes.map((p) => {
                                    const isActive = p.id === product.id;
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => navigate(`/product/${p.id}`)}
                                            className={`px-6 py-2 rounded-full border-2 transition-all font-medium cursor-pointer
                                    ${isActive
                                                    ? "border-black bg-black text-white shadow-md"
                                                    : "border-gray-200 hover:border-gray-400 text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            Size {p.name.split("size")[1]}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div>
                        <span className="text-sm font-medium uppercase tracking-wider text-gray-500">Số lượng:</span>
                        <div className="flex items-center gap-3 mt-4">
                            <button
                                type="button"
                                onClick={dec}
                                className="h-10 w-10 rounded-full border"
                            >
                                -
                            </button>

                            <span className="min-w-8 text-center font-semibold">{qty}</span>

                            <button
                                type="button"
                                onClick={inc}
                                className="h-10 w-10 rounded-full border"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleAddToCart}
                        className="w-full mt-auto bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] cursor-pointer text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Item