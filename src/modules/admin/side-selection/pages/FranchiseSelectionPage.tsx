import { useFranchiseSelection } from '../hooks/use-franchise-selection.hook'
import { FranchiseCard } from '../components/FranchiseCard'
import { LoadingScreen } from '../components/LoadingScreen'
import { ErrorScreen } from '../components/ErrorScreen'
import { Pagination } from '../components/Pagination'

function FranchiseSelectionPage() {
  const {
    profile,
    loading,
    switching,
    error,
    franchiseRoles,
    paginatedFranchiseRoles,
    hasGlobalRole,
    currentPage,
    totalPages,
    handleSelectFranchise,
    handleLogout,
    handlePageChange,
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
              Chọn Chi Nhánh
            </h1>
          </div>
          <h2 className="text-secondary text-2xl font-semibold mb-2">
            Xin chào, {userName}
          </h2>
          <p className="text-primary/70 font-medium text-lg">
            Chọn chi nhánh để bắt đầu ca làm việc
          </p>
          {franchiseRoles.length > 0 && (
            <p className="text-sm text-gray-500 mt-3">
              Tổng số chi nhánh: <span className="font-semibold">{franchiseRoles.length}</span>
            </p>
          )}
        </div>

        {/* Franchise List */}
        <div className="w-full max-w-[800px] flex flex-col gap-6">
          {franchiseRoles.length === 0 && (
            <div className="text-center text-secondary/70 py-12">
              <span className="material-symbols-outlined text-5xl mb-3 block">store_off</span>
              <p className="text-lg font-medium">Bạn chưa được gán vào chi nhánh nào</p>
            </div>
          )}

          {/* Global Role Card */}
          {hasGlobalRole && (
            <GlobalRoleCard 
              onSelect={handleSelectGlobal} 
              isLoading={switching === 'GLOBAL'}
            />
          )}

          {/* Franchise Roles */}
          {paginatedFranchiseRoles.map(userRole => (
            <FranchiseCard
              key={userRole.franchise_id}
              userRole={userRole}
              switching={switching}
              onSelect={handleSelectFranchise}
            />
          ))}
        </div>

        {/* Pagination */}
        {franchiseRoles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

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
