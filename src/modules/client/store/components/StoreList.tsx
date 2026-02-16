import type { Store } from '@/types';

interface StoreListProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelect: (store: Store) => void;
}

export const StoreList = ({ stores, selectedStore, onSelect }: StoreListProps) => {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto pr-2 h-full custom-scrollbar">
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(139, 94, 60, 0.25);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #8b5e3c;
          }
        `}
      </style>
      
      {stores.map((store) => {
        const isSelected = selectedStore?.id === store.id;
        return (
          <div
            key={store.id}
            onClick={() => onSelect(store)}
            className={`
              group relative p-6 rounded-xl shadow-sm
              transition-all duration-300 cursor-pointer
              ${
                isSelected
                  ? 'bg-[#FFF8F1] dark:bg-neutral-800 border-l-4 border-[#8b5e3c]'
                  : 'bg-[#FFF8F1] dark:bg-neutral-800/40 border-l-4 border-transparent hover:border-[#8b5e3c]/20 hover:shadow-md hover:scale-[1.02]'
              }
            `}
          >
            <div className="flex flex-col gap-2">
              {isSelected && (
                <span className="text-[#8b5e3c] text-[10px] font-bold uppercase tracking-widest">
                  Cửa hàng đã chọn
                </span>
              )}
              <h3 className="text-[#5C3A21] dark:text-[#FFF8F1] text-xl font-bold">
                {store.name}
              </h3>
              <p className="text-[#8B6A4E] dark:text-[#8B6A4E]/70 text-sm leading-relaxed">
                {store.address}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <svg className="w-4 h-4 text-[#8b5e3c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-[#8b5e3c] font-medium text-sm">
                  {store.phone}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
