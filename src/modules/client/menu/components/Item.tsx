import { useNavigate } from "react-router-dom";

interface ItemProps {
    id: string | number; // Nhớ thêm id vào props để điều hướng
    name: string;
    price: number;
}

function Item({ id, name, price }: ItemProps) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/product/${id}`)}
            // Tinh chỉnh: max-w-[220px] để card không bị quá to, p-3 giảm khoảng cách
            className="group cursor-pointer flex w-full max-w-[200px] flex-col rounded-xl border border-slate-100 bg-[var(--cf-secondary)] p-3 shadow-sm transition-all hover:scale-90 hover:shadow-lg active:scale-95"
        >
                <h5 className="truncate text-sm font-medium text-white group-hover:text-gray-600">
                    {name}
                </h5>
                <p className="text-white font-bold text-slate-900">
                    {price} ₫
                </p>
        </div>
    );
}

export default Item;