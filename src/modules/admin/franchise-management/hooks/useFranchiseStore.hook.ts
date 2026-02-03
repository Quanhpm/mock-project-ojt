import { useEffect, useMemo, useReducer } from 'react'

/** ================== Types ================== */
export interface Franchise {
  id: string
  title: string
  location: string
  status: 'draft' | 'published' | 'inactive'
  createdAt: string // YYYY-MM-DD
  contact: string
}

export type FranchiseCreateInput = {
  title: string
  location: string
  contact: string
  status?: Franchise['status']
}

export type FranchiseUpdateInput = Partial<FranchiseCreateInput> & {
  status?: Franchise['status']
}

export type FranchiseStatusFilter = 'all' | Franchise['status']

export interface FranchiseFilters {
  searchTerm: string
  statusFilter: FranchiseStatusFilter
}

/** ================== Mock Seed ================== */
const SEED: Franchise[] = [
  {
    id: '1',
    title: 'Nhượng quyền Cafe Highlands',
    location: 'TP.HCM - Quận 1',
    status: 'published',
    createdAt: '2024-10-01',
    contact: '0123456789',
  },
  {
    id: '2',
    title: 'Nhượng quyền Cafe OJT',
    location: 'Hà Nội - Hoàn Kiếm',
    status: 'draft',
    createdAt: '2024-10-05',
    contact: '0987654321',
  },
  {
    id: '3',
    title: 'Nhượng quyền Cafe Central',
    location: 'TP.HCM - Quận 7',
    status: 'published',
    createdAt: '2024-10-10',
    contact: '0912345678',
  },
  {
    id: '4',
    title: 'Nhượng quyền Cafe Downtown',
    location: 'Đà Nẵng',
    status: 'inactive',
    createdAt: '2024-09-15',
    contact: '0956789012',
  },
]

/** ================== Helpers ================== */
function toYMD(d: Date) {
  return d.toISOString().slice(0, 10)
}

function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

function applyFilters(items: Franchise[], filters: FranchiseFilters) {
  const term = normalize(filters.searchTerm)

  return items.filter((f) => {
    const okSearch =
      term === '' ||
      normalize(f.title).includes(term) ||
      normalize(f.location).includes(term) ||
      normalize(f.contact).includes(term)

    const okStatus = filters.statusFilter === 'all' || f.status === filters.statusFilter
    return okSearch && okStatus
  })
}

/** ================== Reducer ================== */
type State = {
  items: Franchise[]
}

type Action =
  | { type: 'seed'; payload: Franchise[] }
  | { type: 'create'; payload: Franchise }
  | { type: 'update'; payload: { id: string; data: FranchiseUpdateInput } }
  | { type: 'delete'; payload: { id: string } }
  | { type: 'toggleStatus'; payload: { id: string } }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'seed':
      return { items: action.payload }

    case 'create':
      return { items: [action.payload, ...state.items] }

    case 'update': {
      const { id, data } = action.payload
      return {
        items: state.items.map((it) => {
          if (it.id !== id) return it
          return {
            ...it,
            ...data,
            title: data.title !== undefined ? data.title.trim() : it.title,
            location: data.location !== undefined ? data.location.trim() : it.location,
            contact: data.contact !== undefined ? data.contact.trim() : it.contact,
            status: data.status ?? it.status,
          }
        }),
      }
    }

    case 'delete':
      return { items: state.items.filter((it) => it.id !== action.payload.id) }

    case 'toggleStatus':
      return {
        items: state.items.map((it) =>
          it.id === action.payload.id
            ? { ...it, status: it.status === 'inactive' ? 'published' : 'inactive' }
            : it
        ),
      }

    default:
      return state
  }
}

/** ================== Hook ================== */
export function useFranchiseStore(filters: FranchiseFilters) {
  const [state, dispatch] = useReducer(reducer, { items: [] })

  // Seed mock 1 lần
  useEffect(() => {
    dispatch({ type: 'seed', payload: SEED })
  }, [])

  const filtered = useMemo(() => applyFilters(state.items, filters), [state.items, filters])

  const create = (input: FranchiseCreateInput) => {
    const item: Franchise = {
      id: newId(),
      createdAt: toYMD(new Date()),
      status: input.status ?? 'draft',
      title: input.title.trim(),
      location: input.location.trim(),
      contact: input.contact.trim(),
    }
    dispatch({ type: 'create', payload: item })
  }

  const update = (id: string, data: FranchiseUpdateInput) => {
    dispatch({ type: 'update', payload: { id, data } })
  }

  const remove = (id: string) => {
    dispatch({ type: 'delete', payload: { id } })
  }

  const toggleStatus = (id: string) => {
    dispatch({ type: 'toggleStatus', payload: { id } })
  }

  return {
    items: state.items,
    filtered,
    create,
    update,
    remove,
    toggleStatus,
  }
}
