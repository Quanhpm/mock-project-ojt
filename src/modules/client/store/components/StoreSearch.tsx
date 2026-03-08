interface StoreSearchProps {
  value: string;
  onChange: (value: string) => void;
  resultCount: number;
}

export function StoreSearch({ value, onChange, resultCount }: StoreSearchProps) {
  return (
    <>
      <div className="max-w-md mx-auto relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--cf-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tìm theo tên hoặc địa chỉ..."
          className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/30 transition-all"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      {value && (
        <p className="text-sm text-[var(--cf-secondary)] mt-2">
          {resultCount > 0
            ? `Tìm thấy ${resultCount} cửa hàng`
            : 'Không tìm thấy cửa hàng nào'}
        </p>
      )}
    </>
  );
}
