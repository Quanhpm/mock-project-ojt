import { useState, useEffect, useRef } from 'react'
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
  handleSelectFranchise: (franchiseId: string) => Promise<void>
  handleSelectGlobal: () => Promise<void>
  handleLogout: () => Promise<void>
  handlePageChange: (page: number) => void
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
  const [currentPage, setCurrentPage] = useState(1)
  
  // Track mounted state để tránh setState sau khi unmount
  const isMountedRef = useRef(false)
  
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

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

        // Lưu vào store
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
    if (!isMountedRef.current) return
    
    setSwitching(franchiseId)
    try {
      await switchContext(franchiseId)
      
      // Lấy profile mới sau khi switch
      const updatedProfile = await getProfile()
      
      if (!updatedProfile) {
        throw new Error('Không thể lấy thông tin sau khi chuyển chi nhánh')
      }
      
      // Cập nhật store
      setProfile(updatedProfile)
      
      // Navigate ngay - component sẽ unmount
      navigate(DASHBOARD_PATH, { replace: true })
    } catch (error) {
      console.error('handleSelectFranchise error:', error)
      if (isMountedRef.current) {
        setError('Không thể chọn chi nhánh, vui lòng thử lại')
        setSwitching(null)
      }
    }
  }

  const handleSelectGlobal = async () => {
    if (!isMountedRef.current) return
    
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
      
      // Navigate ngay - component sẽ unmount
      navigate(DASHBOARD_PATH, { replace: true })
    } catch (error) {
      console.error('handleSelectGlobal error:', error)
      if (isMountedRef.current) {
        setError('Không thể chuyển sang quyền toàn cục, vui lòng thử lại')
        setSwitching(null)
      }
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true })
  }

  // Lấy trực tiếp từ store → luôn sync, không cần local state
  const franchiseRoles: UserRoleItem[] = storeRoles.filter((r) => r.scope === 'FRANCHISE')
  const hasGlobalRole = storeRoles.some((r) => r.scope === 'GLOBAL')

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
    userName: admin?.name ?? '',
    loading,
    switching,
    error,
    franchiseRoles,
    handleSelectFranchise,
    handleSelectGlobal,
    handleLogout,
  }
}
