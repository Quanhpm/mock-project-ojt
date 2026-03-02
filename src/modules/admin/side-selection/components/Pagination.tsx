interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  // Tạo mảng số trang với logic ellipsis thông minh
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      // Nếu ≤7 trang: hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // >7 trang: hiển thị với ellipsis
      pages.push(1)
      
      if (currentPage <= 3) {
        // Gần đầu: 1 2 3 4 ... 10
        pages.push(2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Gần cuối: 1 ... 7 8 9 10
        pages.push('...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Ở giữa: 1 ... 4 5 6 ... 10
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
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
    </div>
  )
}
