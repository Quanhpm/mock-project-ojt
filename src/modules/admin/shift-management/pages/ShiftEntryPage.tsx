import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuthStore, getRoleCode } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { useShiftManagementStore } from '../stores/shift-management.store'

function ShiftEntryPage() {
  const navigate = useNavigate()
  const store = useAdminAuthStore()
  const roleCode = getRoleCode(store)
  const activeContext = useAdminAuthStore((state) => state.activeContext)
  const setSelectedFranchiseId = useShiftManagementStore((state) => state.setSelectedFranchiseId)

  useEffect(() => {
    if (roleCode === 'MANAGER' && activeContext?.franchise_id) {
      setSelectedFranchiseId(activeContext.franchise_id)
      navigate(`/admin/shifts/calendar?franchiseId=${activeContext.franchise_id}`, {
        replace: true,
      })
      return
    }

    if (roleCode === 'ADMIN') {
      navigate('/admin/shifts/select-franchise', { replace: true })
      return
    }

    navigate('/admin/dashboard', { replace: true })
  }, [activeContext?.franchise_id, navigate, roleCode, setSelectedFranchiseId])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <span className="material-symbols-outlined text-[28px]">schedule</span>
      </div>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Preparing shift workspace</h1>
      <p className="mt-2 text-sm text-slate-500">
        We are routing you to the right franchise view.
      </p>
    </div>
  )
}

export default ShiftEntryPage
