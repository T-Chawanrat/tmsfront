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

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ResizableColumns from "../components/ResizableColumns";

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
  warehouse_name: string;
};

type LabelRow = BillRow & {
  barcode_url: string;
  qr_url: string;
};

export default function LabelPage() {
  const { user } = useAuth();

  const [bills, setBills] = useState<BillRow[]>([]);
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"bills" | "labels">("bills");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === bills.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(bills.map((b) => b.id));
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

    const filtered = labels.filter((r) => selectedIds.includes(r.id));
    setLabels(filtered);
    setStep("labels");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToBills = () => {
    setStep("bills");
  };

  const headers = [
    <div className="flex justify-center w-[10px]" key="select-all">
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

  return (
    <div className="font-thai w-full min-h-screen bg-white px-4 py-5 print:bg-white">
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
            <button
              onClick={handleCreateLabels}
              disabled={!bills.length}
              className={`px-4 py-1.5 rounded-full  font-medium transition
                ${
                  !bills.length
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
            >
              สร้าง Label
            </button>
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
                      0: 60,
                      1: 60,
                    }}
                  />

                  <tbody>
                    {bills.map((b, idx) => (
                      <tr
                        key={b.id}
                        className={`transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                        } hover:bg-blue-50/50`}
                      >
                        {/* Checkbox */}
                        <td className="w-[10px] px-2 py-1.5 border-b border-slate-200 text-center align-middle">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(b.id)}
                            onChange={() => toggleSelect(b.id)}
                          />
                        </td>

                        {/* ลำดับ */}
                        <td className="w-[60px] px-3 py-1.5 border-b border-slate-200  bg-slate-100 font-semibold text-center sticky left-0 z-10">
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
          className="
            flex flex-wrap gap-4
            print:gap-0 print:m-0
          "
        >
          {labels.map((row) => (
            <div
              key={row.id}
              className="
                bg-white border border-slate-300 rounded-lg shadow-sm
                p-2 box-border
                print:shadow-none print:border print:border-black
              "
              style={{
                width: "10cm",
                height: "7.5cm",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              {/* BARCODE + Serial text */}
              <div className="flex flex-col gap-1">
                {row.barcode_url && (
                  <div className="flex flex-col">
                    <img
                      src={row.barcode_url}
                      alt={`BARCODE_${row.SERIAL_NO}`}
                      style={{ maxWidth: "100%", maxHeight: "1.5cm" }}
                    />
                    <div className="text-lg tracking-widest font-bold text-center">
                      {row.SERIAL_NO}
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="text-[10px] leading-snug mt-1">
                <div className="font-semibold">
                  ผู้รับ: {row.RECIPIENT_NAME || "-"}
                </div>
                <div>
                  ที่อยู่: {row.RECIPIENT_ADDRESS || "-"}
                  ต.{row.RECIPIENT_SUBDISTRICT || "-"} อ.
                  {row.RECIPIENT_DISTRICT || "-"} จ.
                  {row.RECIPIENT_PROVINCE || "-"} {row.RECIPIENT_ZIPCODE || ""}
                </div>
                <div>ปลายทาง: {row.warehouse_name || "-"}</div>
              </div>

              {/* QR + extra info */}
              <div className="flex justify-between items-center mt-1">
                <div className="text-[10px]">
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
                    จัดส่งโดย: บริษัท ทรานเทค แมนเนจเม้นท์ กรุ๊ปส์ จำกัด
                  </div>
                  <div>โทร. 065-005-2555</div>
                </div>

                {row.qr_url && (
                  <img
                    src={row.qr_url}
                    alt={`QR_${row.SERIAL_NO}`}
                    style={{ width: "2.8cm", height: "2.8cm" }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
