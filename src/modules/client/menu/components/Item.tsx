import { useNavigate } from "react-router-dom";

interface ItemProps {
    id: string | number;
    name: string;
    price: string;
}

function Item({ id, name, description, imageUrl, price }: ItemProps) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/product/${id}`)}
            className="group cursor-pointer flex flex-col rounded-xl border border-[#B08968]/30 bg-surface-light overflow-hidden shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95"
        >
            {/* Product Image */}
            <div className="relative w-full aspect-square overflow-hidden bg-background-light">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#B08968]">
                        <span className="material-icons-outlined text-5xl">image</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4 flex flex-col gap-2">
                <h5 className="font-bold text-primary text-base line-clamp-1 group-hover:text-[#9C6644] transition-colors">
                    {name}
                </h5>
                <p className="text-white font-bold text-slate-900">
                    {price}
                </p>
        </div>
    );
}

export default Item;