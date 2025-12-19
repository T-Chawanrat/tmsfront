// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import ResizableColumns from "../components/ResizableColumns";

// type BillRow = {
//   id: number;
//   SERIAL_NO: string;
//   REFERENCE: string;
//   CUSTOMER_NAME: string;
//   RECIPIENT_NAME: string;
//   RECIPIENT_ADDRESS: string;
//   RECIPIENT_SUBDISTRICT: string;
//   RECIPIENT_DISTRICT: string;
//   RECIPIENT_PROVINCE: string;
//   RECIPIENT_ZIPCODE: string;
//   warehouse_name: string;
// };

// type LabelRow = BillRow & {
//   barcode_url: string;
//   qr_url: string;
// };

// export default function LabelPage() {
//   const { user } = useAuth();

//   const [bills, setBills] = useState<BillRow[]>([]);
//   const [labels, setLabels] = useState<LabelRow[]>([]);
//   const [loadingBills, setLoadingBills] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [step, setStep] = useState<"bills" | "labels">("bills");
//   const [selectedIds, setSelectedIds] = useState<number[]>([]);

//   const toggleSelect = (id: number) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
//     );
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.length === bills.length) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(bills.map((b) => b.id));
//     }
//   };

//   // 1) โหลด bills_data + label info (ของ user นี้) จาก /api/print-labels แค่ครั้งเดียว
//   useEffect(() => {
//     const fetchBillsAndLabels = async () => {
//       if (!user?.user_id) return;
//       setLoadingBills(true);
//       setError(null);

//       try {
//         const res = await axios.get("https://xsendwork.com/api/print-labels", {
//           params: {
//             user_id: user.user_id,
//           },
//         });

//         if (res.data?.success) {
//           const rows = res.data.data || [];
//           setBills(rows); // ใช้แสดงตารางลิสต์
//           setLabels(rows); // ใช้ preview labels (มี barcode_url, qr_url แล้ว)
//         } else {
//           setError(res.data?.message || "ดึงรายการบิลไม่สำเร็จ");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("เกิดข้อผิดพลาดในการดึงรายการบิล");
//       } finally {
//         setLoadingBills(false);
//       }
//     };

//     fetchBillsAndLabels();
//   }, [user?.user_id]);

//   // 2) กดปุ่มสร้าง Label → แค่เปลี่ยน step ไปหน้า preview (ไม่ต้องยิง API อีก)
//   const handleCreateLabels = () => {
//     if (!selectedIds.length) {
//       setError("กรุณาเลือกรายการอย่างน้อย 1 รายการ");
//       return;
//     }

//     // filter เฉพาะที่ถูกเลือก
//     const filtered = labels.filter((r) => selectedIds.includes(r.id));
//     setLabels(filtered);

//     setStep("labels");
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleBackToBills = () => {
//     setStep("bills");
//   };

//   const headers = [
//     <div className="flex justify-center w-[10px]" key="select-all">
//       <input
//         type="checkbox"
//         checked={bills.length > 0 && selectedIds.length === bills.length}
//         onChange={toggleSelectAll}
//       />
//     </div>,
//     "ลำดับ",
//     "SERIAL_NO",
//     "REFERENCE",
//     "CUSTOMER_NAME",
//     "RECIPIENT_ADDRESS",
//     "warehouse_name",
//   ];

//   return (
//     <div className="font-thai w-full p-4 bg-gray-100 print:bg-white">
//       {/* Header + ปุ่มด้านบน (ซ่อนตอน print) */}
//       <div className="mb-4 flex items-center justify-between print:hidden">
//         <h2 className="text-xl font-bold">
//           {step === "bills"
//             ? "รายการบิลสำหรับสร้าง Label"
//             : "พิมพ์สติ๊กเกอร์ (Labels)"}
//         </h2>

//         <div className="flex gap-2 items-center">
//           <span className="text-sm text-gray-600">
//             ผู้ใช้: {user?.first_name || user?.username}
//           </span>

//           {step === "bills" ? (
//             <button
//               onClick={handleCreateLabels}
//               disabled={!bills.length}
//               className={`px-4 py-2 rounded text-white font-medium ${
//                 !bills.length
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700"
//               }`}
//             >
//               สร้าง Label สำหรับรายการนี้
//             </button>
//           ) : (
//             <>
//               <button
//                 onClick={handleBackToBills}
//                 className="px-3 py-2 rounded text-sm font-medium bg-gray-300 hover:bg-gray-400 text-gray-800"
//               >
//                 ย้อนกลับ
//               </button>
//               <button
//                 onClick={handlePrint}
//                 disabled={!labels.length}
//                 className={`px-4 py-2 rounded text-white font-medium ${
//                   !labels.length
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-green-600 hover:bg-green-700"
//                 }`}
//               >
//                 พิมพ์
//               </button>
//             </>
//           )}
//         </div>
//       </div>

//       {/* แสดง error */}
//       {error && (
//         <div className="mb-4 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
//           {error}
//         </div>
//       )}

//       {/* STEP 1: ตาราง bills_data */}
//       {step === "bills" && (
//         <>
//           {loadingBills && (
//             <div className="text-center text-gray-600">
//               กำลังโหลดรายการบิล...
//             </div>
//           )}

//           {!loadingBills && !bills.length && !error && (
//             <div className="text-center text-gray-500">
//               ยังไม่มีบิลสำหรับสร้าง Label
//             </div>
//           )}

//           {/* {bills.length > 0 && (
//             <div className="overflow-x-auto border border-gray-300 rounded bg-white">
//               <table className="w-sm table-fixed border-collapse"> */}
//                 {/* หัวตาราง: ใช้ ResizableColumns + ให้มันวาด checkbox all เป็นคอลัมน์แรก */}
//                 {/* <ResizableColumns headers={headers} pageKey="labels-page" /> */}
// {/*
//                 <tbody>
//                   {bills.map((b, idx) => (
//                     <tr
//                       key={b.id}
//                       className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                     > */}
//                       {/* คอลัมน์แรก: checkbox ของแต่ละแถว */}
//                       {/* <td className="px-2 py-1 border-b text-center">
//                         <input
//                           type="checkbox"
//                           checked={selectedIds.includes(b.id)}
//                           onChange={() => toggleSelect(b.id)}
//                         />
//                       </td> */}

//                       {/* ลำดับ */}
//                       {/* <td className="px-3 py-1 border-b text-sm bg-gray-100 font-semibold text-center">
//                         {idx + 1}
//                       </td>
//                       <td className="px-3 py-1 border-b text-sm truncate">
//                         {b.SERIAL_NO || "-"}
//                       </td>
//                       <td className="px-3 py-1 border-b text-sm truncate">
//                         {b.REFERENCE || "-"}
//                       </td>
//                       <td className="px-3 py-1 border-b text-sm truncate">
//                         {b.CUSTOMER_NAME || "-"}
//                       </td>
//                       <td className="px-3 py-1 border-b text-sm truncate">
//                         {b.RECIPIENT_ADDRESS
//                           ? `${b.RECIPIENT_NAME || ""} ${
//                               b.RECIPIENT_ADDRESS
//                             } ต.${b.RECIPIENT_SUBDISTRICT} อ.${
//                               b.RECIPIENT_DISTRICT
//                             } จ.${b.RECIPIENT_PROVINCE} ${b.RECIPIENT_ZIPCODE}`
//                           : "-"}
//                       </td>
//                       <td className="px-3 py-1 border-b text-sm truncate">
//                         {b.warehouse_name || "-"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )} */}

//           {bills.length > 0 && (
//   <div className="border border-gray-300 rounded bg-white">
//     {/* เลื่อนแนวนอนกรณีจอเล็ก */}
//     <div className="overflow-x-auto">
//       {/* เลื่อนแนวตั้ง (ลิสต์ยาว) */}
//       <div className="max-h-[85vh] overflow-y-auto">
//         <table className="w-sm table-fixed border-collapse">
//           {/* หัวตาราง: ใช้ ResizableColumns */}
//           <ResizableColumns headers={headers} pageKey="labels-page" />

//           <tbody>
//             {bills.map((b, idx) => (
//               <tr
//                 key={b.id}
//                 className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//               >
//                 {/* คอลัมน์แรก: checkbox */}
//                 <td className="w-[10px] px-2 py-1 border-b border-gray-300 text-center align-middle">
//                   <input
//                     type="checkbox"
//                     checked={selectedIds.includes(b.id)}
//                     onChange={() => toggleSelect(b.id)}
//                   />
//                 </td>

//                 {/* ลำดับ */}
//                 <td className="w-[60px] px-3 py-1 border-b border-gray-300 text-sm bg-gray-100 font-semibold text-center">
//                   {idx + 1}
//                 </td>

//                 <td className="px-3 py-1 border-b border-gray-300 text-sm truncate">
//                   {b.SERIAL_NO || "-"}
//                 </td>
//                 <td className="px-3 py-1 border-b border-gray-300 text-sm truncate">
//                   {b.REFERENCE || "-"}
//                 </td>
//                 <td className="px-3 py-1 border-b border-gray-300 text-sm truncate">
//                   {b.CUSTOMER_NAME || "-"}
//                 </td>
//                 <td className="px-3 py-1 border-b border-gray-300 text-sm truncate">
//                   {b.RECIPIENT_ADDRESS
//                     ? `${b.RECIPIENT_NAME || ""} ${
//                         b.RECIPIENT_ADDRESS
//                       } ต.${b.RECIPIENT_SUBDISTRICT} อ.${
//                         b.RECIPIENT_DISTRICT
//                       } จ.${b.RECIPIENT_PROVINCE} ${b.RECIPIENT_ZIPCODE}`
//                     : "-"}
//                 </td>
//                 <td className="px-3 py-1 border-b border-gray-300 text-sm truncate">
//                   {b.warehouse_name || "-"}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   </div>
// )}

//         </>
//       )}

//       {/* STEP 2: Preview Labels + Print */}
//       {step === "labels" && (
//         <div
//           className="
//             flex flex-wrap gap-4
//             print:gap-0 print:m-0
//           "
//         >
//           {labels.map((row) => (
//             <div
//               key={row.id}
//               className="
//                 bg-white border border-gray-300 rounded shadow-sm
//                 p-2 box-border
//                 print:shadow-none print:border print:border-black
//               "
//               style={{
//                 width: "10cm",
//                 height: "7.5cm",
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "space-between",
//               }}
//             >
//               <div className="flex flex-col gap-1">
//                 {row.barcode_url && (
//                   <div className="flex flex-col">
//                     <img
//                       src={row.barcode_url}
//                       alt={`BARCODE_${row.SERIAL_NO}`}
//                       style={{ maxWidth: "100%", maxHeight: "1.5cm" }}
//                     />

//                     {/* 🔥 ตัวหนังสือใต้บาร์โค้ด */}
//                     <div className="text-lg tracking-widest font-bold text-center">
//                       {row.SERIAL_NO}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* ที่อยู่ผู้รับ */}
//               <div className="text-[10px] leading-snug mt-1">
//                 <div className="font-semibold">
//                   ผู้รับ: {row.RECIPIENT_NAME || "-"}
//                 </div>
//                 <div>
//                   ที่อยู่: {row.RECIPIENT_ADDRESS || "-"}
//                   ต.{row.RECIPIENT_SUBDISTRICT || "-"} อ.
//                   {row.RECIPIENT_DISTRICT || "-"} จ.
//                   {row.RECIPIENT_PROVINCE || "-"} {row.RECIPIENT_ZIPCODE || ""}
//                 </div>
//                 <div>ปลายทาง: {row.warehouse_name || "-"}</div>
//               </div>

//               {/* QR + text เพิ่มเติม */}
//               <div className="flex justify-between items-center mt-1">
//                 <div className="text-[10px]">
//                   <div>Ref: {row.REFERENCE || "-"}</div>

//                   <div>
//                     วันที่: {new Date().toLocaleDateString("th-TH")}{" "}
//                     &nbsp;&nbsp; เวลา:{" "}
//                     {new Date().toLocaleTimeString("th-TH", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}{" "}
//                     น.
//                   </div>
//                   <div className="mt-1">
//                     จัดส่งโดย: บริษัท ทรานเทค แมนเนจเม้นท์ กรุ๊ปส์ จำกัด
//                   </div>
//                   <div>โทร. 065-005-2555</div>
//                 </div>

//                 {row.qr_url && (
//                   <img
//                     src={row.qr_url}
//                     alt={`QR_${row.SERIAL_NO}`}
//                     style={{ width: "2.8cm", height: "2.8cm" }}
//                   />
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import ResizableColumns from "../components/ResizableColumns";
// import DatePicker from "react-datepicker";
// import { format } from "date-fns";
// import { FilterDropdown } from "../components/dropdown/FilterDropdown";

// type BillRow = {
//   id: number;
//   SERIAL_NO: string;
//   REFERENCE: string;
//   CUSTOMER_NAME: string;
//   RECIPIENT_NAME: string;
//   RECIPIENT_ADDRESS: string;
//   RECIPIENT_SUBDISTRICT: string;
//   RECIPIENT_DISTRICT: string;
//   RECIPIENT_PROVINCE: string;
//   RECIPIENT_ZIPCODE: string;
//   RECIPIENT_CODE: string;
//   warehouse_name: string;
// };

// type LabelRow = BillRow & {
//   barcode_url?: string;
//   qr_url?: string;
// };

// export default function LabelPage() {
//   const { user } = useAuth();
//   const [bills, setBills] = useState<BillRow[]>([]);
//   const [labels, setLabels] = useState<LabelRow[]>([]);
//   const [loadingBills, setLoadingBills] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [step, setStep] = useState<"bills" | "labels">("bills");
//   const [selectedIds, setSelectedIds] = useState<number[]>([]);

//   const [showReprint, setShowReprint] = useState(false);
//   const [reprintLoading, setReprintLoading] = useState(false);
//   const [reprintRows, setReprintRows] = useState<LabelRow[]>([]);
//   const [reprintSelectedIds, setReprintSelectedIds] = useState<number[]>([]);
//   const [reprintAllRows, setReprintAllRows] = useState<LabelRow[]>([]);

//   const [filters, setFilters] = useState<{
//     serial: string;
//     reference: string;
//     date: string; // ✅ string
//     customer_name: string;
//     warehouse_name: string;
//   }>({
//     serial: "",
//     reference: "",
//     date: "",
//     customer_name: "",
//     warehouse_name: "",
//   });

//   const toggleSelect = (id: number) => {
//     setSelectedIds((prev) => {
//       const next = prev.includes(id)
//         ? prev.filter((x) => x !== id)
//         : [...prev, id];
//       if (next.length > 0) {
//         setError(null); // มีการเลือกรายการแล้ว ล้าง error
//       }
//       return next;
//     });
//   };

//   const toggleSelectAll = () => {
//     if (selectedIds.length === bills.length) {
//       setSelectedIds([]);
//     } else {
//       setSelectedIds(bills.map((b) => b.id));
//       if (bills.length > 0) {
//         setError(null);
//       }
//     }
//   };

//   useEffect(() => {
//     const fetchBillsAndLabels = async () => {
//       if (!user?.user_id) return;
//       setLoadingBills(true);
//       setError(null);

//       try {
//         const res = await axios.get("https://xsendwork.com/api/print-labels", {
//           params: {
//             user_id: user.user_id,
//           },
//         });

//         if (res.data?.success) {
//           const rows = res.data.data || [];
//           setBills(rows);
//           setLabels(rows);
//         } else {
//           setError(res.data?.message || "ดึงรายการบิลไม่สำเร็จ");
//         }
//       } catch (err) {
//         console.error(err);
//         setError("เกิดข้อผิดพลาดในการดึงรายการบิล");
//       } finally {
//         setLoadingBills(false);
//       }
//     };

//     fetchBillsAndLabels();
//   }, [user?.user_id]);

//   const handleCreateLabels = () => {
//     if (!selectedIds.length) {
//       setError("กรุณาเลือกรายการอย่างน้อย 1 รายการ");
//       return;
//     }

//     setError(null);

//     // สำคัญ: filter จาก bills ไม่ใช่ labels
//     const filtered = bills.filter((r) => selectedIds.includes(r.id));
//     setLabels(filtered);
//     setStep("labels");
//   };

//   const handleBackToBills = () => {
//     setStep("bills");
//     setError(null); // ไม่ให้ error ตามกลับมา
//     setLabels(bills); // คืน labels ให้เป็นทั้งหมด
//     // ถ้าอยากให้ user เลือกใหม่ทุกครั้ง:
//     // setSelectedIds([]);
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   const headers = [
//     <div className="px-2 flex items-center justify-center" key="select-all">
//       <input
//         type="checkbox"
//         checked={bills.length > 0 && selectedIds.length === bills.length}
//         onChange={toggleSelectAll}
//       />
//     </div>,
//     "ลำดับ",
//     "SERIAL_NO",
//     "REFERENCE",
//     "CUSTOMER_NAME",
//     "RECIPIENT_ADDRESS",
//     "warehouse_name",
//   ];

//   const fetchReprint = async () => {
//     if (!user?.user_id) return;

//     setReprintLoading(true);

//     try {
//       const res = await axios.get("https://xsendwork.com/api/print-labels", {
//         params: {
//           user_id: user.user_id,
//           serial: filters.serial || undefined,
//           reference: filters.reference || undefined,
//           date: filters.date || undefined,
//           customer_name: filters.customer_name || undefined,
//           warehouse_name: filters.warehouse_name || undefined,
//         },
//       });

//       if (res.data?.success) {
//         setReprintRows(res.data.data || []);
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setReprintLoading(false);
//     }
//   };

//   const customerOptions = Array.from(
//     new Set(reprintAllRows.map((r) => r.CUSTOMER_NAME).filter(Boolean))
//   );

//   const warehouseOptions = Array.from(
//     new Set(reprintAllRows.map((r) => r.warehouse_name).filter(Boolean))
//   );

//   useEffect(() => {
//     if (!showReprint) return;

//     const timer = setTimeout(() => {
//       fetchReprint();
//     }, 300); // แนะนำ 250-300

//     return () => clearTimeout(timer);
//   }, [
//     showReprint,
//     filters.serial,
//     filters.reference,
//     filters.date,
//     filters.customer_name,
//     filters.warehouse_name,
//   ]);

//   useEffect(() => {
//     if (!showReprint) return;

//     (async () => {
//       try {
//         const res = await axios.get("https://xsendwork.com/api/print-labels", {
//           params: { user_id: user?.user_id },
//         });
//         if (res.data?.success) {
//           setReprintAllRows(res.data.data || []);
//           setReprintRows(res.data.data || []); // แสดงครั้งแรกด้วย
//         }
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, [showReprint, user?.user_id]);

//   return (
//     <div className="font-thai w-full min-h-screen bg-white px-4 py-5 print:bg-white print:p-0 print:m-0">
//       {/* Header + Action (ซ่อนตอน print) */}
//       <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
//         <div className="flex flex-col gap-1">
//           <h2 className="text-2xl font-bold tracking-tight text-slate-800">
//             {step === "bills"
//               ? "รายการบิลสำหรับสร้าง Label"
//               : "พิมพ์สติ๊กเกอร์ (Labels)"}
//           </h2>
//           {/* <p className=" text-slate-500">
//             เลือกรายการบิลที่ต้องการ แล้วสร้าง / พิมพ์สติ๊กเกอร์จัดส่ง
//           </p> */}
//         </div>

//         <div className="flex flex-wrap items-center gap-3 text-sm">
//           <div className="flex flex-col items-end text-slate-600">
//             <span className="text-[11px] uppercase tracking-wide text-slate-500">
//               ผู้ใช้งาน
//             </span>
//             <span className="font-medium">
//               {user?.first_name || user?.username || "-"}
//             </span>
//           </div>

//           {step === "bills" ? (
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleCreateLabels}
//                 disabled={!bills.length}
//                 className={`px-4 py-1.5 rounded-full font-medium transition
//       ${
//         !bills.length
//           ? "bg-slate-200 text-slate-500 cursor-not-allowed"
//           : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
//       }`}
//               >
//                 สร้าง Label
//               </button>

//               <button
//                 onClick={() => {
//                   setShowReprint(true);
//                   setReprintSelectedIds([]);
//                 }}
//                 className="px-4 py-1.5 rounded-full font-medium transition border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
//               >
//                 พิมพ์ซ้ำ
//               </button>
//             </div>
//           ) : (
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={handleBackToBills}
//                 className="px-3 py-1.5 rounded-full  font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition"
//               >
//                 ย้อนกลับ
//               </button>
//               <button
//                 onClick={handlePrint}
//                 disabled={!labels.length}
//                 className={`px-4 py-1.5 rounded-full  font-medium transition
//                   ${
//                     !labels.length
//                       ? "bg-slate-200 text-slate-500 cursor-not-allowed"
//                       : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
//                   }`}
//               >
//                 พิมพ์
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Error (ซ่อนตอน print ไม่จำเป็น เพราะอยู่ header block อยู่แล้ว) */}
//       {error && step === "bills" && (
//         <div className="mb-3  text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg print:hidden">
//           {error}
//         </div>
//       )}

//       {/* STEP 1: ตารางเลือกบิล */}
//       {step === "bills" && (
//         <>
//           {loadingBills && (
//             <div className="text-center text-sm text-slate-500">
//               กำลังโหลดรายการบิล...
//             </div>
//           )}

//           {!loadingBills && !bills.length && !error && (
//             <div className="text-center text-sm text-slate-500">
//               ยังไม่มีบิลสำหรับสร้าง Label
//             </div>
//           )}

//           {bills.length > 0 && (
//             <div className="border border-slate-200 rounded-xl bg-white shadow-sm print:shadow-none">
//               <div className="max-h-[80vh] overflow-auto rounded-xl">
//                 <table className="border-collapse min-w-max text-[13px]">
//                   {/* หัวตาราง: ResizableColumns */}
//                   <ResizableColumns
//                     headers={headers}
//                     pageKey="labels-page"
//                     minWidths={{
//                       0: 10,
//                       1: 60,
//                     }}
//                   />
//                   <tbody>
//                     {bills.map((b, idx) => (
//                       <tr
//                         key={b.id}
//                         className={`transition ${
//                           idx % 2 === 0 ? "bg-white" : "bg-slate-50"
//                         } hover:bg-blue-100/70`}
//                       >
//                         {/* Checkbox */}
//                         <td className="px-2 py-1.5 border-b border-slate-200 text-center align-middle">
//                           <input
//                             type="checkbox"
//                             checked={selectedIds.includes(b.id)}
//                             onChange={() => toggleSelect(b.id)}
//                           />
//                         </td>

//                         {/* ลำดับ */}
//                         <td className="w-[60px] px-3 py-1.5 border-b border-slate-200  bg-gray-100 font-semibold text-center sticky left-0 z-10">
//                           {idx + 1}
//                         </td>

//                         {/* SERIAL_NO */}
//                         <td className="px-3 py-1.5 border-b border-slate-200  truncate font-mono">
//                           {b.SERIAL_NO || "-"}
//                         </td>

//                         {/* REFERENCE */}
//                         <td className="px-3 py-1.5 border-b border-slate-200  truncate">
//                           {b.REFERENCE || "-"}
//                         </td>

//                         {/* CUSTOMER_NAME */}
//                         <td className="px-3 py-1.5 border-b border-slate-200  truncate">
//                           {b.CUSTOMER_NAME || "-"}
//                         </td>

//                         {/* RECIPIENT_ADDRESS (รวมชื่อ + ที่อยู่) */}
//                         <td className="px-3 py-1.5 border-b border-slate-200 truncate max-w-[320px]">
//                           {b.RECIPIENT_ADDRESS
//                             ? `${b.RECIPIENT_NAME || ""} ${
//                                 b.RECIPIENT_ADDRESS
//                               } ต.${b.RECIPIENT_SUBDISTRICT} อ.${
//                                 b.RECIPIENT_DISTRICT
//                               } จ.${b.RECIPIENT_PROVINCE} ${
//                                 b.RECIPIENT_ZIPCODE
//                               }`
//                             : "-"}
//                         </td>

//                         {/* warehouse_name */}
//                         <td className="px-3 py-1.5 border-b border-slate-200  truncate">
//                           {b.warehouse_name || "-"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* STEP 2: Preview Labels + Print */}
//       {step === "labels" && (
//         <div
//           id="label-print-area"
//           className="flex flex-wrap gap-4 print:gap-0 print:m-0"
//         >
//           {labels.map((row) => (
//             <div
//               key={row.id}
//               className="label-item
//                 bg-white border border-slate-300 rounded-lg shadow-sm
//                 p-2 box-border
//                 print:p-0 print:border-none print:shadow-none print:rounded-none
//               "
//               style={{
//                 width: "9.8cm",
//                 height: "7.2cm",
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "space-between",
//               }}
//             >
//               {/* BARCODE + Serial text */}
//               <div className="flex flex-col gap-1 items-center text-center">
//                 {row.barcode_url && (
//                   <div className="flex flex-col items-center">
//                     <img
//                       className=""
//                       src={row.barcode_url}
//                       alt={`BARCODE_${row.SERIAL_NO}`}
//                       style={{ maxWidth: "80%", maxHeight: "1.5cm" }}
//                     />
//                     <div className="text-[15px] tracking-widest font-bold">
//                       {row.SERIAL_NO}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Address */}
//               <div className="text-[10.5px] font-bold leading-snug mt-1">
//                 <div className="font-extrabold">
//                   ผู้รับ: {row.RECIPIENT_NAME || "-"}
//                 </div>
//                 <div>
//                   ที่อยู่: {row.RECIPIENT_ADDRESS || "-"}
//                   ต.{row.RECIPIENT_SUBDISTRICT || "-"} อ.
//                   {row.RECIPIENT_DISTRICT || "-"} จ.
//                   {row.RECIPIENT_PROVINCE || "-"} {row.RECIPIENT_ZIPCODE || ""}
//                 </div>
//                 <div className="text-[13px]">
//                   ปลายทาง: {row.warehouse_name || "-"}
//                 </div>

//               </div>

//               {/* QR + extra info */}
//               <div className="flex justify-between items-center">
//                 <div className="text-[11px] font-bold">
//                   <div>Ref: {row.REFERENCE || "-"}</div>
//                   <div>
//                     วันที่: {new Date().toLocaleDateString("th-TH")}{" "}
//                     &nbsp;&nbsp; เวลา:{" "}
//                     {new Date().toLocaleTimeString("th-TH", {
//                       hour: "2-digit",
//                       minute: "2-digit",
//                     })}{" "}
//                     น.
//                   </div>
//                   <div className="mt-1">
//                     จัดส่งโดย: บริษัท ทรานเทค แมนเนจเม้นท์ กรุ๊ปส์ จำกัด
//                   </div>
//                   <div>โทร. 065-005-2555</div>
//                   <div>S: {row.RECIPIENT_CODE || "-"}</div>
//                 </div>

//                 {row.qr_url && (
//                   <img
//                     src={row.qr_url}
//                     alt={`QR_${row.SERIAL_NO}`}
//                     style={{ width: "2.7cm", height: "2.7cm" }}
//                   />
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {showReprint && (
//         <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 print:hidden">
//           <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg border border-slate-200">
//             {/* Header */}
//             <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
//               <div className="font-bold text-slate-800">
//                 พิมพ์ซ้ำ (ค้นหา/กรอง)
//               </div>
//               <button
//                 onClick={() => setShowReprint(false)}
//                 className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
//               >
//                 ปิด
//               </button>
//             </div>

//             {/* Filters */}
//             <div
//               className="px-4 py-3 grid gap-2 text-sm whitespace-nowrap items-center"
//               style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
//             >
//               <input
//                 className="h-8 border border-slate-300 rounded-lg px-3 py-2 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
//                 placeholder="ค้นหา SERIAL_NO"
//                 value={filters.serial}
//                 onChange={(e) =>
//                   setFilters((p) => ({ ...p, serial: e.target.value }))
//                 }
//               />
//               <input
//                 className="h-8 border border-slate-300 rounded-lg px-3 py-2 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
//                 placeholder="ค้นหา REFERENCE"
//                 value={filters.reference}
//                 onChange={(e) =>
//                   setFilters((p) => ({ ...p, reference: e.target.value }))
//                 }
//               />

//               <div className="min-w-0 w-full">
//                 <DatePicker
//                   selected={filters.date ? new Date(filters.date) : null}
//                   onChange={(date: Date | null) => {
//                     const v = date ? format(date, "yyyy-MM-dd") : "";
//                     setFilters((p) => ({ ...p, date: v }));
//                   }}
//                   dateFormat="dd/MM/yyyy"
//                   placeholderText="เลือกวันที่"
//                   className="border border-slate-300 rounded-lg px-3 py-2 h-8 w-full min-w-0 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
//                   wrapperClassName="w-full min-w-0"
//                 />
//               </div>

//               <FilterDropdown
//                 value={filters.customer_name}
//                 onChange={(v: string) =>
//                   setFilters((p) => ({ ...p, customer_name: v }))
//                 }
//                 options={customerOptions}
//                 placeholder="ค้นหาลูกค้า"
//               />

//               <FilterDropdown
//                 value={filters.warehouse_name}
//                 onChange={(v: string) =>
//                   setFilters((p) => ({ ...p, warehouse_name: v }))
//                 }
//                 options={warehouseOptions}
//                 placeholder="ค้นหา DC"
//               />
//             </div>

//             {/* Actions */}
//             <div className="px-4 pb-3 flex items-center gap-2">
//               {/* <button
//                 onClick={fetchReprint}
//                 className="px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
//               >
//                 ค้นหา
//               </button> */}
//               <button
//                 onClick={() => {
//                   // เอาที่เลือกไปพิมพ์ด้วย UI เดิมของคุณ
//                   const picked = reprintRows.filter((r) =>
//                     reprintSelectedIds.includes(r.id)
//                   );
//                   setLabels(picked);
//                   setStep("labels");
//                   setShowReprint(false);
//                 }}
//                 disabled={!reprintSelectedIds.length}
//                 className={`px-4 py-1.5 rounded-full font-medium transition
//             ${
//               !reprintSelectedIds.length
//                 ? "bg-slate-200 text-slate-500 cursor-not-allowed"
//                 : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
//             }`}
//               >
//                 ไปหน้าพิมพ์
//               </button>
//             </div>

//             {/* Results table (ย่อ ๆ) */}
//             <div className="px-4 pb-4">
//               <div className="relative max-h-[55vh] overflow-auto border border-slate-200 rounded-xl">
//                 {reprintLoading && (
//                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
//                     <div className="text-sm text-slate-500">กำลังค้นหา...</div>
//                   </div>
//                 )}

//                 <table className="border-collapse min-w-max text-[13px] w-full">
//                   <thead className="sticky top-0 bg-white z-10">
//                     <tr>
//                       <th className="p-2 border-b border-slate-200 text-center">
//                         เลือก
//                       </th>
//                       <th className="p-2 border-b border-slate-200">
//                         SERIAL_NO
//                       </th>
//                       <th className="p-2 border-b border-slate-200">
//                         REFERENCE
//                       </th>
//                       <th className="p-2 border-b border-slate-200">
//                         CUSTOMER_NAME
//                       </th>
//                       <th className="p-2 border-b border-slate-200">
//                         warehouse_name
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {reprintRows.map((r, i) => (
//                       <tr
//                         key={r.id}
//                         className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
//                       >
//                         <td className="p-2 border-b border-slate-200 text-center">
//                           <input
//                             type="checkbox"
//                             checked={reprintSelectedIds.includes(r.id)}
//                             onChange={() =>
//                               setReprintSelectedIds((prev) =>
//                                 prev.includes(r.id)
//                                   ? prev.filter((x) => x !== r.id)
//                                   : [...prev, r.id]
//                               )
//                             }
//                           />
//                         </td>
//                         <td className="p-2 border-b border-slate-200 font-mono">
//                           {r.SERIAL_NO || "-"}
//                         </td>
//                         <td className="p-2 border-b border-slate-200">
//                           {r.REFERENCE || "-"}
//                         </td>
//                         <td className="p-2 border-b border-slate-200">
//                           {r.CUSTOMER_NAME || "-"}
//                         </td>
//                         <td className="p-2 border-b border-slate-200">
//                           {r.warehouse_name || "-"}
//                         </td>
//                       </tr>
//                     ))}

//                     {!reprintRows.length && !reprintLoading && (
//                       <tr>
//                         <td
//                           colSpan={5}
//                           className="p-4 text-center text-slate-500"
//                         >
//                           ไม่พบข้อมูล
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ResizableColumns from "../components/ResizableColumns";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import { FilterDropdown } from "../components/dropdown/FilterDropdown";

type BillRow = {
  id: number;
  SERIAL_NO: string;
  REFERENCE: string;
  CUSTOMER_NAME: string;
  RECIPIENT_NAME: string;
  RECIPIENT_ADDRESS: string;
  RECIPIENT_SUBDISTRICT: string;
  RECIPIENT_DISTRICT: string;
  RECIPIENT_PROVINCE: string;
  RECIPIENT_ZIPCODE: string;
  RECIPIENT_CODE: string;
  warehouse_name: string;
};

type LabelRow = BillRow & {
  barcode_url?: string;
  qr_url?: string;
};

export default function LabelPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<BillRow[]>([]);
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"bills" | "labels">("bills");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [showReprint, setShowReprint] = useState(false);
  const [reprintLoading, setReprintLoading] = useState(false);
  const [reprintRows, setReprintRows] = useState<LabelRow[]>([]);
  const [reprintSelectedIds, setReprintSelectedIds] = useState<number[]>([]);
  const [reprintAllRows, setReprintAllRows] = useState<LabelRow[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<{
    serial: string;
    reference: string;
    date: string; // ✅ string
    customer_name: string;
    warehouse_name: string;
  }>({
    serial: "",
    reference: "",
    date: "",
    customer_name: "",
    warehouse_name: "",
  });

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      if (next.length > 0) {
        setError(null); // มีการเลือกรายการแล้ว ล้าง error
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === bills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bills.map((b) => b.id));
      if (bills.length > 0) {
        setError(null);
      }
    }
  };

  useEffect(() => {
    const fetchBillsAndLabels = async () => {
      if (!user?.user_id) return;
      setLoadingBills(true);
      setError(null);

      try {
        const res = await axios.get("https://xsendwork.com/api/print-labels", {
          params: {
            user_id: user.user_id,
          },
        });

        if (res.data?.success) {
          const rows = res.data.data || [];
          setBills(rows);
          setLabels(rows);
        } else {
          setError(res.data?.message || "ดึงรายการบิลไม่สำเร็จ");
        }
      } catch (err) {
        console.error(err);
        setError("เกิดข้อผิดพลาดในการดึงรายการบิล");
      } finally {
        setLoadingBills(false);
      }
    };

    fetchBillsAndLabels();
  }, [user?.user_id]);

  const handleCreateLabels = () => {
    if (!selectedIds.length) {
      setError("กรุณาเลือกรายการอย่างน้อย 1 รายการ");
      return;
    }

    setError(null);

    // สำคัญ: filter จาก bills ไม่ใช่ labels
    const filtered = bills.filter((r) => selectedIds.includes(r.id));
    setLabels(filtered);
    setStep("labels");
  };

  const handleBackToBills = () => {
    setStep("bills");
    setError(null); // ไม่ให้ error ตามกลับมา
    setLabels(bills); // คืน labels ให้เป็นทั้งหมด
    // ถ้าอยากให้ user เลือกใหม่ทุกครั้ง:
    // setSelectedIds([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const headers = [
    <div className="px-2 flex items-center justify-center" key="select-all">
      <input
        type="checkbox"
        checked={bills.length > 0 && selectedIds.length === bills.length}
        onChange={toggleSelectAll}
      />
    </div>,
    "ลำดับ",
    "SERIAL_NO",
    "REFERENCE",
    "CUSTOMER_NAME",
    "RECIPIENT_ADDRESS",
    "warehouse_name",
  ];

  const fetchReprint = async () => {
    if (!user?.user_id) return;
    setHasSearched(true);
    setReprintLoading(true);

    try {
      const res = await axios.get("https://xsendwork.com/api/reprint-labels", {
        params: {
          user_id: user.user_id,
          serial: filters.serial || undefined,
          reference: filters.reference || undefined,
          date: filters.date || undefined,
          customer_name: filters.customer_name || undefined,
          warehouse_name: filters.warehouse_name || undefined,
        },
      });

      if (res.data?.success) {
        setReprintRows(res.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReprintLoading(false);
    }
  };

  const customerOptions = Array.from(
    new Set(reprintAllRows.map((r) => r.CUSTOMER_NAME).filter(Boolean))
  );

  const warehouseOptions = Array.from(
    new Set(reprintAllRows.map((r) => r.warehouse_name).filter(Boolean))
  );

  // useEffect(() => {
  //   if (!showReprint) return;

  //   const timer = setTimeout(() => {
  //     fetchReprint();
  //   }, 300); // แนะนำ 250-300

  //   return () => clearTimeout(timer);
  // }, [
  //   showReprint,
  //   filters.serial,
  //   filters.reference,
  //   filters.date,
  //   filters.customer_name,
  //   filters.warehouse_name,
  // ]);

  useEffect(() => {
    if (!showReprint) return;

    (async () => {
      try {
        const res = await axios.get(
          "https://xsendwork.com/api/reprint-labels",
          {
            params: { user_id: user?.user_id },
          }
        );
        if (res.data?.success) {
          setReprintAllRows(res.data.data || []);
          setReprintRows(res.data.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [showReprint, user?.user_id]);

  return (
    <div className="font-thai w-full min-h-screen bg-white px-4 py-5 print:bg-white print:p-0 print:m-0">
      {/* Header + Action (ซ่อนตอน print) */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            {step === "bills"
              ? "รายการบิลสำหรับสร้าง Label"
              : "พิมพ์สติ๊กเกอร์ (Labels)"}
          </h2>
          {/* <p className=" text-slate-500">
            เลือกรายการบิลที่ต้องการ แล้วสร้าง / พิมพ์สติ๊กเกอร์จัดส่ง
          </p> */}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex flex-col items-end text-slate-600">
            <span className="text-[11px] uppercase tracking-wide text-slate-500">
              ผู้ใช้งาน
            </span>
            <span className="font-medium">
              {user?.first_name || user?.username || "-"}
            </span>
          </div>

          {step === "bills" ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCreateLabels}
                disabled={!bills.length}
                className={`px-4 py-1.5 rounded-full font-medium transition
      ${
        !bills.length
          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
      }`}
              >
                สร้าง Label
              </button>

              {/* <button
                onClick={() => {
                  setShowReprint(true);
                  setReprintSelectedIds([]);
                }}
                className="px-4 py-1.5 rounded-full font-medium transition border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                พิมพ์ซ้ำ
              </button> */}
              <button
                onClick={() => {
                  setShowReprint(true);
                  setReprintSelectedIds([]);
                  setHasSearched(false);
                  setReprintRows([]);
                  setFilters({
                    serial: "",
                    reference: "",
                    date: "",
                    customer_name: "",
                    warehouse_name: "",
                  });
                }}
                className="px-4 py-1.5 rounded-full font-medium transition border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                พิมพ์ซ้ำ
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleBackToBills}
                className="px-3 py-1.5 rounded-full  font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 transition"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handlePrint}
                disabled={!labels.length}
                className={`px-4 py-1.5 rounded-full  font-medium transition
                  ${
                    !labels.length
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  }`}
              >
                พิมพ์
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error (ซ่อนตอน print ไม่จำเป็น เพราะอยู่ header block อยู่แล้ว) */}
      {error && step === "bills" && (
        <div className="mb-3  text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg print:hidden">
          {error}
        </div>
      )}

      {/* STEP 1: ตารางเลือกบิล */}
      {step === "bills" && (
        <>
          {loadingBills && (
            <div className="text-center text-sm text-slate-500">
              กำลังโหลดรายการบิล...
            </div>
          )}

          {!loadingBills && !bills.length && !error && (
            <div className="text-center text-sm text-slate-500">
              ยังไม่มีบิลสำหรับสร้าง Label
            </div>
          )}

          {bills.length > 0 && (
            <div className="border border-slate-200 rounded-xl bg-white shadow-sm print:shadow-none">
              <div className="max-h-[80vh] overflow-auto rounded-xl">
                <table className="border-collapse min-w-max text-[13px]">
                  {/* หัวตาราง: ResizableColumns */}
                  <ResizableColumns
                    headers={headers}
                    pageKey="labels-page"
                    minWidths={{
                      0: 10,
                      1: 60,
                    }}
                  />
                  <tbody>
                    {bills.map((b, idx) => (
                      <tr
                        key={b.id}
                        className={`transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } hover:bg-blue-100/70`}
                      >
                        {/* Checkbox */}
                        <td className="px-2 py-1.5 border-b border-slate-200 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(b.id)}
                            onChange={() => toggleSelect(b.id)}
                          />
                        </td>

                        {/* ลำดับ */}
                        <td className="w-[60px] px-3 py-1.5 border-b border-slate-200  bg-gray-100 font-semibold text-center sticky left-0 z-10">
                          {idx + 1}
                        </td>

                        {/* SERIAL_NO */}
                        <td className="px-3 py-1.5 border-b border-slate-200  truncate font-mono">
                          {b.SERIAL_NO || "-"}
                        </td>

                        {/* REFERENCE */}
                        <td className="px-3 py-1.5 border-b border-slate-200  truncate">
                          {b.REFERENCE || "-"}
                        </td>

                        {/* CUSTOMER_NAME */}
                        <td className="px-3 py-1.5 border-b border-slate-200  truncate">
                          {b.CUSTOMER_NAME || "-"}
                        </td>

                        {/* RECIPIENT_ADDRESS (รวมชื่อ + ที่อยู่) */}
                        <td className="px-3 py-1.5 border-b border-slate-200 truncate max-w-[320px]">
                          {b.RECIPIENT_ADDRESS
                            ? `${b.RECIPIENT_NAME || ""} ${
                                b.RECIPIENT_ADDRESS
                              } ต.${b.RECIPIENT_SUBDISTRICT} อ.${
                                b.RECIPIENT_DISTRICT
                              } จ.${b.RECIPIENT_PROVINCE} ${
                                b.RECIPIENT_ZIPCODE
                              }`
                            : "-"}
                        </td>

                        {/* warehouse_name */}
                        <td className="px-3 py-1.5 border-b border-slate-200  truncate">
                          {b.warehouse_name || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* STEP 2: Preview Labels + Print */}
      {step === "labels" && (
        <div
          id="label-print-area"
          className="flex flex-wrap gap-4 print:gap-0 print:m-0"
        >
          {labels.map((row) => (
            <div
              key={row.id}
              className="label-item
                bg-white border border-slate-300 rounded-lg shadow-sm
                p-2 box-border
                print:p-0 print:border-none print:shadow-none print:rounded-none
              "
              style={{
                width: "9.8cm",
                height: "7.2cm",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* BARCODE + Serial text */}
              <div className="flex flex-col gap-1 items-center text-center">
                {row.barcode_url && (
                  <div className="flex flex-col items-center">
                    <img
                      className=""
                      src={row.barcode_url}
                      alt={`BARCODE_${row.SERIAL_NO}`}
                      style={{ maxWidth: "80%", maxHeight: "1.5cm" }}
                    />
                    <div className="text-[15px] tracking-widest font-bold">
                      {row.SERIAL_NO}
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="text-[10.5px] font-bold leading-snug mt-1">
                <div className="font-extrabold">
                  ผู้รับ: {row.RECIPIENT_NAME || "-"}
                </div>
                <div>
                  ที่อยู่: {row.RECIPIENT_ADDRESS || "-"}
                  ต.{row.RECIPIENT_SUBDISTRICT || "-"} อ.
                  {row.RECIPIENT_DISTRICT || "-"} จ.
                  {row.RECIPIENT_PROVINCE || "-"} {row.RECIPIENT_ZIPCODE || ""}
                </div>
                <div className="text-[13px]">
                  ปลายทาง: {row.warehouse_name || "-"}
                </div>
              </div>

              {/* QR + extra info */}
              <div className="flex justify-between items-center">
                <div className="text-[11px] font-bold">
                  <div>Ref: {row.REFERENCE || "-"}</div>
                  <div>
                    วันที่: {new Date().toLocaleDateString("th-TH")}{" "}
                    &nbsp;&nbsp; เวลา:{" "}
                    {new Date().toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    น.
                  </div>
                  <div className="mt-1">
                    จัดส่งโดย: {row.CUSTOMER_NAME || "-"}
                  </div>
                  <div>โทร. 065-005-2555</div>
                  <div>S: {row.RECIPIENT_CODE || "-"}</div>
                </div>

                {row.qr_url && (
                  <img
                    src={row.qr_url}
                    alt={`QR_${row.SERIAL_NO}`}
                    style={{ width: "2.7cm", height: "2.7cm" }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showReprint && (
        <div className="fixed inset-0 z-99999 bg-black/40 flex items-center justify-center p-4 print:hidden">
          <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <div className="font-bold text-slate-800">
                พิมพ์ซ้ำ (ค้นหา/กรอง)
              </div>
              <button
                onClick={() => setShowReprint(false)}
                className="px-3 py-1.5 rounded-full border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              >
                ปิด
              </button>
            </div>

            {/* Filters */}
            <div
              className="px-4 py-3 grid gap-2 text-sm whitespace-nowrap items-center"
              style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
            >
              <input
                className="h-8 border border-slate-300 rounded-lg px-3 py-2 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                placeholder="ค้นหา SERIAL_NO"
                value={filters.serial}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, serial: e.target.value }))
                }
              />
              <input
                className="h-8 border border-slate-300 rounded-lg px-3 py-2 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                placeholder="ค้นหา REFERENCE"
                value={filters.reference}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, reference: e.target.value }))
                }
              />

              <div className="min-w-0 w-full">
                <DatePicker
                  selected={filters.date ? new Date(filters.date) : null}
                  onChange={(date: Date | null) => {
                    const v = date ? format(date, "yyyy-MM-dd") : "";
                    setFilters((p) => ({ ...p, date: v }));
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="เลือกวันที่"
                  className="border border-slate-300 rounded-lg px-3 py-2 h-8 w-full min-w-0 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  wrapperClassName="w-full min-w-0"
                />
              </div>

              <FilterDropdown
                value={filters.customer_name}
                onChange={(v: string) =>
                  setFilters((p) => ({ ...p, customer_name: v }))
                }
                options={customerOptions}
                placeholder="ค้นหาลูกค้า"
              />

              <FilterDropdown
                value={filters.warehouse_name}
                onChange={(v: string) =>
                  setFilters((p) => ({ ...p, warehouse_name: v }))
                }
                options={warehouseOptions}
                placeholder="ค้นหา DC"
              />
            </div>

            {/* Actions */}
            <div className="px-4 pb-3 flex items-center gap-2">
              <button
                onClick={fetchReprint}
                className="px-4 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
              >
                ค้นหา
              </button>
              <button
                onClick={() => {
                  // เอาที่เลือกไปพิมพ์ด้วย UI เดิมของคุณ
                  const picked = reprintRows.filter((r) =>
                    reprintSelectedIds.includes(r.id)
                  );
                  setLabels(picked);
                  setStep("labels");
                  setShowReprint(false);
                }}
                disabled={!reprintSelectedIds.length}
                className={`px-4 py-1.5 rounded-full font-medium transition
            ${
              !reprintSelectedIds.length
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            }`}
              >
                ไปหน้าพิมพ์
              </button>
            </div>

            {/* Results table (ย่อ ๆ) */}
            {hasSearched && (
              <div className="px-4 pb-4">
                <div className="relative max-h-[55vh] overflow-auto border border-slate-200 rounded-xl">
                  {reprintLoading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <div className="text-sm text-slate-500">
                        กำลังค้นหา...
                      </div>
                    </div>
                  )}

                  <table className="border-collapse min-w-max text-[13px] w-full">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr>
                        <th className="p-2 border-b border-slate-200 text-center">
                          เลือก
                        </th>
                        <th className="p-2 border-b border-slate-200">
                          SERIAL_NO
                        </th>
                        <th className="p-2 border-b border-slate-200">
                          REFERENCE
                        </th>
                        <th className="p-2 border-b border-slate-200">
                          CUSTOMER_NAME
                        </th>
                        <th className="p-2 border-b border-slate-200">
                          warehouse_name
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reprintRows.map((r, i) => (
                        <tr
                          key={r.id}
                          className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                        >
                          <td className="p-2 border-b border-slate-200 text-center">
                            <input
                              type="checkbox"
                              checked={reprintSelectedIds.includes(r.id)}
                              onChange={() =>
                                setReprintSelectedIds((prev) =>
                                  prev.includes(r.id)
                                    ? prev.filter((x) => x !== r.id)
                                    : [...prev, r.id]
                                )
                              }
                            />
                          </td>
                          <td className="p-2 border-b border-slate-200 font-mono">
                            {r.SERIAL_NO || "-"}
                          </td>
                          <td className="p-2 border-b border-slate-200">
                            {r.REFERENCE || "-"}
                          </td>
                          <td className="p-2 border-b border-slate-200">
                            {r.CUSTOMER_NAME || "-"}
                          </td>
                          <td className="p-2 border-b border-slate-200">
                            {r.warehouse_name || "-"}
                          </td>
                        </tr>
                      ))}

                      {!reprintRows.length && !reprintLoading && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-4 text-center text-slate-500"
                          >
                            ไม่พบข้อมูล
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
