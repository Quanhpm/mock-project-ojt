interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      // Hiển thị tất cả nếu <= 7 pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Hiển thị với ellipsis
      pages.push(1)
      
      if (currentPage > 3) {
        pages.push('...')
      }
      
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...')
      }
      
      pages.push(totalPages)
    }
    
    return pages
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <span className="material-symbols-outlined text-lg">chevron_left</span>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-10 h-10 text-gray-500"
            >
              ...
            </span>
          )
        }

        const pageNumber = page as number
        const isActive = pageNumber === currentPage

        return (
          <button
            key={pageNumber}
            onClick={() => onPageChange(pageNumber)}
            className={`flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all ${
              isActive
                ? 'bg-primary text-white shadow-md'
                : 'border border-gray-300 hover:bg-gray-50 text-gray-700'
            }`}
            aria-label={`Page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        )
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <span className="material-symbols-outlined text-lg">chevron_right</span>
      </button>
    </div>
  )
}
