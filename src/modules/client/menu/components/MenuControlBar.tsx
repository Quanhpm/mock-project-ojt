import type { FranchiseResponse } from '@/apis/endpointsCLIENT/client.api';

interface MenuControlBarProps {
  search: string;
  franchiseId: string;
  franchises: FranchiseResponse[];
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onFranchiseChange: (franchiseId: string) => void;
}

function MenuControlBar({
  search,
  franchiseId,
  franchises,
  onSearchChange,
  onSearchKeyDown,
  onFranchiseChange,
}: MenuControlBarProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-[28px] border border-[var(--cf-secondary)]/15 bg-white/70 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.06)] backdrop-blur-sm md:grid-cols-[1fr_1.2fr] md:gap-6 md:p-6">
      <div className="flex flex-col justify-center gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cf-secondary)]">
          <span className="material-icons-outlined text-base text-[var(--cf-primary)]">search</span>
          Tìm kiếm sản phẩm
        </label>
        <input
          type="text"
          placeholder="Nhập tên sản phẩm..."
          value={search}
          onChange={onSearchChange}
          onKeyDown={onSearchKeyDown}
          className="h-14 w-full rounded-2xl border border-[var(--cf-secondary)]/25 bg-white px-5 text-[var(--cf-dark)] shadow-sm transition-all placeholder:text-[var(--cf-secondary)]/80 focus:border-[var(--cf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/20"
        />
      </div>

      <div className="flex flex-col justify-center gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cf-secondary)]">
          <span className="material-icons-outlined text-base text-[var(--cf-primary)]">storefront</span>
          Chọn chi nhánh
        </label>
        <select
          value={franchiseId}
          onChange={(e) => onFranchiseChange(e.target.value)}
          className="h-14 cursor-pointer rounded-2xl border border-[var(--cf-secondary)]/25 bg-white px-5 text-[var(--cf-dark)] shadow-sm transition-all focus:border-[var(--cf-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--cf-primary)]/20"
        >
          {franchises.map((franchise) => (
            <option key={franchise.id} value={franchise.id}>
              {franchise.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default MenuControlBar;
