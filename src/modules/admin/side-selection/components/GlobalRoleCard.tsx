interface GlobalRoleCardProps {
  onSelect: () => void
}

export const GlobalRoleCard = ({ onSelect }: GlobalRoleCardProps) => {
  return (
    <div className="group relative flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 hover:shadow-xl cursor-pointer rounded-2xl p-8 transition-all duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-amber-600 transition-colors rounded-l-2xl" />

      {/* Icon */}
      <div className="shrink-0">
        <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-amber-100 text-amber-700">
          <span className="material-symbols-outlined text-4xl">admin_panel_settings</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow flex flex-col w-full text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-200 text-amber-800">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            Quyền toàn hệ thống
          </span>
        </div>
        <h3 className="text-xl font-bold text-amber-900">
          Quản lý toàn bộ hệ thống
        </h3>
        <p className="text-sm font-medium mt-2 text-amber-700">
          Vai trò: Quản trị viên cấp cao
        </p>
      </div>

      {/* Action Button */}
      <div className="shrink-0 mt-4 sm:mt-0">
        <button
          onClick={onSelect}
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-base font-semibold transition-all shadow-md group-hover:translate-x-1"
        >
          Chọn quyền này
          <span className="material-symbols-outlined text-xl ml-2">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}
