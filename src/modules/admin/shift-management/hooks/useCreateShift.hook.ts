import { useState, useEffect, useCallback, useMemo } from 'react'
import { shiftApi, getFranchisesSelect, searchUserFranchiseRoles } from '@/apis/endpoints'
import type {
  CreateShiftRequest,
  FranchiseOptionItem,
  UserFranchiseRoleItem,
} from '@/apis/endpoints'
import { extractBackendMessage } from '../utils/shift.helpers'

// ======================== Types ========================

export type CreateShiftStep = 1 | 2

export interface UseCreateShiftReturn {
  // State
  currentStep: CreateShiftStep
  createdShiftId: string | null
  selectedFranchiseId: string | null
  isSubmitting: boolean
  error: string | null
  franchises: FranchiseOptionItem[]
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
  const [franchises, setFranchises] = useState<FranchiseOptionItem[]>([])
  const [userFranchiseRoles, setUserFranchiseRoles] = useState<UserFranchiseRoleItem[]>([])
  const [isFranchisesLoading, setIsFranchisesLoading] = useState(false)
  const [isUsersLoading, setIsUsersLoading] = useState(false)

  // ──────── Fetch franchise options khi component mount ────────
  useEffect(() => {
    let cancelled = false

    const fetchFranchises = async () => {
      setIsFranchisesLoading(true)
      try {
        const franchiseRes = await getFranchisesSelect()

        if (!cancelled) {
          setFranchises(franchiseRes || [])
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
        const rolesRes = await searchUserFranchiseRoles({
          searchCondition: {
            franchise_id: selectedFranchiseId,
            is_deleted: false,
          },
          pageInfo: { pageNum: 1, pageSize: 1000 },
        })

        if (!cancelled) {
          setUserFranchiseRoles(rolesRes?.data || [])
        }
      } catch (err) {
        if (err === null) return // bị cancel — bỏ qua
        if (!cancelled) {
          console.error('Failed to fetch user franchise roles:', err)
          setUserFranchiseRoles([])
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

  const staffList = useMemo(() => {
    const seenUserIds = new Set<string>()

    return userFranchiseRoles.reduce<Array<{ userId: string; userName: string }>>((acc, role) => {
      if (seenUserIds.has(role.user_id) || role.is_active === false) {
        return acc
      }

      seenUserIds.add(role.user_id)
      acc.push({
        userId: role.user_id,
        userName: role.user_name || `User ${role.user_id}`,
      })
      return acc
    }, [])
  }, [userFranchiseRoles])

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
      setError(extractBackendMessage(err, 'Failed to create shift.'))
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
        setError(extractBackendMessage(err, 'Failed to assign staff.'))
      } finally {
        setIsSubmitting(false)
      }
    },
    [createdShiftId, onSuccess],
  )

  // ──────── Navigation ────────
  const goBackToStep1 = useCallback(() => {
    setCurrentStep(1)
    setCreatedShiftId(null)
    setSelectedFranchiseId(null)
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
