import { getUsersWithRolesAndFranchises, mockFranchises } from '@/mockdata'

interface UserRole {
  roleId: number
  roleCode: string
  roleName: string
  roleScope: string
  franchiseId: number | null
  franchiseCode: string | null
  franchiseName: string | null
}

interface Franchise {
  id: number
  code: string
  name: string
  logo_url: string
  address: string
  opened_at: string
  closed_at: string | null
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

function FranchiseSelectionPage() {
  // Get current user (mock user ID 1 - Admin)
  const currentUser = getUsersWithRolesAndFranchises()[0]

  const handleSelectFranchise = (franchiseId: number) => {
    console.log('Selected franchise:', franchiseId)
    // TODO: Navigate to dashboard or store franchise selection
  }

  const handleLogout = () => {
    console.log('Logout clicked')
    // TODO: Implement logout logic
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-900 transition-colors duration-300">
      <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6">
        {/* Header */}
        <div className="w-full max-w-[800px] flex flex-col items-center text-center mb-12">
          <div className="mb-6 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-primary text-5xl">
              local_cafe
            </span>
            <h1 className="text-primary text-[32px] font-bold tracking-tight">
              CaféFlow POS
            </h1>
          </div>
          <h2 className="text-secondary text-2xl font-semibold mb-2">
            Xin chào, {currentUser.name} 👋
          </h2>
          <p className="text-primary/70 font-medium text-lg">
            Chọn chi nhánh để bắt đầu ca làm việc
          </p>
        </div>

        {/* Franchise List */}
        <div className="w-full max-w-[800px] flex flex-col gap-6">
          {currentUser.roles.map((userRole: UserRole) => {
            const franchise = mockFranchises.find(
              (f: Franchise) => f.id === userRole.franchiseId
            )

            // Skip if franchise not found or if it's a global role
            if (!franchise) return null

            const isActive = franchise.is_active
            const roleName =
              userRole.roleCode === 'FRANCHISE_MANAGER'
                ? 'Quản lý ca'
                : userRole.roleCode === 'STAFF'
                  ? 'Nhân viên bán hàng'
                  : 'Quản trị viên'

            return (
              <div
                key={franchise.id}
                className={`group relative flex flex-col sm:flex-row items-center gap-6 bg-white border-2 rounded-2xl p-8 transition-all duration-300 ${
                  isActive
                    ? 'border-border-brown hover:shadow-xl cursor-pointer'
                    : 'border-border-brown/40 opacity-50 pointer-events-none select-none'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-transparent group-hover:bg-primary transition-colors rounded-l-2xl" />
                )}

                {/* Icon */}
                <div className="shrink-0">
                  <div
                    className={`flex items-center justify-center w-20 h-20 rounded-xl ${
                      isActive
                        ? 'bg-tertiary/20 text-primary'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span className="material-symbols-outlined text-4xl">
                      {isActive ? 'storefront' : 'domain_disabled'}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-grow flex flex-col w-full text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-primary/40 text-white'
                      }`}
                    >
                      {franchise.code}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      {isActive ? 'Đang hoạt động' : 'Tạm đóng'}
                    </span>
                  </div>
                  <h3
                    className={`text-xl font-bold ${
                      isActive ? 'text-primary' : 'text-primary/60'
                    }`}
                  >
                    {franchise.name}
                  </h3>
                  <p
                    className={`text-base mt-1 ${
                      isActive ? 'text-secondary/80' : 'text-secondary/60'
                    }`}
                  >
                    {franchise.address}
                  </p>
                  <p
                    className={`text-sm font-medium mt-2 ${
                      isActive ? 'text-primary/60' : 'text-primary/40'
                    }`}
                  >
                    Vai trò: {isActive ? roleName : '-'}
                  </p>
                </div>

                {/* Action Button */}
                <div className="shrink-0 mt-4 sm:mt-0">
                  {isActive ? (
                    <button
                      onClick={() => handleSelectFranchise(franchise.id)}
                      className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white text-base font-semibold transition-all shadow-md group-hover:translate-x-1"
                    >
                      Chọn chi nhánh
                      <span className="material-symbols-outlined text-xl ml-2">
                        arrow_forward
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-gray-200 text-gray-500 text-base font-semibold w-full sm:w-auto cursor-not-allowed"
                    >
                      Tạm đóng
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="mt-14 flex flex-col items-center gap-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-secondary hover:text-primary font-bold text-base transition-colors py-3 px-6 rounded-xl hover:bg-primary/5"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            Đăng xuất
          </button>
          <p className="text-primary/40 text-sm font-medium">
            Phiên làm việc sẽ hết hạn sau 8 giờ
          </p>
        </div>
      </main>
    </div>
  )
}

export default FranchiseSelectionPage
