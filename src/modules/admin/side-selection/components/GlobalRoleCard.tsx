interface GlobalRoleCardProps {
  onSelect: () => void
  isLoading: boolean
}

export const GlobalRoleCard = ({ onSelect, isLoading }: GlobalRoleCardProps) => {
  return (
    <div className="group relative flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30 hover:shadow-xl cursor-pointer rounded-2xl p-8 transition-all duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary transition-colors rounded-l-2xl" />

      {/* Icon */}
      <div className="shrink-0">
        <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-primary/20 text-primary">
          <span className="material-symbols-outlined text-4xl">shield</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow flex flex-col w-full text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-sm">workspace_premium</span>
            Quyền cao nhất
          </span>
        </div>
        <h3 className="text-xl font-bold text-primary">
          Quản lý toàn hệ thống
        </h3>
        <p className="text-sm font-medium mt-2 text-primary/60">
          Truy cập mọi chức năng và dữ liệu của tất cả chi nhánh
        </p>
      </div>

      {/* Action Button */}
      <div className="shrink-0 mt-4 sm:mt-0">
        <button
          onClick={onSelect}
          disabled={isLoading}
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-md group-hover:translate-x-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-x-0"
        >
          {isLoading ? (
            <>
              <span className="material-symbols-outlined animate-spin text-xl mr-2">progress_activity</span>
              Đang chọn...
            </>
          ) : (
            <>
              Chọn quyền này
              <span className="material-symbols-outlined text-xl ml-2">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
