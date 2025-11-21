// import React from "react";
// import { Transaction } from "../../pages/DriverApp";

// interface DoDetailModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   modalData: Transaction | Transaction[] | null;
//   leditLoading: boolean;
//   leditError: string | null;
//   transactions?: Transaction[];
// }

// const DoDetailModal: React.FC<DoDetailModalProps> = ({
//   isOpen,
//   onClose,
//   modalData,
//   leditLoading,
//   leditError,
//   transactions,
// }) => {
//   if (!isOpen) return null;

//   console.log(modalData, "modalData in DoDetailModal");

//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white p-6 rounded shadow-lg min-w-[320px] max-w-[90vw]"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-lg font-bold">
//             รายละเอียด DO
//             {modalData &&
//               !Array.isArray(modalData) &&
//               (modalData.receive_code ) && (
//                 <span className="ml-2 text-base text-gray-600 font-normal">
//                   [{modalData.receive_code}]
//                 </span>
//               )}
//           </h2>
//           <button
//             className="text-gray-500 hover:text-gray-900"
//             onClick={onClose}
//           >
//             ×
//           </button>
//         </div>

//         <div className="overflow-x-auto">
//           {leditLoading && (
//             <div className="text-blue-500 py-2">กำลังโหลดรายละเอียด...</div>
//           )}
//           {leditError && <div className="text-red-500 py-2">{leditError}</div>}

//           <table className="min-w-full border-collapse">
//             <thead>
//               <tr>
//                 <th className="border px-2 py-1">datetime</th>
//                 <th className="border px-2 py-1">serial_no</th>
//                 <th className="border px-2 py-1">status_message</th>
//                 <th className="border px-2 py-1">from_warehouse</th>
//                 <th className="border px-2 py-1">to_warehouse</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Array.isArray(transactions) && transactions.length > 0 ? (
//                 transactions.map((item, idx) => (
//                   <tr key={item.id ?? idx}>
//                     <td className="border px-2 py-1">{item.datetime || "-"}</td>
//                     <td className="border px-2 py-1">
//                       {item.serial_no || "-"}
//                     </td>
//                     <td className="border px-2 py-1">
//                       {item.status_message || "-"}
//                     </td>
//                     <td className="border px-2 py-1">
//                       {item.from_warehouse || "-"}
//                     </td>
//                     <td className="border px-2 py-1">
//                       {item.to_warehouse || "-"}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td className="border px-2 py-1 text-center" colSpan={5}>
//                     ไม่มีข้อมูลรายละเอียด
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DoDetailModal;
