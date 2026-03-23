import { memo } from "react";
import { ChevronDown, Loader2, MapPin, Search } from "lucide-react";
import type { OrderFranchiseOption } from "../../models/franchise.models";

interface PosHeaderProps {
  franchiseId: string | null;
  franchiseName: string;
  franchiseOptions: OrderFranchiseOption[];
  searchQuery: string;
  isSwitchingFranchise: boolean;
  onSearchChange: (value: string) => void;
  onSwitchFranchise: (franchiseId: string) => void;
}

export const PosHeader = memo(({
  franchiseId,
  franchiseName,
  franchiseOptions,
  searchQuery,
  isSwitchingFranchise,
  onSearchChange,
  onSwitchFranchise,
}: PosHeaderProps) => {
  return (
    <div className="shrink-0 min-w-0 bg-transparent px-6 pb-2 pt-6">
      <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-4 sm:flex-row sm:items-center">
          {/* Franchise Select */}
          <div className="relative w-full shrink-0 sm:max-w-xs">
            <MapPin
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-amber-700"
            />
            <select
              value={franchiseId ?? ""}
              disabled={isSwitchingFranchise || franchiseOptions.length === 0}
              onChange={(event) => {
                if (event.target.value) {
                  onSwitchFranchise(event.target.value);
                }
              }}
              className="w-full appearance-none rounded-2xl bg-white py-3 pl-12 pr-11 text-sm font-bold text-gray-800 shadow-sm ring-1 ring-black/5 outline-none transition-all focus:ring-4 focus:ring-amber-700/10 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">{franchiseName || "Chọn cửa hàng..."}</option>
              {franchiseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {isSwitchingFranchise ? (
                <Loader2 size={16} className="animate-spin text-amber-700" />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative min-w-0 w-full flex-1 sm:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="block w-full rounded-2xl bg-white py-3 pl-12 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-black/5 outline-none transition-all placeholder:text-gray-400 focus:ring-4 focus:ring-amber-700/10"
              placeholder="Tìm kiếm món ăn..."
              type="text"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default PosHeader;
