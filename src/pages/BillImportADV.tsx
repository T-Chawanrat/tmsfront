// import { useState, ChangeEvent } from "react";
// import * as XLSX from "xlsx";
// import axios from "axios";
// import ResizableColumns from "../components/ResizableColumns";
// import { useAuth } from "../context/AuthContext";

// type ImportRow = {
//   dpe_bill_no: string;
//   cusname: string;
//   address: string;
//   province_name: string;
//   amphur_name: string;
//   district_name: string;
//   box_sn: string;
//   postcode: string;
//   cusmobile: string;
// };

// const headers = [
//   "ลําดับ",
//   "จัดการ",
//   "dpe_bill_no",
//   "box_sn",
//   "cusname",
//   "address",
//   "province_name",
//   "amphur_name",
//   "district_name",
//   "postcode",
//   "cusmobile",
// ];

// export default function BillImportADV() {
//   const [fileName, setFileName] = useState<string>("");
//   const [rows, setRows] = useState<ImportRow[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [duplicates, setDuplicates] = useState<Record<string, number>>({});
//   const { user } = useAuth();

//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     setError(null);
//     setSuccess(null);
//     setRows([]);

//     if (!file) return;
//     setFileName(file.name);
//     setLoading(true);

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       try {
//         const data = evt.target?.result;
//         if (!data) {
//           setError("ไม่สามารถอ่านไฟล์ได้");
//           setLoading(false);
//           return;
//         }

//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];

//         // แปลง Sheet → JSON ตาม header ใน Excel (ต้องให้ header แถวแรกตรงกับชื่อ key ด้านบน)
//         const json: ImportRow[] = XLSX.utils.sheet_to_json(worksheet, {
//           defval: "",
//         }) as ImportRow[];

//         setRows(json);
//         setDuplicates(findDuplicates(json));
//       } catch (err) {
//         console.error(err);
//         setError("ไฟล์ไม่ถูกต้องหรืออ่านไม่สำเร็จ");
//       } finally {
//         setLoading(false);
//       }
//     };

//     reader.onerror = () => {
//       setError("เกิดข้อผิดพลาดในการอ่านไฟล์");
//       setLoading(false);
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   const handleSave = async () => {
//     if (!rows.length) {
//       setError("ยังไม่มีข้อมูลให้นำเข้าฐานข้อมูล");
//       return;
//     }

//     setSaving(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const payloadRows = rows.map((r) => ({
//         NO_BILL: null,
//         REFERENCE: r.dpe_bill_no || null,
//         SEND_DATE: null,
//         CUSTOMER_NAME: "ADV",
//         RECIPIENT_CODE: null,
//         RECIPIENT_NAME: r.cusname || null,
//         RECIPIENT_TEL: r.cusmobile || null,
//         RECIPIENT_ADDRESS: r.address || null,
//         RECIPIENT_SUBDISTRICT: r.district_name || null,
//         RECIPIENT_DISTRICT: r.amphur_name || null,
//         RECIPIENT_PROVINCE: r.province_name || null,
//         RECIPIENT_ZIPCODE: r.postcode || null,
//         SERIAL_NO: r.box_sn || null,
//       }));

//       const res = await axios.post("https://xsendwork.com/api/import-adv", {
//         rows: payloadRows,
//         user_id: user?.user_id,
//         type: "IMPORT",
//       });

//       if (res.data?.success) {
//         setSuccess(res.data.message || "บันทึกข้อมูลสำเร็จ");
//         setRows([]);
//       } else {
//         setSuccess("บันทึกข้อมูลสำเร็จ");
//       }
//     } catch (err) {
//       console.error(err);
//       if (axios.isAxiosError(err)) {
//         setError(
//           err.response?.data?.message ||
//             "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล"
//         );
//       } else if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล");
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   const findDuplicates = (rows: ImportRow[]) => {
//     const count: Record<string, number> = {};

//     rows.forEach((r) => {
//       if (!r.box_sn) return;
//       count[r.box_sn] = (count[r.box_sn] || 0) + 1;
//     });

//     return count;
//   };

//   const handleDeleteRow = (index: number) => {
//     setRows((prev) => {
//       const next = prev.filter((_, i) => i !== index);
//       setDuplicates(findDuplicates(next));
//       return next;
//     });
//     setError(null);
//     setSuccess(null);
//   };

//   return (
//     <div
//       className={`font-thai w-full p-4 ${
//         loading || saving ? "cursor-wait" : ""
//       }`}
//     >
//       <h2 className="text-xl font-bold mb-4">นำเข้า Excel (Bills ADV)</h2>

//       {/* ส่วนอัปโหลดไฟล์ */}
//       <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
//         <label className="inline-flex items-center">
//           <span className="mr-2 font-medium">เลือกไฟล์ Excel:</span>
//           <input
//             type="file"
//             accept=".xlsx,.xls"
//             onChange={handleFileChange}
//             className="block border border-gray-300 rounded px-2 py-1 "
//           />
//         </label>
//         {fileName && (
//           <span className="text-sm text-gray-600">ไฟล์: {fileName}</span>
//         )}

//         {/* ปุ่มบันทึก */}
//         <div className="mb-4 flex gap-2 justify-end flex-grow">
//           {rows.length > 0 && (
//             <span className="text-sm mt-2 text-gray-600">
//               พบข้อมูล {rows.length.toLocaleString()} แถว
//             </span>
//           )}

//           <button
//             onClick={handleSave}
//             disabled={!rows.length || saving}
//             className={`px-4 py-2 rounded text-white font-medium ${
//               !rows.length || saving
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึก"}
//           </button>
//         </div>
//       </div>

//       {/* แสดง error / success */}
//       {error && (
//         <div className="mb-4 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="mb-4 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
//           {success}
//         </div>
//       )}

//       {/* Preview Table */}
//       <div className="overflow-x-auto overflow-y-auto max-h-[80vh] w-full border border-gray-300 rounded">
//         {!rows.length && !loading && (
//           <div className="p-4 text-center text-gray-500">
//             ยังไม่มีข้อมูล แสดงตัวอย่าง กรุณาเลือกไฟล์ Excel
//           </div>
//         )}

//         {rows.length > 0 && (
//           <table className="w-sm table-fixed border-collapse">
//             <ResizableColumns
//               headers={headers}
//               pageKey="import-adv"
//               minWidths={{
//                 0: 60,
//                 1: 40,
//               }}
//             />
//             <thead className="bg-gray-100"></thead>
//             <tbody>
//               {rows.map((row, idx) => (
//                 <tr
//                   key={idx}
//                   className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                 >
//                   {/* ลำดับ */}
//                   <td className="px-3 py-1 border-b text-sm bg-gray-100 font-semibold text-center sticky left-0 z-10">
//                     {idx + 1}
//                   </td>

//                   <td className="px-3 py-1 border-b text-center text-sm whitespace-nowrap min-w-[120px]">
//                     <button
//                       type="button"
//                       onClick={() => handleDeleteRow(idx)}
//                       className="px-2 py-1 text-md bg-red-500 text-white rounded"
//                     >
//                       ลบ
//                     </button>
//                   </td>

//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.dpe_bill_no || "-"}
//                   </td>
//                   <td
//                     className={
//                       "px-3 py-1 border-b text-sm truncate " +
//                       (duplicates[row.box_sn] > 1
//                         ? "text-red-500 font-bold"
//                         : "")
//                     }
//                   >
//                     {row.box_sn || "-"}
//                   </td>
//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.cusname || "-"}
//                   </td>
//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.address || "-"}
//                   </td>
//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.province_name || "-"}
//                   </td>
//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.amphur_name || "-"}
//                   </td>
//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.district_name || "-"}
//                   </td>

//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.postcode || "-"}
//                   </td>
//                   <td className="px-3 py-1 border-b text-sm truncate">
//                     {row.cusmobile || "-"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {loading && (
//         <div className="flex justify-center mt-4">
//           <div className="loader"></div>
//         </div>
//       )}
//     </div>
//   );
// }








import { useState, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import ResizableColumns from "../components/ResizableColumns";
import { useAuth } from "../context/AuthContext";

type ImportRow = {
  dpe_bill_no: string;
  cusname: string;
  address: string;
  province_name: string;
  amphur_name: string;
  district_name: string;
  box_sn: string;
  postcode: string;
  cusmobile: string;
};

const headers = [
  "ลำดับ",
  "จัดการ",
  "dpe_bill_no",
  "box_sn",
  "cusname",
  "address",
  "province_name",
  "amphur_name",
  "district_name",
  "postcode",
  "cusmobile",
];

export default function BillImportADV() {
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Record<string, number>>({});
  const { user } = useAuth();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setSuccess(null);
    setRows([]);

    if (!file) return;
    setFileName(file.name);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) {
          setError("ไม่สามารถอ่านไฟล์ได้");
          setLoading(false);
          return;
        }

        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json: ImportRow[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: "",
        }) as ImportRow[];

        setRows(json);
        setDuplicates(findDuplicates(json));
      } catch (err) {
        console.error(err);
        setError("ไฟล์ไม่ถูกต้องหรืออ่านไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      setError("เกิดข้อผิดพลาดในการอ่านไฟล์");
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSave = async () => {
    if (!rows.length) {
      setError("ยังไม่มีข้อมูลให้นำเข้าฐานข้อมูล");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payloadRows = rows.map((r) => ({
        NO_BILL: null,
        REFERENCE: r.dpe_bill_no || null,
        SEND_DATE: null,
        CUSTOMER_NAME: "ADV",
        RECIPIENT_CODE: null,
        RECIPIENT_NAME: r.cusname || null,
        RECIPIENT_TEL: r.cusmobile || null,
        RECIPIENT_ADDRESS: r.address || null,
        RECIPIENT_SUBDISTRICT: r.district_name || null,
        RECIPIENT_DISTRICT: r.amphur_name || null,
        RECIPIENT_PROVINCE: r.province_name || null,
        RECIPIENT_ZIPCODE: r.postcode || null,
        SERIAL_NO: r.box_sn || null,
      }));

      const res = await axios.post("https://xsendwork.com/api/import-adv", {
        rows: payloadRows,
        user_id: user?.user_id,
        type: "IMPORT",
      });

      if (res.data?.success) {
        setSuccess(res.data.message || "บันทึกข้อมูลสำเร็จ");
        setRows([]);
      } else {
        setSuccess("บันทึกข้อมูลสำเร็จ");
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล"
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล");
      }
    } finally {
      setSaving(false);
    }
  };

  const findDuplicates = (rows: ImportRow[]) => {
    const count: Record<string, number> = {};

    rows.forEach((r) => {
      if (!r.box_sn) return;
      count[r.box_sn] = (count[r.box_sn] || 0) + 1;
    });

    return count;
  };

  const handleDeleteRow = (index: number) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setDuplicates(findDuplicates(next));
      return next;
    });
    setError(null);
    setSuccess(null);
  };

  return (
    <div
      className={`font-thai w-full h-[70vh] bg-white px-4 py-5 ${
        loading || saving ? "cursor-wait" : ""
      }`}
    >
      {/* Header / Summary */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            นำเข้าข้อมูลบิล ADV จาก Excel
          </h2>
          {/* <p className=" text-slate-500">
            อัปโหลดไฟล์ Excel ของ ADV เพื่อ Import
          </p> */}
        </div>

        <div className="flex items-end gap-4 text-sm">
          <div className="flex flex-col items-end text-slate-600">
            <span className=" uppercase tracking-wide text-slate-500">
              ผู้ใช้งาน
            </span>
            <span className="font-medium">
              {user?.first_name || user?.username || "-"}
            </span>
          </div>
          <div className="flex flex-col items-end text-slate-600">
            <span className=" uppercase tracking-wide text-slate-500">
              จำนวนแถวในไฟล์
            </span>
            <span className="font-semibold text-slate-800">
              {rows.length.toLocaleString("th-TH")}
            </span>
          </div>
        </div>
      </div>

      {/* Upload Panel */}
      <div className="mb-4 bg-white/90 border border-slate-200 rounded-xl shadow-sm px-4 py-3 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-600 mb-1 font-medium">
              เลือกไฟล์ Excel
            </span>
            <div className="flex items-center gap-3">
              {/* ปุ่มเลือกไฟล์แบบเด่นชัด */}
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-100 ">
                <span className="text-blue-700 font-medium">
                  เลือกไฟล์
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* แสดงชื่อไฟล์ที่เลือก */}
              {fileName ? (
                <span className="inline-flex items-center max-w-[260px] rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-700 truncate">
                  📄 <span className="ml-1 truncate">{fileName}</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  ยังไม่ได้เลือกไฟล์
                </span>
              )}
            </div>
            <span className="mt-1 text-[11px] text-slate-500">
              รองรับไฟล์ .xlsx, .xls เท่านั้น
            </span>
          </div>

          {/* สรุปจำนวนแถว + ปุ่มบันทึก */}
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-end gap-3 mt-1">
            {rows.length > 0 && (
              <span className=" text-slate-600">
                พบข้อมูล{" "}
                <span className="font-semibold">
                  {rows.length.toLocaleString("th-TH")}
                </span>{" "}
                แถว
                {Object.values(duplicates).some((c) => c > 1) && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-[1px]">
                    มี dpe_bill_no ซ้ำในไฟล์
                  </span>
                )}
              </span>
            )}

            <button
              onClick={handleSave}
              disabled={!rows.length || saving}
              className={`px-4 py-1.5 rounded-full  font-medium transition
                ${
                  !rows.length || saving
                    ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                }`}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mb-3  text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-3  text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
          {success}
        </div>
      )}

      {/* Table */}
      <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
        <div className="max-h-[75vh] overflow-auto rounded-xl">
          {!rows.length && !loading && (
            <div className="p-4 text-center text-sm text-slate-500">
              ยังไม่มีข้อมูลตัวอย่าง กรุณาเลือกไฟล์ Excel
            </div>
          )}

          {rows.length > 0 && (
            <table className="border-collapse min-w-max text-[13px]">
              <ResizableColumns
                headers={headers}
                pageKey="import-adv"
                minWidths={{
                  0: 60,
                  1: 60,
                }}
              />
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-blue-100/70`}
                  >
                    {/* ลำดับ */}
                    <td className="px-2 py-1.5 border-b border-slate-200  bg-gray-100 font-semibold text-center sticky left-0 z-10">
                      {idx + 1}
                    </td>

                    {/* จัดการ */}
                    <td className="px-2 py-1.5 border-b border-slate-200 text-center  whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(idx)}
                        className="px-3 py-1 rounded-full bg-red-500 text-white hover:bg-red-600 shadow-sm"
                      >
                        ลบ
                      </button>
                    </td>

                    {/* dpe_bill_no */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.dpe_bill_no || "-"}
                    </td>

                    {/* box_sn (เช็คซ้ำ) */}
                    <td
                      className={
                        "px-2 py-1.5 border-b border-slate-200  truncate font-mono " +
                        (duplicates[row.box_sn] > 1
                          ? "text-red-600 font-semibold"
                          : "text-slate-800")
                      }
                    >
                      {row.box_sn || "-"}
                    </td>

                    {/* cusname */}
                    <td className="px-2 py-1.5 border-b border-slate-200 truncate max-w-[220px]">
                      {row.cusname || "-"}
                    </td>

                    {/* address */}
                    <td className="px-2 py-1.5 border-b border-slate-200 truncate max-w-[220px]">
                      {row.address || "-"}
                    </td>

                    {/* province_name */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.province_name || "-"}
                    </td>

                    {/* amphur_name */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.amphur_name || "-"}
                    </td>

                    {/* district_name */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.district_name || "-"}
                    </td>

                    {/* postcode */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.postcode || "-"}
                    </td>

                    {/* cusmobile */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.cusmobile || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center mt-4">
          <div className="h-6 w-6 rounded-full border border-slate-300 border-t-blue-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
