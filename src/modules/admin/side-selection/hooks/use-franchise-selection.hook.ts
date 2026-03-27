import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getProfile, switchContext } from '@/apis/endpoints/auth.api'
import type { UserRoleItem } from '@/apis/endpoints/auth.api'
import { useAdminAuthStore } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { useAdminGlobalFranchiseScopeStore } from '@/modules/admin/order-management/stores/admin-global-franchise-scope.store'
import {
  resolveAdminGlobalFranchiseScopeKey,
  withoutAdminGlobalFranchiseId,
} from '@/modules/admin/order-management/utils/admin-global-franchise-scope'
import { usePosSessionStore } from '@/modules/admin/order-management/stores/pos-session.store'
import { useLoadingStore } from '@/stores/loading.store'
import { ROUTER_URL } from '@/routes/router.const'

const DASHBOARD_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.DASHBOARD}`
const ITEMS_PER_PAGE = 6
const SELECT_FRANCHISE_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.SELECT_FRANCHISE}`
const ORDER_POS_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS}`
const ORDER_POS_REVIEW_PATH = `${ROUTER_URL.ADMIN}/${ROUTER_URL.ADMIN_ROUTER.ORDER_POS_REVIEW}`

const getRedirectToFromState = (state: unknown): string | null => {
  if (!state || typeof state !== 'object') {
    return null
  }

  const redirectTo = (state as { redirectTo?: unknown }).redirectTo

  if (typeof redirectTo === 'string') {
    return redirectTo
  }

  if (!redirectTo || typeof redirectTo !== 'object') {
    return null
  }

  const pathname = typeof (redirectTo as { pathname?: unknown }).pathname === 'string'
    ? (redirectTo as { pathname: string }).pathname
    : ''
  const search = typeof (redirectTo as { search?: unknown }).search === 'string'
    ? (redirectTo as { search: string }).search
    : ''
  const hash = typeof (redirectTo as { hash?: unknown }).hash === 'string'
    ? (redirectTo as { hash: string }).hash
    : ''

  return pathname ? `${pathname}${search}${hash}` : null
}

const normalizeRedirectTo = (redirectTo: string | null) => {
  if (!redirectTo || redirectTo.startsWith(SELECT_FRANCHISE_PATH)) {
    return DASHBOARD_PATH
  }

  return redirectTo
}

const isPosRedirectTarget = (redirectTo: string | null) => {
  if (!redirectTo) {
    return false
  }

  return redirectTo.startsWith(ORDER_POS_PATH) || redirectTo.startsWith(ORDER_POS_REVIEW_PATH)
}

interface UseFranchiseSelectionReturn {
  userName: string
  loading: boolean
  switching: string | null
  error: string | null
  franchiseRoles: UserRoleItem[]
  paginatedFranchiseRoles: UserRoleItem[]
  hasGlobalRole: boolean
  currentPage: number
  totalPages: number
  handleSelectFranchise: (franchiseId: string) => Promise<void>
  handleSelectGlobal: () => Promise<void>
  handleLogout: () => Promise<void>
  handlePageChange: (page: number) => void
}

export const useFranchiseSelection = (): UseFranchiseSelectionReturn => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const admin = useAdminAuthStore((s) => s.admin)
  const storeRoles = useAdminAuthStore((s) => s.roles)
  const storeActiveContext = useAdminAuthStore((s) => s.activeContext)
  const setProfile = useAdminAuthStore((s) => s.setProfile)
  const storeLogout = useAdminAuthStore((s) => s.logout)
  const { increment: incrementGlobalLoading, decrement: decrementGlobalLoading } = useLoadingStore()
  const [loading, setLoading] = useState(true)
  const [switching, setSwitching] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const isAdminGlobalMode =
    storeActiveContext?.role === 'ADMIN' &&
    storeActiveContext?.scope === 'GLOBAL' &&
    !storeActiveContext?.franchise_id
  const redirectTo = normalizeRedirectTo(
    searchParams.get('redirectTo')?.trim() || getRedirectToFromState(location.state),
  )
  const isPosRedirect = isPosRedirectTarget(redirectTo)
  const cleanRedirectTo = withoutAdminGlobalFranchiseId(redirectTo)
  const redirectScopeKey = resolveAdminGlobalFranchiseScopeKey(cleanRedirectTo)
  
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
          setLoading(false)
          return
        }

        // Nếu chưa có → gọi API
        const data = await getProfile()
        
        if (!data) {
          console.error('[Hook] No profile data returned')
          setError('Không thể tải thông tin người dùng')
          return
        }

        // Lưu vào store
        setProfile(data)
      } catch (err) {
        console.error('[Hook] fetchProfile error:', err)
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
    incrementGlobalLoading()
    try {
      if (isAdminGlobalMode) {
        if (redirectScopeKey) {
          useAdminGlobalFranchiseScopeStore
            .getState()
            .setSelectedFranchiseId(redirectScopeKey, franchiseId)
        }

        if (isPosRedirect) {
          usePosSessionStore.getState().setSessionFranchiseId(franchiseId)
          navigate(cleanRedirectTo, { replace: true })
          return
        }

        if (redirectScopeKey) {
          navigate(cleanRedirectTo, { replace: true })
          return
        }

        navigate(redirectTo, { replace: true })
        return
      }

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
    } finally {
      decrementGlobalLoading()
    }
  }

  const handleSelectGlobal = async () => {
    if (!isMountedRef.current) return
    
    setSwitching('GLOBAL')
    incrementGlobalLoading()
    try {
      if (isAdminGlobalMode) {
        if (redirectScopeKey) {
          useAdminGlobalFranchiseScopeStore
            .getState()
            .clearSelectedFranchiseId(redirectScopeKey)
        }

        if (isPosRedirect) {
          usePosSessionStore.getState().setSessionFranchiseId(null)
          navigate(cleanRedirectTo, { replace: true })
          return
        }

        if (redirectScopeKey) {
          navigate(cleanRedirectTo, { replace: true })
          return
        }

        navigate(cleanRedirectTo, { replace: true })
        return
      }

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
    } finally {
      decrementGlobalLoading()
    }
  }

  const handleLogout = async () => {
    incrementGlobalLoading()
    try {
      await storeLogout()
      navigate(ROUTER_URL.ADMIN_ROUTER.LOGIN, { replace: true })
    } finally {
      decrementGlobalLoading()
    }
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
    paginatedFranchiseRoles,
    hasGlobalRole,
    currentPage,
    totalPages,
    handleSelectFranchise,
    handleSelectGlobal,
    handleLogout,
    handlePageChange,
  }
}
