import { memo, useMemo, useState } from "react";
import { Loader2, Search, Store } from "lucide-react";
import type { OrderFranchiseOption } from "../../models/franchise.models";

interface PosFranchiseSelectionGateProps {
  franchiseOptions: OrderFranchiseOption[];
  isLoading: boolean;
  onSelectFranchise: (franchiseId: string) => void;
}

export const PosFranchiseSelectionGate = memo(({
  franchiseOptions,
  isLoading,
  onSelectFranchise,
}: PosFranchiseSelectionGateProps) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  const filteredFranchises = useMemo(() => {
    const normalizedKeyword = searchKeyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return franchiseOptions;
    }

    return franchiseOptions.filter((franchise) => {
      const normalizedName = franchise.name.toLowerCase();
      const normalizedCode = franchise.code?.toLowerCase() ?? "";

      return (
        normalizedName.includes(normalizedKeyword) || normalizedCode.includes(normalizedKeyword)
      );
    });
  }, [franchiseOptions, searchKeyword]);

  return (
    <div className="h-full min-h-0 flex-1 overflow-y-auto bg-gray-50 px-6 py-8">
      <div className="mx-auto w-full max-w-6xl rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
              <Store size={14} />
              Quầy Bán Hàng
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900">
              Chọn chi nhánh để bắt đầu phục vụ
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Tài khoản quản trị có thể làm việc trên nhiều chi nhánh. Vui lòng chọn đúng chi nhánh để tải thực đơn, khách hàng và đơn hàng đang phục vụ tại quầy.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tìm kiếm chi nhánh
            </label>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="Nhập tên hoặc mã chi nhánh..."
                className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-amber-600 focus:bg-white"
                type="text"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
              />
            ))}
          </div>
        ) : filteredFranchises.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
            <Store size={32} className="mx-auto text-gray-400" />
            <p className="mt-3 text-base font-semibold text-gray-700">
              Không tìm thấy chi nhánh phù hợp
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Hãy thử lại với từ khóa khác để tiếp tục.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredFranchises.map((franchise) => (
              <button
                key={franchise.id}
                onClick={() => onSelectFranchise(franchise.id)}
                className="group rounded-2xl border border-gray-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-amber-600 hover:shadow-lg hover:shadow-amber-600/10"
                type="button"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-500 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                      <Store size={20} />
                    </span>
                    <h2 className="mt-4 text-lg font-bold text-gray-900">{franchise.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {franchise.code || "Chi nhánh đang hoạt động"}
                    </p>
                  </div>

                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin text-amber-600" />
                  ) : (
                    <span className="text-sm font-semibold text-amber-700">Mở quầy</span>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
                  <span>Không gian làm việc</span>
                  <span className="font-semibold text-gray-700">Bán hàng tại quầy</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default PosFranchiseSelectionGate;
