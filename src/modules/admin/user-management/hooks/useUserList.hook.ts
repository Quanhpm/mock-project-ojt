import { useState, useEffect, useCallback } from 'react'
import { httpClient } from '@/apis'
import type { PageInfo } from '@/apis'

// ======================== Types ========================

/** Dữ liệu trả về từ API search users */
export interface UserItem {
  id: string
  email: string
  name: string
  phone: string
  avatar_url: string
  is_active: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

/** Payload gửi lên API search users */
interface SearchPayload {
  searchCondition: {
    keyword: string
    is_deleted: boolean
  }
  pageInfo: {
    pageNum: number
    pageSize: number
  }
}

// ======================== Hook ========================

export const useUserList = () => {
  const [users, setUsers] = useState<UserItem[]>([])
  const [pageInfo, setPageInfo] = useState<PageInfo>({
    pageNum: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchUsers = useCallback(async (pageNum: number, pageSize: number = 10) => {
    setIsLoading(true)
    try {
      const payload: SearchPayload = {
        searchCondition: {
          keyword: '',
          is_deleted: false,
        },
        pageInfo: {
          pageNum,
          pageSize,
        },
      }

      const res = await httpClient.search<UserItem, SearchPayload>({
        url: '/users/search',
        data: payload,
      })

      setUsers(res.data)
      setPageInfo(res.pageInfo)
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Gọi API lần đầu khi mount
  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  const setCurrentPage = useCallback(
    (page: number) => {
      fetchUsers(page, pageInfo.pageSize)
    },
    [fetchUsers, pageInfo.pageSize],
  )

  return {
    users,
    isLoading,
    pageInfo,
    currentPage: pageInfo.pageNum,
    totalPages: pageInfo.totalPages,
    totalItems: pageInfo.totalItems,
    itemsPerPage: pageInfo.pageSize,
    setCurrentPage,
  }
}
