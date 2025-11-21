// import React, { useEffect, useRef } from "react";
// import { useColumnWidths } from "../context/ColumnWidths";

// interface ResizableColumnsProps {
//   headers: string[];
//   pageKey: string;
//   sortBy?: string;
//   sortOrder?: "asc" | "desc";
//   onSort?: (headerKey: string) => void;
// }

// const headerKeyMapping: { [header: string]: string } = {
//   วันที่หมายเหตุล่าสุด: "create_date",
// };

// const ResizableColumns: React.FC<ResizableColumnsProps> = ({ headers, pageKey, sortBy, sortOrder, onSort }) => {
//   const { columnWidths, setColumnWidths, setPageKey } = useColumnWidths();
//   const isInitialized = useRef(false);

//   useEffect(() => {
//     if (!isInitialized.current) {
//       setPageKey(pageKey);
//       isInitialized.current = true;
//     } else if (pageKey) {
//       setPageKey(pageKey);
//     }
//   }, [pageKey, setPageKey]);

//   const handleMouseDown = (index: number, event: React.MouseEvent) => {
//     event.preventDefault();

//     const startX = event.clientX;
//     const startWidth = columnWidths[index];

//     const handleMouseMove = (moveEvent: MouseEvent) => {
//       const deltaX = moveEvent.clientX - startX;
//       const newWidth = Math.max(startWidth + deltaX, 50);
//       setColumnWidths((prevWidths) => prevWidths.map((width, i) => (i === index ? newWidth : width)));
//     };

//     const handleMouseUp = () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };

//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);
//   };

//   const handleTouchStart = (index: number, event: React.TouchEvent) => {
//     const startX = event.touches[0].clientX;
//     const startWidth = columnWidths[index] ?? 150;

//     const handleTouchMove = (moveEvent: TouchEvent) => {
//       const deltaX = moveEvent.touches[0].clientX - startX;
//       const newWidth = Math.max(startWidth + deltaX, 50);
//       setColumnWidths((prevWidths) => prevWidths.map((width, i) => (i === index ? newWidth : width)));
//     };

//     const handleTouchEnd = () => {
//       document.removeEventListener("touchmove", handleTouchMove);
//       document.removeEventListener("touchend", handleTouchEnd);
//     };

//     document.addEventListener("touchmove", handleTouchMove);
//     document.addEventListener("touchend", handleTouchEnd);
//   };

//   return (
//     <thead className="bg-gray-100">
//       <tr>
//         {headers.map((header, index) => {
//           const sortable = headerKeyMapping[header] && onSort;
//           const isActiveSort = sortBy === headerKeyMapping[header];

//           return (
//             <th
//               key={index}
//               style={{ width: `${columnWidths[index] || 120}px` }}
//               className="relative px-4 py-2 border-b text-left border-gray-200 select-none"
//             >
//               <div className="flex items-center justify-between">
//                 <span
//                   className={sortable ? "cursor-pointer flex items-center gap-1" : ""}
//                   onClick={sortable ? () => onSort && onSort(headerKeyMapping[header]) : undefined}
//                   style={{
//                     fontWeight: isActiveSort ? "bold" : undefined,
//                   }}
//                   tabIndex={sortable ? 0 : undefined}
//                   role={sortable ? "button" : undefined}
//                 >
//                   {header}
//                   {/* sort icon */}
//                   {sortable && <span>{isActiveSort ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}</span>}
//                 </span>
//                 <span
//                   className="absolute right-0 top-0 h-full w-1 bg-transparent cursor-col-resize border-r-1 border-gray-300"
//                   onMouseDown={(e) => handleMouseDown(index, e)}
//                   onTouchStart={(e) => handleTouchStart(index, e)}
//                 />
//               </div>
//             </th>
//           );
//         })}
//       </tr>
//     </thead>
//   );
// };

// export default ResizableColumns;

import React, { useEffect, useRef } from "react";
import { useColumnWidths } from "../context/ColumnWidths";

interface ResizableColumnsProps {
  headers: string[];
  pageKey: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (headerKey: string) => void;
}

const headerKeyMapping: { [header: string]: string } = {
  วันที่หมายเหตุล่าสุด: "create_date",
};

const ResizableColumns: React.FC<ResizableColumnsProps> = ({
  headers,
  pageKey,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const { columnWidths, setColumnWidths, setPageKey } = useColumnWidths();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      setPageKey(pageKey);
      isInitialized.current = true;
    } else if (pageKey) {
      setPageKey(pageKey);
    }
  }, [pageKey, setPageKey]);

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    event.preventDefault();

    const startX = event.clientX;
    const startWidth = columnWidths[index];

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(startWidth + deltaX, 50);
      setColumnWidths((prevWidths) =>
        prevWidths.map((width, i) => (i === index ? newWidth : width))
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (index: number, event: React.TouchEvent) => {
    const startX = event.touches[0].clientX;
    const startWidth = columnWidths[index] ?? 150;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const deltaX = moveEvent.touches[0].clientX - startX;
      const newWidth = Math.max(startWidth + deltaX, 50);
      setColumnWidths((prevWidths) =>
        prevWidths.map((width, i) => (i === index ? newWidth : width))
      );
    };

    const handleTouchEnd = () => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  };

  // 🔥 Auto fit column ด้วย double-click ที่เส้นแบ่ง header
  const handleAutoFit = (
    index: number,
    event: React.MouseEvent<HTMLSpanElement>
  ) => {
    const handleElement = event.currentTarget as HTMLElement;
    const table = handleElement.closest("table");
    if (!table) return;

    const rows = Array.from(table.querySelectorAll("tr"));
    let maxWidth = 60; // ค่าเริ่มต้นขั้นต่ำ

    rows.forEach((row) => {
      const cell = row.children[index] as HTMLElement | undefined;
      if (!cell) return;

      // พยายามหา content จริงด้านในก่อน ถ้าไม่มีใช้ cell ตรง ๆ
      const inner =
        (cell.querySelector("span, div, p") as HTMLElement | null) || cell;

      const width = inner.scrollWidth + 16; // + padding เผื่อ
      if (width > maxWidth) maxWidth = width;
    });

    setColumnWidths((prevWidths) =>
      prevWidths.map((width, i) => (i === index ? maxWidth : width))
    );
  };

  return (
    <thead className="bg-gray-100">
      <tr>
        {headers.map((header, index) => {
          const sortable = headerKeyMapping[header] && onSort;
          const isActiveSort = sortBy === headerKeyMapping[header];

          return (
            // <th
            //   key={index}
            //   style={{ width: `${columnWidths[index] || 120}px` }}
            //   className="relative px-4 py-2 border-b text-left border-gray-200 select-none"
            // >
            <th
              key={index}
              style={{ width: `${columnWidths[index] || 120}px` }}
              className="relative px-4 py-2 border-b text-left border-gray-200 select-none bg-gray-100 sticky top-0 z-20"
            >
              <div className="flex items-center justify-between">
                <span
                  className={
                    sortable ? "cursor-pointer flex items-center gap-1" : ""
                  }
                  onClick={
                    sortable
                      ? () => onSort && onSort(headerKeyMapping[header])
                      : undefined
                  }
                  style={{
                    fontWeight: isActiveSort ? "bold" : undefined,
                  }}
                  tabIndex={sortable ? 0 : undefined}
                  role={sortable ? "button" : undefined}
                >
                  {header}
                  {/* sort icon */}
                  {sortable && (
                    <span>
                      {isActiveSort ? (sortOrder === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  )}
                </span>

                {/* เส้นสำหรับ resize + double-click auto fit */}
                <span
                  className="absolute right-0 top-0 h-full w-1 bg-transparent cursor-col-resize border-r-1 border-gray-300"
                  onMouseDown={(e) => handleMouseDown(index, e)}
                  onDoubleClick={(e) => handleAutoFit(index, e)}
                  onTouchStart={(e) => handleTouchStart(index, e)}
                />
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default ResizableColumns;
