import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, switchContext } from '@/apis/endpoints/auth.api'
import type { ProfileResponse, UserRoleItem } from '@/apis/endpoints/auth.api'
import { useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { ROUTER_URL } from '@/routes/router.const'

const DASHBOARD_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`

interface UseFranchiseSelectionReturn {
  profile: ProfileResponse | null
  loading: boolean
  switching: string | null
  error: string | null
  franchiseRoles: UserRoleItem[]
  handleSelectFranchise: (franchiseId: string) => Promise<void>
  handleLogout: () => void
}

export const useFranchiseSelection = (): UseFranchiseSelectionReturn => {
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const storeRoles = useAdminAuthStore((s) => s.roles)
  const storeActiveContext = useAdminAuthStore((s) => s.activeContext)
  const setProfile = useAdminAuthStore((s) => s.setProfile)
  const logout = useAdminAuthStore((s) => s.logout)
  const [profile, setLocalProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Nếu store đã có data (vừa login xong) → dùng luôn, không gọi API lại
        if (admin && storeRoles.length > 0) {
          setLocalProfile({
            user: admin,
            roles: storeRoles,
            active_context: storeActiveContext,
          })
          setLoading(false)
          return
        }

        // Nếu chưa có → gọi API
        const data = await getProfile()
        if (!data) {
          setError('Không thể tải thông tin người dùng')
          return
        }

        setLocalProfile(data)
        setProfile(data)
      } catch {
        setError('Đã xảy ra lỗi khi tải thông tin')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [admin, storeRoles, storeActiveContext, setProfile])

  const handleSelectFranchise = async (franchiseId: string) => {
    setSwitching(franchiseId)
    try {
      const updatedProfile = await switchContext(franchiseId)
      if (updatedProfile) {
        setProfile(updatedProfile) // Cập nhật store với active_context mới
      }
      navigate(DASHBOARD_PATH, { replace: true })
    } catch {
      setError('Không thể chọn chi nhánh, vui lòng thử lại')
      setSwitching(null)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true })
  }

  const franchiseRoles: UserRoleItem[] =
    profile?.roles.filter(r => r.scope === 'FRANCHISE') ?? []

  return {
    profile,
    loading,
    switching,
    error,
    franchiseRoles,
    handleSelectFranchise,
    handleLogout,
  }
}
