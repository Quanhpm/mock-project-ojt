import React from 'react'

interface ProductCardProps {
    imageSrc: string;
    name: string;
    price: number | string;
}

function Cart({ imageSrc, name, price }: ProductCardProps) {
  return (
        <div className="max-w-sm overflow-hidden rounded-xl border border-secondary bg-surface-light shadow-sm transition-all duration-300 hover:scale-90">
            {/* Image Container */}
            <div className="aspect-square w-full overflow-hidden bg-accent-light">
                <img
                    src={imageSrc}
                    alt={name}
                    className="h-full w-full object-cover object-center transition-transform duration-500"
                />
            </div>

            {/* Content Section */}
            <div className="p-5 text-left">
                <h3 className="truncate text-lg font-bold text-primary">
                    {name}
                </h3>
                
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider text-secondary">Giá bán</span>
                        <p className="text-xl font-extrabold text-primary">
                            {typeof price === 'number' ? price.toLocaleString() : price}
                            <span className="ml-1 text-sm">đ</span>
                        </p>
                    </div>

                    <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-secondary active:scale-95">
                        Order Now
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Cart
