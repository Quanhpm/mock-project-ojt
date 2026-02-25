import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Stores & Hooks
import { useCartStore } from "@/stores/cart.store";
import { useToast } from "@/hooks/use-toast.hook";
import type { Topping, SugarOption, IceOption, Size } from "@/types/product-option.type";

// Utils & Data
import products from "@/mockdata/products.json";
import { slugify } from "@/utils/slugify.util";

// Constants
import {
    SIZE_OPTIONS,
    TOPPINGS,
    SUGAR_LEVELS,
    ICE_LEVELS,
} from "@/types/product-option.type";

// --- COMPONENT ---
function Item() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { success } = useToast();
    const addItem = useCartStore((s) => s.addItem);

    // State
    const [size, setSize] = useState<Size>(SIZE_OPTIONS[0]);
    const [sugar, setSugar] = useState<SugarOption>(SUGAR_LEVELS[0]);
    const [ice, setIce] = useState<IceOption>(ICE_LEVELS[0]);
    const [toppings, setToppings] = useState<Topping[]>([]);
    const [qty, setQty] = useState(1);

    // Find Product
    const product = products.find((p) => slugify(p.name) === slug);

    // Memoized Totals
    const { extrasTotal, totalPrice } = useMemo(() => {
        if (!product) return { extrasTotal: 0, totalPrice: 0 };

        const sizeExtra = size?.bonusPrice ?? 0;
        const toppingExtra = toppings.reduce((sum, t) => sum + t.price, 0);
        const extrasTotal = sizeExtra + toppingExtra;
        const totalPrice = (product.min_price + extrasTotal) * qty;

        return { extrasTotal, totalPrice };
    }, [product, size, toppings, qty]);

    // Handlers
    if (!product) {
        return (
            <div className="p-10 text-center font-medium text-[var(--cf-primary)]">
                Product not found
            </div>
        );
    }

    const toggleTopping = (t: Topping) => {
        setToppings((prev) =>
            prev.some((x) => x.code === t.code)
                ? prev.filter((x) => x.code !== t.code)
                : [...prev, t]
        );
    };

    const handleAddToCart = () => {
        addItem(
            {
                productId: product.id,
                name: product.name,
                price: product.min_price,
                image_url: product.image_url,
                SKU: product.SKU,
                options: { size, sugar, ice, toppings },
                extras_total: extrasTotal,
            },
            qty
        );

        success("Thêm vào giỏ hàng thành công!");
        navigate("/menu");
    };

    return (
        <div className="h-full bg-[var(--cf-bg)] px-8 py-4 flex items-center justify-center">
            <main className="w-full grid grid-cols-1 md:grid-cols-10 gap-8 items-start">
                {/* LEFT COLUMN: Image */}
                <section className="md:col-span-3 w-full">
                    <div className="aspect-square w-full rounded-[2rem] overflow-hidden bg-white">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
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
                            <div className="text-3xl font-black text-[var(--cf-primary)]">
                                {product.min_price.toLocaleString()}đ
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
                                    {SIZE_OPTIONS.map((s) => {
                                        const active = size.code === s.code;
                                        return (
                                            <button
                                                key={s.code}
                                                onClick={() => setSize(s)}
                                                className={`px-6 py-2.5 rounded-full font-medium transition-all cursor-pointer ${active
                                                    ? "bg-[var(--cf-primary)] text-white shadow-md"
                                                    : "bg-white/60 border border-[var(--cf-primary)] text-[var(--cf-primary)] hover:bg-white"
                                                    }`}
                                            >
                                                {s.label}{" "}
                                                {s.bonusPrice > 0 ? `+${s.bonusPrice / 1000}k` : ""}
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Sugar Level Selection */}
                                <section className="space-y-2">
                                    <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                                        Mức đường
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {SUGAR_LEVELS.map((s) => {
                                            const active = sugar.value === s.value;
                                            return (
                                                <button
                                                    key={s.value}
                                                    onClick={() => setSugar(s)}
                                                    className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${active
                                                        ? "bg-[var(--cf-primary)] text-white shadow-md"
                                                        : "bg-white/60 text-[var(--cf-primary)] border border-[var(--cf-primary)] hover:bg-white"
                                                        }`}
                                                >
                                                    {s.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Ice Level Selection */}
                                <section className="space-y-2">
                                    <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                                        Mức đá
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {ICE_LEVELS.map((i) => {
                                            const active = ice.value === i.value;
                                            return (
                                                <button
                                                    key={i.value}
                                                    onClick={() => setIce(i)}
                                                    className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${active
                                                        ? "bg-[var(--cf-primary)] text-white shadow-md"
                                                        : "bg-white/60 text-[var(--cf-primary)] border border-[var(--cf-primary)] hover:bg-white"
                                                        }`}
                                                >
                                                    {i.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </section>
                            </div>


                            {/* Toppings Selection */}
                            <section className="space-y-2">
                                <h3 className="font-bold text-[var(--cf-primary)] uppercase text-sm tracking-wider">
                                    Toppings
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {TOPPINGS.map((t) => {
                                        const active = toppings.some((x) => x.code === t.code);
                                        return (
                                            <button
                                                key={t.code}
                                                onClick={() => toggleTopping(t)}
                                                className={`px-5 py-2.5 rounded-xl border transition-all cursor-pointer ${active
                                                    ? "border-[var(--cf-primary)] bg-[var(--cf-primary)] text-white font-bold shadow-sm"
                                                    : "border-[var(--cf-primary)] bg-white/60 text-[var(--cf-primary)] font-medium hover:bg-white"
                                                    }`}
                                            >
                                                {t.name}{" "}
                                                <span className="text-xs opacity-70">
                                                    +{t.price / 1000}k
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
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
                                        onChange={(e) => setQty(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
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
                                className="w-full py-5 bg-[var(--cf-primary)] text-white rounded-2xl font-bold text-lg uppercase tracking-wider shadow-lg hover:scale-101 active:scale-[0.98] transition-all cursor-pointer"
                            >
                                Thêm vào giỏ hàng
                            </button>
                        </footer>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Item;