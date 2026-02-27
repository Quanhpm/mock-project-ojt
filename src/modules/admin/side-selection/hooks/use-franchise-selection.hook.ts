import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, switchContext } from '@/apis/endpoints/auth.api'
import type { ProfileResponse, UserRoleItem } from '@/apis/endpoints/auth.api'
import { ROUTER_URL } from '@/routes/router.const'

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
  const [profile, setProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile()
        if (!data) {
          setError('Không thể tải thông tin người dùng')
          return
        }

        // Đã có active_context → redirect dashboard luôn
        if (data.active_context) {
          navigate(ROUTER_URL.ADMIN_ROUTER.DASHBOARD, { replace: true })
          return
        }

        // GLOBAL_ADMIN → không cần pick franchise
        const isGlobalAdmin = data.roles.some(r => r.scope === 'GLOBAL')
        if (isGlobalAdmin) {
          navigate(ROUTER_URL.ADMIN_ROUTER.DASHBOARD, { replace: true })
          return
        }

        setProfile(data)
      } catch {
        setError('Đã xảy ra lỗi khi tải thông tin')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [navigate])

  const handleSelectFranchise = async (franchiseId: string) => {
    setSwitching(franchiseId)
    try {
      await switchContext(franchiseId)
      navigate(ROUTER_URL.ADMIN_ROUTER.DASHBOARD, { replace: true })
    } catch {
      setError('Không thể chọn chi nhánh, vui lòng thử lại')
      setSwitching(null)
    }
  }

  const handleLogout = () => {
    // TODO: Implement logout khi Task 1 & 2 hoàn thành
    console.log('Logout clicked')
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
