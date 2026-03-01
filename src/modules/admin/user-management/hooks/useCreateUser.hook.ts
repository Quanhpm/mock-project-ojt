import { useState, useEffect, useCallback } from 'react'
import {
    createUser,
    assignUserFranchiseRole,
    getFranchisesForSelect,
} from '@/apis'
import type {
    CreateUserRequest,
    FranchiseSelectItem,
} from '@/apis'

// ======================== Types ========================

export type CreateUserStep = 1 | 2

export interface UseCreateUserReturn {
    // State
    currentStep: CreateUserStep
    createdUserId: string | null
    isSubmitting: boolean
    error: string | null
    franchises: FranchiseSelectItem[]
    isFranchisesLoading: boolean

    // Actions
    handleCreateUser: (payload: CreateUserRequest) => Promise<void>
    handleAssignRole: (roleId: string, franchiseId: string | null) => Promise<void>
    goBackToStep1: () => void
    resetFlow: () => void
}

// ======================== Hook ========================

export const useCreateUser = (onSuccess?: () => void): UseCreateUserReturn => {
    const [currentStep, setCurrentStep] = useState<CreateUserStep>(1)
    const [createdUserId, setCreatedUserId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Franchise dropdown data
    const [franchises, setFranchises] = useState<FranchiseSelectItem[]>([])
    const [isFranchisesLoading, setIsFranchisesLoading] = useState(false)

    // ──────── Fetch franchises khi sang bước 2 ────────
    useEffect(() => {
        if (currentStep !== 2) return
        let cancelled = false
        const fetchFranchises = async () => {
            setIsFranchisesLoading(true)
            try {
                const data = await getFranchisesForSelect()
                if (!cancelled) {
                    setFranchises(data ?? [])
                }
            } catch (err) {
                if (err === null) return // bị cancel — bỏ qua
                if (!cancelled) {
                    console.error('Failed to fetch franchises:', err)
                    setFranchises([])
                }
            } finally {
                if (!cancelled) setIsFranchisesLoading(false)
            }
        }
        fetchFranchises()
        return () => { cancelled = true }
    }, [currentStep])

    // ──────── Step 1: Tạo user ────────
    const handleCreateUser = useCallback(async (payload: CreateUserRequest) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const result = await createUser(payload)
            if (result?.id) {
                setCreatedUserId(result.id)
                setCurrentStep(2)
            } else {
                setError('Failed to create user. No user ID returned.')
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to create user.'
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }, [])

    // ──────── Step 2: Gán role + franchise ────────
    const handleAssignRole = useCallback(
        async (roleId: string, franchiseId: string | null) => {
            if (!createdUserId) {
                setError('Missing user ID. Please go back and create user first.')
                return
            }

            setIsSubmitting(true)
            setError(null)
            try {
                await assignUserFranchiseRole({
                    user_id: createdUserId,
                    role_id: roleId,
                    franchise_id: franchiseId,
                    note: '',
                })
                onSuccess?.()
            } catch (err: unknown) {
                const message =
                    err instanceof Error ? err.message : 'Failed to assign role.'
                setError(message)
            } finally {
                setIsSubmitting(false)
            }
        },
        [createdUserId, onSuccess],
    )

    // ──────── Navigation ────────
    const goBackToStep1 = useCallback(() => {
        setCurrentStep(1)
        setError(null)
    }, [])

    const resetFlow = useCallback(() => {
        setCurrentStep(1)
        setCreatedUserId(null)
        setIsSubmitting(false)
        setError(null)
    }, [])

    return {
        currentStep,
        createdUserId,
        isSubmitting,
        error,
        franchises,
        isFranchisesLoading,
        handleCreateUser,
        handleAssignRole,
        goBackToStep1,
        resetFlow,
    }
}
