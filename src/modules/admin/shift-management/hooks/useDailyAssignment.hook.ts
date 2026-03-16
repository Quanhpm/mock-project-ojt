import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { searchUserFranchiseRoles, shiftApi } from '@/apis/endpoints'
import type { UserFranchiseRoleItem } from '@/apis/endpoints'
import type { DailyShiftView } from './useShiftCalendar.hook'
import { useToast } from '@/hooks/use-toast.hook'

export interface AssignableUserOption {
  userId: string
  userName: string
  userEmail: string
}

type FranchiseUserCache = Map<string, AssignableUserOption[]>

const buildAssignableUsers = (userRoles: UserFranchiseRoleItem[]) => {
  const seenUserIds = new Set<string>()

  return userRoles.reduce<AssignableUserOption[]>((acc, role) => {
    if (!role.user_id || seenUserIds.has(role.user_id) || role.is_active === false) {
      return acc
    }

    seenUserIds.add(role.user_id)
    acc.push({
      userId: role.user_id,
      userName: role.user_name || `User ${role.user_id}`,
      userEmail: role.user_email || '',
    })

    return acc
  }, [])
}

export const useDailyAssignment = (
  franchiseId: string | null,
  selectedShift: DailyShiftView | null,
) => {
  const { success, error } = useToast()
  const cacheRef = useRef<FranchiseUserCache>(new Map())
  const [candidateUsers, setCandidateUsers] = useState<AssignableUserOption[]>([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!franchiseId || !selectedShift) {
      setCandidateUsers([])
      return
    }

    const cachedUsers = cacheRef.current.get(franchiseId)
    if (cachedUsers) {
      setCandidateUsers(cachedUsers)
      return
    }

    let cancelled = false

    const loadAssignableUsers = async () => {
      setIsUsersLoading(true)

      try {
        const rolesResponse = await searchUserFranchiseRoles({
          searchCondition: {
            franchise_id: franchiseId,
            is_deleted: false,
          },
          pageInfo: { pageNum: 1, pageSize: 1000 },
        })

        if (cancelled) return

        const nextUsers = buildAssignableUsers(rolesResponse?.data || [])
        cacheRef.current.set(franchiseId, nextUsers)
        setCandidateUsers(nextUsers)
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load assignable users:', loadError)
          setCandidateUsers([])
        }
      } finally {
        if (!cancelled) {
          setIsUsersLoading(false)
        }
      }
    }

    loadAssignableUsers()

    return () => {
      cancelled = true
    }
  }, [franchiseId, selectedShift])

  const assignableUsers = useMemo(() => {
    if (!selectedShift) return []

    const assignedUserIds = new Set(selectedShift.assignments.map((assignment) => assignment.staffId))

    return candidateUsers.filter((user) => !assignedUserIds.has(user.userId))
  }, [candidateUsers, selectedShift])

  const handleAssignUser = useCallback(
    async (userId: string, note?: string) => {
      if (!selectedShift) return false

      setIsSubmitting(true)

      try {
        await shiftApi.assignShiftToUser({
          user_id: userId,
          shift_id: selectedShift.shiftId,
          work_date: selectedShift.workDate,
          note: note?.trim() || undefined,
        })

        success('Assigned user successfully', `${selectedShift.shiftName} on ${selectedShift.workDate}`)
        return true
      } catch (submitError) {
        console.error('Failed to assign user:', submitError)
        error('Failed to assign user', 'Please try again.')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [error, selectedShift, success],
  )

  return {
    assignableUsers,
    isUsersLoading,
    isSubmitting,
    handleAssignUser,
  }
}
