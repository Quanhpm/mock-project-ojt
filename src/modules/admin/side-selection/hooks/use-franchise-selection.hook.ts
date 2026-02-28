import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, switchContext } from '@/apis/endpoints/auth.api'
import type { UserRoleItem } from '@/apis/endpoints/auth.api'
import { useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { ROUTER_URL } from '@/routes/router.const'

const DASHBOARD_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`

interface UseFranchiseSelectionReturn {
  userName: string
  loading: boolean
  switching: string | null
  error: string | null
  franchiseRoles: UserRoleItem[]
  hasGlobalRole: boolean
  handleSelectFranchise: (franchiseId: string) => Promise<void>
  handleSelectGlobal: () => void
  handleLogout: () => Promise<void>
}

export const useFranchiseSelection = (): UseFranchiseSelectionReturn => {
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const storeRoles = useAdminAuthStore((s) => s.roles)
  const storeActiveContext = useAdminAuthStore((s) => s.activeContext)
  const setProfile = useAdminAuthStore((s) => s.setProfile)
  const logout = useAdminAuthStore((s) => s.logout)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Nếu store đã có data (vừa login xong) → dùng luôn, không gọi API lại
        if (admin && storeRoles.length > 0) {
          // Đã có active_context → redirect dashboard luôn
          if (storeActiveContext) {
            setLoading(false)
            navigate(DASHBOARD_PATH, { replace: true })
            return
          }

          // Kiểm tra có franchise role không
          const hasFranchiseRole = storeRoles.some(r => r.scope === 'FRANCHISE')
          
          // Nếu KHÔNG có franchise role (chỉ có GLOBAL) → redirect dashboard
          if (!hasFranchiseRole) {
            setLoading(false)
            navigate(DASHBOARD_PATH, { replace: true })
            return
          }

          // Có franchise role → hiển thị trang chọn
          setLoading(false)
          return
        }

        // Nếu chưa có → gọi API
        const data = await getProfile()
        if (!data) {
          setError('Không thể tải thông tin người dùng')
          return
        }

        // Lưu vào store → storeRoles/storeActiveContext sẽ tự update
        setProfile(data)
      } catch {
        setError('Đã xảy ra lỗi khi tải thông tin')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [admin, storeRoles, storeActiveContext, setProfile, navigate])

  const handleSelectFranchise = async (franchiseId: string) => {
    setSwitching(franchiseId)
    try {
      const updatedProfile = await switchContext(franchiseId)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      navigate(DASHBOARD_PATH, { replace: true })
    } catch {
      setError('Không thể chọn chi nhánh, vui lòng thử lại')
      setSwitching(null)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // Ignore logout error
    } finally {
      navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true })
    }
  }

  const handleSelectGlobal = () => {
    // GLOBAL không cần gọi switchContext (không có franchise_id)
    // Chỉ cần redirect → Guard sẽ pass through vì không có franchise role
    navigate(DASHBOARD_PATH, { replace: true })
  }

  // Lấy trực tiếp từ store → luôn sync, không cần local state
  const franchiseRoles: UserRoleItem[] = storeRoles.filter(r => r.scope === 'FRANCHISE')
  const hasGlobalRole = storeRoles.some(r => r.scope === 'GLOBAL')

  return {
    userName: admin?.name ?? '',
    loading,
    switching,
    error,
    franchiseRoles,
    hasGlobalRole,
    handleSelectFranchise,
    handleSelectGlobal,
    handleLogout,
  }
}

