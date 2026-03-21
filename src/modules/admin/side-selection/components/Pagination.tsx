import { useState } from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  itemsPerPage?: number
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  const [pageInput, setPageInput] = useState('')

  if (totalPages <= 1) return null

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      const ws = Math.max(1, Math.min(currentPage - 1, totalPages - 2))
      const we = ws + 2
      if (ws > 2) { pages.push(1, '...') } else { for (let i = 1; i < ws; i++) pages.push(i) }
      for (let i = ws; i <= we; i++) pages.push(i)
      if (we < totalPages - 1) { pages.push('...', totalPages) } else { for (let i = we + 1; i <= totalPages; i++) pages.push(i) }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-border-brown bg-white hover:bg-primary/10 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-border-brown transition-colors"
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined text-xl">chevron_left</span>
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-10 h-10 text-primary/60"
            >
              •••
            </span>
          )
        }

        const pageNum = page as number
        const isActive = pageNum === currentPage

        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg border-2 font-semibold transition-colors ${
              isActive
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-primary border-border-brown hover:bg-primary/10 hover:border-primary'
            }`}
            aria-label={`Page ${pageNum}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNum}
          </button>
        )
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-border-brown bg-white hover:bg-primary/10 hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-border-brown transition-colors"
        aria-label="Next page"
      >
        <span className="material-symbols-outlined text-xl">chevron_right</span>
      </button>

      {/* Go to page */}
      <div className="flex items-center gap-2 ml-2">
        <span className="text-sm text-gray-500 whitespace-nowrap">Đến trang</span>
        <input
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={(e) => setPageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const n = Number.parseInt(pageInput, 10)
              if (!Number.isNaN(n) && n >= 1 && n <= totalPages) onPageChange(n)
              setPageInput('')
            }
          }}
          placeholder={String(currentPage)}
          className="w-14 h-10 border-2 border-border-brown rounded-lg text-center text-sm font-semibold outline-none focus:border-primary transition-colors"
        />
      </div>
    </div>
  )
}
