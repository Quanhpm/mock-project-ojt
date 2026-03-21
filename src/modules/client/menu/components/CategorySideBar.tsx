import type { CategoryResponse } from "@/apis/endpointsCLIENT/client.api";

interface CategorySideBarProps {
    item: CategoryResponse
    activeCategory: boolean;
    onClick: (categoryCode: string) => void
}

export function CategorySideBar({ item, activeCategory, onClick}: CategorySideBarProps) {
    return (
        <button
            onClick={() => onClick(item.category_code)}
            className={`group relative mb-3 flex h-14 w-full items-center rounded-xl border border-transparent px-5 text-left text-lg font-bold text-[var(--cf-dark)] shadow-sm transition-all duration-300 hover:border-[var(--cf-primary)]/20 hover:bg-gradient-to-r hover:from-[var(--cf-primary)] hover:to-[var(--cf-dark)] hover:text-white hover:shadow-lg active:scale-[0.99] overflow-hidden
                ${activeCategory
                    ? 'bg-[var(--cf-primary)] !text-white'
                    : ''
                }
                `}>
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--cf-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-full"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--cf-accent-light)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 tracking-wide">{item.category_name}</span>
        </button>
    )
}