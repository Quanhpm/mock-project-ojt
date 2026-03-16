import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getFranchisesSelect } from '@/apis/endpoints'
import type { FranchiseOptionItem } from '@/apis/endpoints'
import { useAdminAuthStore, getRoleCode } from '@/modules/admin/auth-admin/stores/admin-auth.store'
import { useShiftManagementStore } from '../stores/shift-management.store'

function ShiftFranchiseSelectionPage() {
  const navigate = useNavigate()
  const store = useAdminAuthStore()
  const roleCode = getRoleCode(store)
  const activeContext = useAdminAuthStore((state) => state.activeContext)
  const setSelectedFranchiseId = useShiftManagementStore((state) => state.setSelectedFranchiseId)
  const resetShiftCalendarUi = useShiftManagementStore((state) => state.resetShiftCalendarUi)
  const [franchises, setFranchises] = useState<FranchiseOptionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (roleCode === 'MANAGER' && activeContext?.franchise_id) {
      navigate(`/admin/shifts/calendar?franchiseId=${activeContext.franchise_id}`, {
        replace: true,
      })
    }
  }, [activeContext?.franchise_id, navigate, roleCode])

  useEffect(() => {
    let cancelled = false

    const loadFranchises = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getFranchisesSelect()

        if (!cancelled) {
          setFranchises(data || [])
        }
      } catch (loadError) {
        console.error('Failed to load franchises for shifts:', loadError)

        if (!cancelled) {
          setError('Unable to load franchises. Please try again.')
          setFranchises([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadFranchises()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredFranchises = useMemo(() => {
    if (!searchTerm.trim()) return franchises

    const normalizedSearch = searchTerm.trim().toLowerCase()

    return franchises.filter((franchise) => {
      return (
        franchise.name.toLowerCase().includes(normalizedSearch) ||
        franchise.code.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [franchises, searchTerm])

  const handleSelectFranchise = (franchiseId: string) => {
    resetShiftCalendarUi()
    setSelectedFranchiseId(franchiseId)
    navigate(`/admin/shifts/calendar?franchiseId=${franchiseId}`)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              <span className="material-symbols-outlined text-[16px]">account_tree</span>
              Shift Management
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              Select a franchise before opening the shift calendar
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              Admin accounts work across multiple branches, so the calendar needs a
              franchise scope first. We will keep that selection for the next shift pages.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Search franchise
            </label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                search
              </span>
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Type franchise name or code..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-primary focus:bg-white"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8">
            {filteredFranchises.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <span className="material-symbols-outlined text-[36px] text-slate-400">
                  storefront
                </span>
                <p className="mt-3 text-base font-semibold text-slate-700">No franchise found</p>
                <p className="mt-1 text-sm text-slate-500">
                  Try another search keyword to continue.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredFranchises.map((franchise) => (
                  <button
                    key={franchise.value}
                    onClick={() => handleSelectFranchise(franchise.value)}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 transition-colors group-hover:bg-primary group-hover:text-white">
                          <span className="material-symbols-outlined text-[22px]">store</span>
                        </span>
                        <h2 className="mt-4 text-lg font-bold text-slate-900">
                          {franchise.name}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">{franchise.code}</p>
                      </div>

                      <span className="material-symbols-outlined text-slate-300 transition-colors group-hover:text-primary">
                        arrow_forward
                      </span>
                    </div>

                    <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      <span>Open calendar</span>
                      <span className="font-semibold text-slate-700">Shift workspace</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShiftFranchiseSelectionPage
