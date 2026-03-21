interface StoreSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  submittedQuery: string;
  resultCount: number;
  isSearching?: boolean;
}

export function StoreSearch({ value, onChange, onSearch, submittedQuery, resultCount, isSearching }: StoreSearchProps) {
  return (
    <>
      <div className="max-w-md mx-auto flex gap-2">
        {/* Input wrapper */}
        <div className="relative flex-1">
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
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            placeholder="Tìm theo tên hoặc địa chỉ..."
            className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/30 transition-all"
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

        {/* Search button */}
        <button
          onClick={onSearch}
          disabled={isSearching}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[var(--cf-primary)] text-white text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {isSearching
            ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : 'Tìm kiếm'
          }
        </button>
      </div>

      {submittedQuery && (
        <p className="text-sm text-[var(--cf-secondary)] mt-2">
          {resultCount > 0
            ? `Tìm thấy ${resultCount} cửa hàng`
            : 'Không tìm thấy cửa hàng nào'}
        </p>
      )}
    </>
  );
}
