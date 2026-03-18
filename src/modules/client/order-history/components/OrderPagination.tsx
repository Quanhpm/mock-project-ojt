import { PAGE_SIZE } from '../order.config';

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
}

function OrderPagination({
  currentPage,
  totalPages,
  filteredCount,
  onPageChange,
}: OrderPaginationProps) {
  const startItem = (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, filteredCount);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-zinc-200 shadow-xl">
      <div className="text-sm text-[#5e544e]">
        Hiển thị <span className="font-semibold text-[#161413]">{startItem}</span> đến{' '}
        <span className="font-semibold text-[#161413]">{endItem}</span> trong tổng số{' '}
        <span className="font-semibold text-[#161413]">{filteredCount}</span> đơn hàng
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg bg-white border-2 border-zinc-300 text-[#161413] text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:border-primary hover:text-white hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          Trước
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg text-sm font-bold cursor-pointer transition-all duration-200 border-2 active:scale-95 ${currentPage === page
              ? 'bg-primary text-white shadow-lg border-primary'
              : 'bg-white text-[#161413] border-zinc-300 hover:bg-primary hover:border-primary hover:text-white hover:shadow-lg'
              }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg bg-white border-2 border-zinc-300 text-[#161413] text-sm font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary hover:border-primary hover:text-white hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          Sau
        </button>
      </div>
    </div>
  );
}

export default OrderPagination;
