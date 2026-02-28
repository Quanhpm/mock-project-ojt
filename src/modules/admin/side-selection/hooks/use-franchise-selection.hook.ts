import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProfile, switchContext } from '@/apis/endpoints/auth.api'
import type { ProfileResponse, UserRoleItem } from '@/apis/endpoints/auth.api'
import { useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { ROUTER_URL } from '@/routes/router.const'

const DASHBOARD_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`
const ITEMS_PER_PAGE = 6

interface UseFranchiseSelectionReturn {
  profile: ProfileResponse | null
  loading: boolean
  switching: string | null
  error: string | null
  franchiseRoles: UserRoleItem[]
  paginatedFranchiseRoles: UserRoleItem[]
  hasGlobalRole: boolean
  currentPage: number
  totalPages: number
  handleSelectFranchise: (franchiseId: string) => Promise<void>
  handleSelectGlobal: () => void
  handleLogout: () => Promise<void>
  handlePageChange: (page: number) => void
}

export const useFranchiseSelection = (): UseFranchiseSelectionReturn => {
  const navigate = useNavigate()
  const admin = useAdminAuthStore((s) => s.admin)
  const storeRoles = useAdminAuthStore((s) => s.roles)
  const setProfile = useAdminAuthStore((s) => s.setProfile)
  const logout = useAdminAuthStore((s) => s.logout)
  const [profile, setLocalProfile] = useState<ProfileResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Nếu store đã có data (vừa login xong) → dùng luôn, không gọi API lại
        if (admin && storeRoles.length > 0) {
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
  }, [admin, storeRoles, setProfile])

  const handleSelectFranchise = async (franchiseId: string) => {
    setSwitching(franchiseId)
    try {
      const updatedProfile = await switchContext(franchiseId)
      
      // Validate: Đảm bảo backend đã set activeContext
      if (!updatedProfile?.active_context) {
        throw new Error('Backend không trả về active_context')
      }
      
      // Cập nhật store
      setProfile(updatedProfile)
      
      // Đợi React render cycle tiếp theo để Guard check lại
      setTimeout(() => {
        navigate(DASHBOARD_PATH, { replace: true })
        setSwitching(null)
      }, 0)
    } catch (error) {
      console.error('handleSelectFranchise error:', error)
      setError('Không thể chọn chi nhánh, vui lòng thử lại')
      setSwitching(null)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true })
  }

  const handleSelectGlobal = async () => {
    setSwitching('GLOBAL')
    try {
      // Gọi API với franchise_id = null để switch sang GLOBAL
      await switchContext(null)
      
      // Lấy profile mới từ backend
      const updatedProfile = await getProfile()
      
      // Validate response
      if (!updatedProfile) {
        throw new Error('Backend không trả về profile')
      }
      
      // Cập nhật store
      setProfile(updatedProfile)
      
      // Navigate sau khi store đã update
      setTimeout(() => {
        navigate(DASHBOARD_PATH, { replace: true })
        setSwitching(null)
      }, 0)
    } catch (error) {
      console.error('handleSelectGlobal error:', error)
      setError('Không thể chuyển sang quyền toàn cục, vui lòng thử lại')
      setSwitching(null)
    }
  }

  // Lấy trực tiếp từ store → luôn sync, không cần local state
  const franchiseRoles: UserRoleItem[] = storeRoles.filter(r => r.scope === 'FRANCHISE')
  const hasGlobalRole = storeRoles.some(r => r.scope === 'GLOBAL')

  // Pagination logic
  const totalPages = Math.ceil(franchiseRoles.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedFranchiseRoles = franchiseRoles.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      // Scroll to top để user thấy franchise cards mới
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return {
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
  }
}
