import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Stores & Hooks
import { useCartStore } from "@/stores/cart.store";
import { useToast } from "@/hooks/use-toast.hook";
import type { Topping, SugarLevel, IceLevel, Size } from "@/stores/cart.store";

// Utils & Data
import products from "@/mockdata/products.json";
import { slugify } from "@/utils/slugify.util";

// --- CONSTANTS ---
const SIZE_OPTIONS: Size[] = [
    { code: "S", label: "Size S", bonusPrice: 0 },
    { code: "M", label: "Size M", bonusPrice: 5000 },
    { code: "L", label: "Size L", bonusPrice: 10000 },
];

const TOPPINGS: Topping[] = [
    { code: "PEARL", name: "Trân châu", price: 5000 },
    { code: "PUDDING", name: "Pudding", price: 7000 },
    { code: "JELLY", name: "Thạch", price: 4000 },
];

const SUGAR_LEVELS: { label: string; value: SugarLevel }[] = [
    { label: "0%", value: 0 },
    { label: "30%", value: 30 },
    { label: "50%", value: 50 },
    { label: "70%", value: 70 },
    { label: "100%", value: 100 },
];

const ICE_LEVELS: { label: string; value: IceLevel }[] = [
    { label: "0%", value: 0 },
    { label: "30%", value: 30 },
    { label: "50%", value: 50 },
    { label: "70%", value: 70 },
    { label: "100%", value: 100 },
];

// --- COMPONENT ---
function Item() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { success } = useToast();
    const addItem = useCartStore((s) => s.addItem);

    // State
    const [size, setSize] = useState<Size>(SIZE_OPTIONS[0]);
    const [sugar, setSugar] = useState<SugarLevel>(50);
    const [ice, setIce] = useState<IceLevel>(50);
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
        addItem({
            id: Date.now(),
            productId: product.id,
            name: product.name,
            price: product.min_price,
            image_url: product.image_url,
            SKU: product.SKU,
            options: { size, sugar, ice, toppings },
            extras_total: extrasTotal,
        }, qty);

        success("Thêm vào giỏ hàng thành công!");
        navigate("/menu");
    };

    return (
        <div className="min-h-screen w-full px-4 py-10 md:px-8 lg:px-16 bg-[var(--cf-bg)]">

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* LEFT COLUMN: Image */}
                <div className="flex w-full min-h-[400px]">
                    <div className="w-full overflow-hidden rounded-[2.5rem] bg-white shadow-2xl border-4 border-white">
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: Options */}
                <div className="flex flex-col gap-6 p-6 md:p-10 rounded-[2.5rem] bg-[var(--cf-surface)] shadow-lg border border-[var(--cf-accent-light)]/30">
                    <header className="space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl md:text-4xl font-black text-[var(--cf-primary)] uppercase">
                                {product.name}
                            </h1>
                            <span className="bg-[var(--cf-accent-light)] text-[var(--cf-primary)] px-3 py-1 rounded-full text-xs font-bold uppercase">
                                Bestseller
                            </span>
                        </div>
                        <div className="text-3xl font-black text-[var(--cf-primary)]">
                            {product.min_price.toLocaleString()}đ
                        </div>
                        <div className="bg-[var(--cf-bg)]/50 p-5 rounded-3xl border border-[var(--cf-accent-light)]/50 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-[var(--cf-secondary)] opacity-50"></div>
                            <p className="text-[var(--cf-primary)]/80 italic text-sm italic">"{product.description}"</p>
                            <span className="block mt-3 text-[10px] uppercase font-bold text-[var(--cf-secondary)] tracking-widest">
                                {product.content}
                            </span>
                        </div>
                    </header>

                    <main className="space-y-6">
                        {/* Size Selector */}
                        <section className="space-y-3">
                            <Label text="Kích cỡ" />
                            <div className="flex p-1 bg-[var(--cf-bg)]/40 rounded-2xl gap-1">
                                {SIZE_OPTIONS.map((s) => (
                                    <OptionButton
                                        key={s.code}
                                        label={s.label}
                                        active={size.code === s.code}
                                        onClick={() => setSize(s)}
                                        sub={s.bonusPrice > 0 ? `(+${s.bonusPrice / 1000}k)` : null}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Sugar Selector */}
                        <section className="space-y-3">
                            <Label text="Mức đường" />
                            <div className="flex p-1 bg-[var(--cf-bg)]/40 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
                                {SUGAR_LEVELS.map((s) => (
                                    <OptionButton
                                        key={s.value}
                                        label={s.label}
                                        active={sugar === s.value}
                                        onClick={() => setSugar(s.value)}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Ice Selector */}
                        <section className="space-y-3">
                            <Label text="Lượng đá" />
                            <div className="flex p-1 bg-[var(--cf-bg)]/40 rounded-2xl gap-1">
                                {ICE_LEVELS.map((i) => (
                                    <OptionButton
                                        key={i.value}
                                        label={i.label}
                                        active={ice === i.value}
                                        onClick={() => setIce(i.value)}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Toppings Selector */}
                        <section className="space-y-3">
                            <Label text="Toppings thêm" />
                            <div className="flex flex-wrap gap-2">
                                {TOPPINGS.map((t) => (
                                    <ToppingButton
                                        key={t.code}
                                        topping={t}
                                        isActive={toppings.some((x) => x.code === t.code)}
                                        onToggle={() => toggleTopping(t)}
                                    />
                                ))}
                            </div>
                        </section>
                    </main>

                    {/* Footer Actions */}
                    <footer className="mt-auto pt-8 border-t border-[var(--cf-accent-light)]/30 space-y-5">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <span className="text-[10px] font-black text-[var(--cf-secondary)] uppercase">Tổng cộng</span>
                                <div className="text-2xl font-black text-[var(--cf-primary)]">{totalPrice.toLocaleString()}đ</div>
                            </div>

                            <div className="flex items-center bg-[var(--cf-bg)]/60 rounded-full p-1 border border-[var(--cf-accent-light)]">
                                <CounterBtn onClick={() => setQty(q => Math.max(1, q - 1))} icon="−" />
                                <span className="px-5 font-black text-[var(--cf-primary)] text-lg min-w-[50px] text-center">{qty}</span>
                                <CounterBtn onClick={() => setQty(q => q + 1)} icon="+" />
                            </div>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-[var(--cf-primary)] hover:bg-[var(--cf-dark)] text-white font-black py-5 rounded-3xl transition-all shadow-xl flex items-center justify-center gap-3 text-sm tracking-widest group"
                        >
                            THÊM VÀO GIỎ HÀNG
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS (Tách ra để code chính gọn hơn) ---

const Label = ({ text, sub }: { text: string; sub?: string }) => (
    <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--cf-secondary)]">{text}</span>
        {sub && <span className="text-[10px] font-bold text-[var(--cf-primary)]/50 uppercase">{sub}</span>}
    </div>
);

const OptionButton = ({ label, active, onClick, sub }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${active ? "bg-[var(--cf-dark)] text-white shadow-md" : "text-[var(--cf-primary)] hover:bg-[var(--cf-accent-light)]/50"
            }`}
    >
        {label} {sub && <span className="block text-[8px] opacity-70">{sub}</span>}
    </button>
);

const ToppingButton = ({ topping, isActive, onToggle }: any) => (
    <button
        onClick={onToggle}
        className={`px-5 py-2.5 rounded-full border-2 transition-all font-bold text-xs flex items-center gap-2 ${isActive ? "bg-[var(--cf-primary)] border-[var(--cf-primary)] text-white" : "border-[var(--cf-secondary)]/30 text-[var(--cf-primary)]"
            }`}
    >
        {topping.name} <span className="text-[9px] opacity-70">+{topping.price / 1000}k</span>
    </button>
);

const CounterBtn = ({ onClick, icon }: any) => (
    <button
        onClick={onClick}
        className="w-10 h-10 rounded-full bg-white text-[var(--cf-primary)] font-black flex items-center justify-center hover:bg-[var(--cf-accent-light)] shadow-sm active:scale-90"
    >
        {icon}
    </button>
);

export default Item;