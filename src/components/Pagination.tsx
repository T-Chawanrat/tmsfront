// import React from "react";

// interface PaginationProps {
//   page: number;
//   pageCount: number;
//   onPageChange: (page: number) => void;
//   disabled?: boolean;
// }

// const Pagination: React.FC<PaginationProps> = ({
//   page,
//   pageCount,
//   onPageChange,
//   disabled = false,
// }) => {
//   if (pageCount <= 1) return null;

//   // แสดงเลขหน้าใกล้เคียงกับหน้าปัจจุบัน (เช่น 2 ก่อน-หลัง)
//   const getPageNumbers = (): number[] => {
//     const numbers: number[] = [];
//     const min = Math.max(1, page - 2);
//     const max = Math.min(pageCount, page + 2);
//     for (let i = min; i <= max; i++) {
//       numbers.push(i);
//     }
//     return numbers;
//   };

//   return (
//     <div className="flex justify-center items-center gap-1 mt-6 select-none">
//       <button
//         disabled={page === 1 || disabled}
//         onClick={() => onPageChange(1)}
//         className={`px-2 py-1 rounded transition ${
//           page === 1 || disabled
//             ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//             : "text-brand-700 hover:bg-brand-100"
//         }`}
//         title="หน้าแรก"
//         type="button"
//       >
//         «
//       </button>
//       <button
//         disabled={page === 1 || disabled}
//         onClick={() => onPageChange(page - 1)}
//         className={`px-2 py-1 rounded transition ${
//           page === 1 || disabled
//             ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//             : "text-brand-700 hover:bg-brand-100"
//         }`}
//         title="ก่อนหน้า"
//         type="button"
//       >
//         ‹
//       </button>

//       {/* แสดง ... ด้านซ้ายถ้าห่างจากหน้า 1 หลายหน้า */}
//       {page > 3 && (
//         <span className="px-2 text-gray-400">...</span>
//       )}

//       {getPageNumbers().map((p) => (
//         <button
//           key={p}
//           onClick={() => onPageChange(p)}
//           className={`px-3 py-1 rounded font-semibold transition ${
//             p === page
//               ? "bg-brand-500 text-white shadow"
//               : "text-brand-700 hover:bg-brand-100"
//           }`}
//           disabled={disabled}
//           type="button"
//         >
//           {p}
//         </button>
//       ))}

//       {/* แสดง ... ด้านขวาถ้าห่างจากหน้าสุดท้ายหลายหน้า */}
//       {page < pageCount - 2 && (
//         <span className="px-2 text-gray-400">...</span>
//       )}

//       <button
//         disabled={page === pageCount || disabled}
//         onClick={() => onPageChange(page + 1)}
//         className={`px-2 py-1 rounded transition ${
//           page === pageCount || disabled
//             ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//             : "text-brand-800 hover:bg-brand-100"
//         }`}
//         title="ถัดไป"
//         type="button"
//       >
//         ›
//       </button>
//       <button
//         disabled={page === pageCount || disabled}
//         onClick={() => onPageChange(pageCount)}
//         className={`px-2 py-1 rounded transition ${
//           page === pageCount || disabled
//             ? "text-gray-400 bg-gray-100 cursor-not-allowed"
//             : "text-brand-800 hover:bg-brand-100"
//         }`}
//         title="หน้าสุดท้าย"
//         type="button"
//       >
//         »
//       </button>
//       <span className="ml-3 text-gray-600 text-sm">
//         {page} / {pageCount}
//       </span>
//     </div>
//   );
// };

// export default Pagination;

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

  const go = (p: number) => {
    if (disabled) return;
    const next = Math.max(1, Math.min(pageCount, p));
    if (next === page) return;
    onPageChange(next);
  };

  const getPageNumbers = (): number[] => {
    const numbers: number[] = [];
    const min = Math.max(1, page - 2);
    const max = Math.min(pageCount, page + 2);
    for (let i = min; i <= max; i++) numbers.push(i);
    return numbers;
  };

  const baseBtn =
    "h-9 min-w-[36px] px-3 rounded-full text-sm font-medium transition border shadow-sm";
  const normalBtn =
    "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98]";
  const activeBtn =
    "bg-blue-600 border-blue-600 text-white hover:bg-blue-700 hover:border-blue-700";
  const disabledBtn =
    "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed shadow-none";

  const iconBtn = "w-9 px-0";

  return (
    <div className="mt-4 flex flex-col items-center gap-2">
      {/* Card */}
      <div className="inline-flex items-center gap-1  bg-white/90 px-2 py-2">
        {/* First */}
        <button
          type="button"
          title="หน้าแรก"
          disabled={page === 1 || disabled}
          onClick={() => go(1)}
          className={[
            baseBtn,
            iconBtn,
            page === 1 || disabled ? disabledBtn : normalBtn,
          ].join(" ")}
        >
          «
        </button>

        {/* Prev */}
        <button
          type="button"
          title="ก่อนหน้า"
          disabled={page === 1 || disabled}
          onClick={() => go(page - 1)}
          className={[
            baseBtn,
            iconBtn,
            page === 1 || disabled ? disabledBtn : normalBtn,
          ].join(" ")}
        >
          ‹
        </button>

        {/* Left dots */}
        {page > 3 && (
          <span className="mx-1 inline-flex h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400">
            ...
          </span>
        )}

        {/* Pages */}
        {getPageNumbers().map((p) => (
          <button
            key={p}
            type="button"
            disabled={disabled}
            onClick={() => go(p)}
            className={[
              baseBtn,
              p === page ? activeBtn : normalBtn,
              disabled ? disabledBtn : "",
            ].join(" ")}
          >
            {p}
          </button>
        ))}

        {/* Right dots */}
        {page < pageCount - 2 && (
          <span className="mx-1 inline-flex h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400">
            ...
          </span>
        )}

        {/* Next */}
        <button
          type="button"
          title="ถัดไป"
          disabled={page === pageCount || disabled}
          onClick={() => go(page + 1)}
          className={[
            baseBtn,
            iconBtn,
            page === pageCount || disabled ? disabledBtn : normalBtn,
          ].join(" ")}
        >
          ›
        </button>

        {/* Last */}
        <button
          type="button"
          title="หน้าสุดท้าย"
          disabled={page === pageCount || disabled}
          onClick={() => go(pageCount)}
          className={[
            baseBtn,
            iconBtn,
            page === pageCount || disabled ? disabledBtn : normalBtn,
          ].join(" ")}
        >
          »
        </button>

        {/* Counter */}
        <span className="ml-2 hidden sm:inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
          หน้า {page} / {pageCount}
        </span>
      </div>

      {/* Mobile counter */}
      <div className="sm:hidden text-xs font-semibold text-slate-600">
        หน้า {page} / {pageCount}
      </div>
    </div>
  );
};

export default Pagination;
