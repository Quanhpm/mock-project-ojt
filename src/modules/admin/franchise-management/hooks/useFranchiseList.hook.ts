import { useEffect, useMemo, useState } from 'react'

export function usePaginatedList<T>(items: T[], pageSize = 5) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Clamp page (xóa item ở trang cuối không bị trống)
  useEffect(() => {
    setCurrentPage((p) => (p > totalPages ? totalPages : p))
  }, [totalPages])

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    pageItems,
    pageSize,
    totalItems: items.length,
  }
}
