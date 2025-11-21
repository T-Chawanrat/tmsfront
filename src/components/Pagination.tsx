import React from "react";

interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageCount,
  onPageChange,
  disabled = false,
}) => {
  if (pageCount <= 1) return null;

  // แสดงเลขหน้าใกล้เคียงกับหน้าปัจจุบัน (เช่น 2 ก่อน-หลัง)
  const getPageNumbers = (): number[] => {
    const numbers: number[] = [];
    const min = Math.max(1, page - 2);
    const max = Math.min(pageCount, page + 2);
    for (let i = min; i <= max; i++) {
      numbers.push(i);
    }
    return numbers;
  };

  return (
    <div className="flex justify-center items-center gap-1 mt-6 select-none">
      <button
        disabled={page === 1 || disabled}
        onClick={() => onPageChange(1)}
        className={`px-2 py-1 rounded transition ${
          page === 1 || disabled
            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
            : "text-brand-700 hover:bg-brand-100"
        }`}
        title="หน้าแรก"
        type="button"
      >
        «
      </button>
      <button
        disabled={page === 1 || disabled}
        onClick={() => onPageChange(page - 1)}
        className={`px-2 py-1 rounded transition ${
          page === 1 || disabled
            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
            : "text-brand-700 hover:bg-brand-100"
        }`}
        title="ก่อนหน้า"
        type="button"
      >
        ‹
      </button>

      {/* แสดง ... ด้านซ้ายถ้าห่างจากหน้า 1 หลายหน้า */}
      {page > 3 && (
        <span className="px-2 text-gray-400">...</span>
      )}

      {getPageNumbers().map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`px-3 py-1 rounded font-semibold transition ${
            p === page
              ? "bg-brand-500 text-white shadow"
              : "text-brand-700 hover:bg-brand-100"
          }`}
          disabled={disabled}
          type="button"
        >
          {p}
        </button>
      ))}

      {/* แสดง ... ด้านขวาถ้าห่างจากหน้าสุดท้ายหลายหน้า */}
      {page < pageCount - 2 && (
        <span className="px-2 text-gray-400">...</span>
      )}

      <button
        disabled={page === pageCount || disabled}
        onClick={() => onPageChange(page + 1)}
        className={`px-2 py-1 rounded transition ${
          page === pageCount || disabled
            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
            : "text-brand-800 hover:bg-brand-100"
        }`}
        title="ถัดไป"
        type="button"
      >
        ›
      </button>
      <button
        disabled={page === pageCount || disabled}
        onClick={() => onPageChange(pageCount)}
        className={`px-2 py-1 rounded transition ${
          page === pageCount || disabled
            ? "text-gray-400 bg-gray-100 cursor-not-allowed"
            : "text-brand-800 hover:bg-brand-100"
        }`}
        title="หน้าสุดท้าย"
        type="button"
      >
        »
      </button>
      <span className="ml-3 text-gray-600 text-sm">
        {page} / {pageCount}
      </span>
    </div>
  );
};

export default Pagination;