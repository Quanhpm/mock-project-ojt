import { Navigate } from 'react-router-dom'
import { getRoleCode, useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { ShiftCreateForm } from '../components/ShiftCreateForm'

export default function ShiftCreatePage() {
  const store = useAdminAuthStore()
  const activeContext = useAdminAuthStore((state) => state.activeContext)
  const roleCode = getRoleCode(store)

  if (roleCode === 'STAFF') {
    const fallbackPath = activeContext?.franchise_id
      ? `/admin/shifts/calendar?franchiseId=${activeContext.franchise_id}`
      : '/admin/shifts'

    return <Navigate to={fallbackPath} replace />
  }

  return <ShiftCreateForm />
}
