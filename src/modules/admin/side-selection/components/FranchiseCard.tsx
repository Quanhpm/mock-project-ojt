import type { UserRoleItem } from '@/apis/endpoints/auth.api'

interface FranchiseCardProps {
  userRole: UserRoleItem
  switching: string | null
  onSelect: (franchiseId: string) => void
}

const getRoleName = (role: string): string => {
  switch (role) {
    case 'MANAGER': return 'Quản lý ca'
    case 'STAFF': return 'Nhân viên bán hàng'
    default: return 'Quản trị viên'
  }
}

export const FranchiseCard = ({ userRole, switching, onSelect }: FranchiseCardProps) => {
  const franchiseId = userRole.franchise_id!
  const isLoading = switching === franchiseId

  const handleClick = () => {
    onSelect(franchiseId)
  }

  return (
    <div className="group relative flex flex-col sm:flex-row items-center gap-6 bg-white border-2 border-border-brown hover:shadow-xl cursor-pointer rounded-2xl p-8 transition-all duration-300">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-primary transition-colors rounded-l-2xl" />

      {/* Icon */}
      <div className="shrink-0">
        <div className="flex items-center justify-center w-20 h-20 rounded-xl bg-tertiary/20 text-primary">
          <span className="material-symbols-outlined text-4xl">storefront</span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-grow flex flex-col w-full text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Đang hoạt động
          </span>
        </div>
        <h3 className="text-xl font-bold text-primary">
          {userRole.franchise_name}
        </h3>
        <p className="text-sm font-medium mt-2 text-primary/60">
          Vai trò: {getRoleName(userRole.role)}
        </p>
      </div>

      {/* Action Button */}
      <div className="shrink-0 mt-4 sm:mt-0">
        <button
          onClick={handleClick}
          disabled={!!switching}
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-md group-hover:translate-x-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-x-0"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Đang chọn...
            </>
          ) : (
            <>
              Chọn chi nhánh
              <span className="material-symbols-outlined text-xl ml-2">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
