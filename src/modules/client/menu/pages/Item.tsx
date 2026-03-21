import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Stores & Hooks
import { useToast } from "@/hooks/use-toast.hook";
import { useProductDetail } from "../hooks/useProductDetail";
import { addCartItem } from "@/apis/endpointsCLIENT/cart.api";
import { HttpError } from "@/apis";

// API types
import { ROUTER_URL } from "@/routes/router.const";
import { useClientAuthStore } from "../../auth-client/stores/client-auth.store";

// --- COMPONENT ---
function Item() {
    const location = useLocation();
    const franchiseId: string = (location.state as { franchiseId?: string; productId?: string })?.franchiseId ?? '';
    const productId: string = (location.state as { franchiseId?: string; productId?: string })?.productId ?? '';
    const navigate = useNavigate();
    const { success, error } = useToast();
    const isLoggedIn = useClientAuthStore((state) => state.isLoggedIn);
    const user = useClientAuthStore((state) => state.user);

    const { product, loading, selectedSize, toppingOptions, setSelectedSize } = useProductDetail(franchiseId, productId ?? '');

    // Option State
    const [qty, setQty] = useState(1);
    const [selectedToppings, setSelectedToppings] = useState<typeof toppingOptions>([]);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    const [activeImg, setActiveImg] = useState(0);
    const images = product
        ? [product.image_url, ...(product.images_url ?? []).filter(u => u !== product.image_url)]
        : [];

    const toppingsPrice = useMemo(() => {
        return selectedToppings.reduce((sum, topping) => sum + topping.price, 0);
    }, [selectedToppings]);

    const totalPrice = useMemo(() => {
        if (!selectedSize) return 0;
        return (selectedSize.price + toppingsPrice) * qty;
    }, [selectedSize, toppingsPrice, qty]);

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

    if (loading) {
        return (
            <div className="p-10 text-center font-medium text-[var(--cf-primary)]">
                Đang tải...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="p-10 text-center font-medium text-[var(--cf-primary)]">
                Product not found
            </div>
        );
    }

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isAddingToCart) return;

        if (!isLoggedIn) {
            error('Yêu cầu đăng nhập', 'Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
            setTimeout(() => {
                navigate(ROUTER_URL.CLIENT_ROUTER.LOGIN, {
                    state: { from: ROUTER_URL.MENU }
                });
            }, 1500);
            return;
        }

        if (!product || !selectedSize) return;

        if (!franchiseId) {
            error('Thiếu thông tin cửa hàng', 'Không xác định được chi nhánh để thêm vào giỏ hàng');
            return;
        }

        const address = user?.address?.trim() ?? '';
        const phone = user?.phone?.trim() ?? '';

        if (!address || !phone) {
            error('Thiếu thông tin giao hàng', 'Vui lòng cập nhật địa chỉ và số điện thoại trong hồ sơ');
            return;
        }

        setIsAddingToCart(true);

        try {
            await addCartItem({
                franchise_id: franchiseId,
                product_franchise_id: selectedSize.product_franchise_id,
                quantity: qty,
                address,
                phone,
                options: selectedToppings.map((topping) => ({
                    product_franchise_id: topping.product_franchise_id,
                    quantity: 1,
                })),
                message: selectedToppings.length
                    ? `Topping: ${selectedToppings.map((topping) => topping.name).join(', ')}`
                    : undefined,
            });

            success('Đã thêm vào giỏ hàng', `${product.name} đã được thêm vào giỏ hàng`);
            navigate("/menu");
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

    return (
        <div className="h-full bg-[var(--cf-bg)] px-8 py-4 flex items-center justify-center">
            <main className="w-full grid grid-cols-1 md:grid-cols-10 gap-8 items-start">
                {/* LEFT COLUMN: Image Slider */}
                <section className="md:col-span-3 w-full flex flex-col gap-3">
                    {/* Main image */}
                    <div className="w-full aspect-square rounded-[2rem] overflow-hidden bg-white relative">
                        <img
                            key={activeImg}
                            src={images[activeImg]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white transition cursor-pointer text-lg font-bold"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={() => setActiveImg(i => (i + 1) % images.length)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center shadow hover:bg-white transition cursor-pointer text-lg font-bold"
                                >
                                    ›
                                </button>
                            </>
                        )}
                    </div>
                    {/* Thumbnails - horizontal strip below */}
                    {images.length > 0 && (
                        <div className="flex flex-row gap-2 justify-center flex-wrap">
                            {images.map((url, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImg(idx)}
                                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition cursor-pointer flex-shrink-0 ${activeImg === idx ? 'border-[var(--cf-primary)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* RIGHT COLUMN: Product Info & Options */}
                <section className="md:col-span-7 w-full">
                    <div className="bg-[var(--cf-surface)] p-8 rounded-[2rem] shadow-sm space-y-8 border border-white/40">
                        <header className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black text-[var(--cf-primary)] uppercase tracking-tight">
                                {product.name}
                            </h1>
                            <p className="text-[var(--cf-primary)] italic opacity-80 text-lg">
                                {product.description}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-[var(--cf-primary)]/70">
                                <span className="font-medium">{product.category_name}</span>
                                <span className="opacity-40">|</span>
                                <span className="font-mono">SKU: {product.SKU}</span>
                            </div>
                            <div className="text-3xl font-black text-[var(--cf-primary)]">
                                {selectedSize ? selectedSize.price.toLocaleString() : 0}đ
                            </div>
                        </header>

                        {/* Options Container */}
                        <div className="space-y-5">
                            {/* Size Selection */}
                            <section className="space-y-2">
                                <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                                    Kích thước
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.sizes.map((s) => {
                                        const active = selectedSize?.product_franchise_id === s.product_franchise_id;
                                        return (
                                            <button
                                                key={s.product_franchise_id}
                                                onClick={() => setSelectedSize(s)}
                                                disabled={!s.is_available}
                                                className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${active
                                                    ? "bg-[var(--cf-primary)] text-white shadow-md"
                                                    : "bg-white/60 border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-white"
                                                    }`}
                                            >
                                                {s.size} — {s.price.toLocaleString()}đ
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {product.is_have_topping && toppingOptions.length > 0 && (
                                <section className="space-y-2">
                                    <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                                        Topping
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {toppingOptions.map((topping) => {
                                            const active = selectedToppings.some((item) => item.product_franchise_id === topping.product_franchise_id);

                                            return (
                                                <button
                                                    key={topping.product_franchise_id}
                                                    onClick={() => toggleTopping(topping.product_franchise_id)}
                                                    className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer ${active
                                                        ? "bg-[var(--cf-primary)] text-white shadow-md"
                                                        : "bg-white/60 border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-white"
                                                        }`}
                                                >
                                                    {topping.name} + {topping.price.toLocaleString('vi-VN')}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}


                        </div>

                        {/* Footer Section: Total & CTA */}
                        <footer className="space-y-6">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold text-[var(--cf-primary)]/60 uppercase tracking-widest mb-1">
                                        Tổng cộng
                                    </p>
                                    <p className="text-4xl font-black text-[var(--cf-primary)]">
                                        {totalPrice.toLocaleString()}đ
                                    </p>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center bg-white rounded-full p-1 shadow-inner border border-[var(--cf-primary)]/10">
                                    <button
                                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--cf-surface)] text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-xl cursor-pointer"
                                    >
                                        −
                                    </button>   
                                    <input
                                        type="number"
                                        value={qty}
                                        onChange={(e) => setQty(Math.min(999, Math.max(1, parseInt(e.target.value) || 1)))}
                                        className="w-16 text-center font-black text-lg text-[var(--cf-primary)] focus:outline-none"
                                    />
                                    <button
                                        onClick={() => setQty((q) => q + 1)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--cf-surface)] text-[var(--cf-primary)] hover:bg-[var(--cf-primary)] hover:text-white transition-all font-black text-xl cursor-pointer"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAddingToCart}
                                className="w-full py-5 bg-[var(--cf-primary)] text-white rounded-2xl font-bold text-lg uppercase tracking-wider shadow-lg hover:scale-101 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                            </button>
                        </footer>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Item;
