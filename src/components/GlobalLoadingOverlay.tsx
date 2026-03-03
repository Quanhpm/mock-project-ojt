import { useLoadingStore } from "@/stores/loading.store";
import { Coffee } from "lucide-react";

/**
 * Overlay loading toàn màn hình, hiển thị khi có bất kỳ API call nào đang chạy.
 * Đặt trong AdminLayout để chỉ bao phủ vùng admin content.
 * Dùng pointer-events-none khi ẩn để không chặn tương tác UI.
 */
export function GlobalLoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.isLoading);

  return (
    <div
      className={`
        fixed inset-0 z-9999
        flex items-center justify-center
        bg-white/40 backdrop-blur-[2px]
        transition-opacity duration-200
        ${isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
      `}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Spinner vòng tròn */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-amber-600">
            <Coffee size={28} />
          </div>
        </div>
        <p className="text-sm font-medium text-amber-800 animate-pulse">
          Đang tải...
        </p>
      </div>
    </div>
  );
}
