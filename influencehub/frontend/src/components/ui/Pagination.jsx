import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageRange(current, total, siblings = 1) {
  const range = []
  const left = Math.max(2, current - siblings)
  const right = Math.min(total - 1, current + siblings)

  range.push(1)
  if (left > 2) range.push('...')
  for (let i = left; i <= right; i++) range.push(i)
  if (right < total - 1) range.push('...')
  if (total > 1) range.push(total)
  return range
}

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblingsCount = 1,
}) {
  if (totalPages <= 1) return null
  const pages = getPageRange(currentPage, totalPages, siblingsCount)

  const btnBase = 'h-[32px] min-w-[32px] border border-[#E0E0DB] rounded-[6px] flex items-center justify-center text-[13px] font-medium cursor-pointer hover:bg-[#F5F5F0] transition-colors'

  return (
    <div className="flex justify-center gap-[4px] mt-[24px]">
      <button
        onClick={() => onPageChange?.(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} px-[12px] ${currentPage === 1 ? 'text-[#C4C4BF] cursor-not-allowed' : 'text-[#1C1C1C]'}`}
      >
        <ChevronLeft size={14} />
        <span className="ml-1">Prev</span>
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`e${i}`} className="w-[24px] flex items-center justify-center text-[13px] text-[#888888]">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange?.(page)}
            className={`${btnBase} ${
              page === currentPage
                ? 'bg-[#108A00] border-[#108A00] text-white'
                : 'text-[#1C1C1C]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange?.(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} px-[12px] ${currentPage === totalPages ? 'text-[#C4C4BF] cursor-not-allowed' : 'text-[#1C1C1C]'}`}
      >
        <span className="mr-1">Next</span>
        <ChevronRight size={14} />
      </button>
    </div>
  )
}
