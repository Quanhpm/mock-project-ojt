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
    <div className="shrink-0 bg-white px-6 pb-2 pt-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative min-w-[280px]">
            <MapPin
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-amber-800"
            />
            <select
              value={franchiseId ?? ""}
              disabled={isSwitchingFranchise || franchiseOptions.length === 0}
              onChange={(event) => {
                if (event.target.value) {
                  onSwitchFranchise(event.target.value);
                }
              }}
              className="w-full appearance-none rounded-lg border border-amber-700 bg-white py-2 pl-10 pr-11 text-sm font-semibold text-amber-800 outline-none transition focus:ring-2 focus:ring-amber-700 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
            >
              <option value="">{franchiseName || "Chọn chi nhánh"}</option>
              {franchiseOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-amber-800">
              {isSwitchingFranchise ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ChevronDown size={16} />
              )}
            </div>
          </div>

          <div className="relative max-w-sm flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-3 text-sm text-gray-900 shadow-sm transition-all focus:border-transparent focus:ring-2 focus:ring-amber-700"
              placeholder="Search menu items..."
              type="text"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default PosHeader;
