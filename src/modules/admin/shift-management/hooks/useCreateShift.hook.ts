import { useState, useEffect, useCallback } from 'react'
import { shiftApi, franchiseApi, searchUserFranchiseRoles, searchUsers } from '@/apis/endpoints'
import type { CreateShiftRequest, FranchiseItem, UserFranchiseRoleItem, UserItem } from '@/apis/endpoints'

// ======================== Types ========================

export type CreateShiftStep = 1 | 2

export interface UseCreateShiftReturn {
  // State
  currentStep: CreateShiftStep
  createdShiftId: string | null
  selectedFranchiseId: string | null
  isSubmitting: boolean
  error: string | null
  franchises: FranchiseItem[]
  staffList: Array<{ userId: string; userName: string }>
  isFranchisesLoading: boolean
  isUsersLoading: boolean

  // Actions
  handleCreateShift: (payload: CreateShiftRequest) => Promise<void>
  handleAssignStaff: (userId: string, workDate: string, note?: string) => Promise<void>
  goBackToStep1: () => void
  resetFlow: () => void
}

// ======================== Hook ========================

export const useCreateShift = (onSuccess?: () => void): UseCreateShiftReturn => {
  const [currentStep, setCurrentStep] = useState<CreateShiftStep>(1)
  const [createdShiftId, setCreatedShiftId] = useState<string | null>(null)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Franchise and User data
  const [franchises, setFranchises] = useState<FranchiseItem[]>([])
  const [userFranchiseRoles, setUserFranchiseRoles] = useState<UserFranchiseRoleItem[]>([])
  const [userList, setUserList] = useState<UserItem[]>([])
  const [isFranchisesLoading, setIsFranchisesLoading] = useState(false)
  const [isUsersLoading, setIsUsersLoading] = useState(false)

  // ──────── Fetch franchise options khi component mount ────────
  useEffect(() => {
    let cancelled = false

    const fetchFranchises = async () => {
      setIsFranchisesLoading(true)
      try {
        const franchiseRes = await franchiseApi.searchFranchises({
          searchCondition: { is_deleted: false },
          pageInfo: { pageNum: 1, pageSize: 1000 },
        })

        if (!cancelled) {
          setFranchises(franchiseRes?.data || [])
        }
      } catch (err) {
        if (err === null) return // bị cancel — bỏ qua
        if (!cancelled) {
          console.error('Failed to fetch franchises:', err)
          setFranchises([])
        }
      } finally {
        if (!cancelled) {
          setIsFranchisesLoading(false)
        }
      }
    }

    fetchFranchises()
    return () => {
      cancelled = true
    }
  }, [])

  // ──────── Fetch user franchise role khi sang bước 2 ────────
  useEffect(() => {
    if (currentStep !== 2 || !selectedFranchiseId) return
    let cancelled = false

    const fetchUserOptions = async () => {
      setIsUsersLoading(true)
      try {
        const [rolesRes, usersRes] = await Promise.all([
          searchUserFranchiseRoles({
            searchCondition: {
              franchise_id: selectedFranchiseId,
              is_deleted: false,
            },
            pageInfo: { pageNum: 1, pageSize: 1000 },
          }),
          searchUsers({
            searchCondition: { is_deleted: false },
            pageInfo: { pageNum: 1, pageSize: 1000 },
          }),
        ])

        if (!cancelled) {
          setUserFranchiseRoles(rolesRes?.data || [])
          setUserList(usersRes?.data || [])
        }
      } catch (err) {
        if (err === null) return // bị cancel — bỏ qua
        if (!cancelled) {
          console.error('Failed to fetch user franchise roles:', err)
          setUserFranchiseRoles([])
          setUserList([])
        }
      } finally {
        if (!cancelled) {
          setIsUsersLoading(false)
        }
      }
    }

    fetchUserOptions()
    return () => {
      cancelled = true
    }
  }, [currentStep, selectedFranchiseId])

  // ──────── Build staff list dari merge userFranchiseRoles + userList ────────
  const staffList = userFranchiseRoles
    .map((ufr) => {
      const user = userList.find((u) => u.id === ufr.user_id)
      return {
        userId: ufr.user_id,
        userName: user?.name || `User ${ufr.user_id}`,
      }
    })
    .filter((staff, index, self) => self.findIndex((s) => s.userId === staff.userId) === index) // Remove duplicates

  // ──────── Step 1: Tạo shift ────────
  const handleCreateShift = useCallback(async (payload: CreateShiftRequest) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await shiftApi.createShift(payload)
      if (result?.id) {
        setCreatedShiftId(result.id)
        setSelectedFranchiseId(payload.franchise_id)
        setCurrentStep(2)
      } else {
        setError('Failed to create shift. No shift ID returned.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create shift.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  // ──────── Step 2: Gán nhân viên vào shift ────────
  const handleAssignStaff = useCallback(
    async (userId: string, workDate: string, note?: string) => {
      if (!createdShiftId) {
        setError('Missing shift ID. Please go back and create shift first.')
        return
      }

      setIsSubmitting(true)
      setError(null)
      try {
        await shiftApi.assignShiftToUser({
          user_id: userId,
          shift_id: createdShiftId,
          work_date: workDate,
          note: note || undefined,
        })
        onSuccess?.()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to assign staff.'
        setError(message)
      } finally {
        setIsSubmitting(false)
      }
    },
    [createdShiftId, onSuccess],
  )

  // ──────── Navigation ────────
  const goBackToStep1 = useCallback(() => {
    setCurrentStep(1)
    setError(null)
  }, [])

  const resetFlow = useCallback(() => {
    setCurrentStep(1)
    setCreatedShiftId(null)
    setSelectedFranchiseId(null)
    setIsSubmitting(false)
    setError(null)
  }, [])

  return {
    currentStep,
    createdShiftId,
    selectedFranchiseId,
    isSubmitting,
    error,
    franchises,
    staffList,
    isFranchisesLoading,
    isUsersLoading,
    handleCreateShift,
    handleAssignStaff,
    goBackToStep1,
    resetFlow,
  }
}
