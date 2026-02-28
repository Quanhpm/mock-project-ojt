import { useFranchiseSelection } from '../hooks/use-franchise-selection.hook'
import { FranchiseCard } from '../components/FranchiseCard'
import { GlobalRoleCard } from '../components/GlobalRoleCard'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorScreen } from '../components/ErrorScreen'

function FranchiseSelectionPage() {
  const {
    userName,
    loading,
    switching,
    error,
    franchiseRoles,
    hasGlobalRole,
    handleSelectFranchise,
    handleSelectGlobal,
    handleLogout,
  } = useFranchiseSelection()

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />

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
              Chọn Quyền Làm Việc
            </h1>
          </div>
          <h2 className="text-secondary text-2xl font-semibold mb-2">
            Xin chào, {userName} 👋
          </h2>
          <p className="text-primary/70 font-medium text-lg">
            Chọn quyền hoặc chi nhánh để bắt đầu làm việc
          </p>
        </div>

        {/* Role Selection List */}
        <div className="w-full max-w-[800px] flex flex-col gap-6">
          {!hasGlobalRole && franchiseRoles.length === 0 && (
            <div className="text-center text-secondary/70 py-12">
              <span className="material-symbols-outlined text-5xl mb-3 block">store_off</span>
              <p className="text-lg font-medium">Bạn chưa được gán quyền nào</p>
            </div>
          )}

          {/* Global Role Card */}
          {hasGlobalRole && (
            <GlobalRoleCard onSelect={handleSelectGlobal} />
          )}

          {/* Franchise Roles */}
          {franchiseRoles.map(userRole => (
            <FranchiseCard
              key={userRole.franchise_id}
              userRole={userRole}
              switching={switching}
              onSelect={handleSelectFranchise}
            />
          ))}
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
        </div>
      </main>
    </div>
  )
}

export default FranchiseSelectionPage
