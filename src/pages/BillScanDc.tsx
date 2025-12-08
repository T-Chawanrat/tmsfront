// import { useEffect, useRef, useState, FormEvent } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import successSound from "../../assets/sounds/success.mp3";
// import errorSound from "../../assets/sounds/error.mp3";

// type BillRow = {
//   id: number;
//   NO_BILL: string;
//   SERIAL_NO: string;
//   CUSTOMER_NAME: string;
//   warehouse_name: string;
// };

// export default function BillScanDc() {
//   const [pendingRows, setPendingRows] = useState<BillRow[]>([]); // ฝั่งซ้าย
//   const [scannedRows, setScannedRows] = useState<BillRow[]>([]); // ฝั่งขวา
//   const [serialInput, setSerialInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false); // ⭐ เพิ่ม state saving
//   const [error, setError] = useState<string | null>(null);
//   const [info, setInfo] = useState<string | null>(null);
//   const typingTimer = useRef<number | null>(null);
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const successSoundRef = useRef<HTMLAudioElement | null>(null);
//   const errorSoundRef = useRef<HTMLAudioElement | null>(null);
//   const { user } = useAuth();

//   const fetchPendingBills = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       const res = await axios.get("https://xsendwork.com/api/bills-dc", {
//         params: {
//           warehouse_accept: "Y",
//           dc_accept: "N",
//           user_id: user?.user_id,
//         },
//       });

//       // backend ที่เราเขียนส่งกลับ { success, data: [...] }
//       const data: BillRow[] = res.data.data || [];
//       setPendingRows(data);
//     } catch (err) {
//       console.error("Error fetching pending bills:", err);
//       setError("ไม่สามารถดึงข้อมูลได้");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPendingBills();
//   }, []);

//   // โฟกัสช่องยิงตลอด
//   useEffect(() => {
//     if (inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, []);

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     handleScanSerial();
//   };

//   const handleScanSerial = (value?: string) => {
//     const serial = (value || serialInput).trim();
//     if (!serial) return;

//     setError(null);
//     setInfo(null);

//     // หาในฝั่งซ้าย
//     const index = pendingRows.findIndex((row) => row.SERIAL_NO === serial);

//     if (index === -1) {
//       const alreadyIndex = scannedRows.findIndex(
//         (row) => row.SERIAL_NO === serial
//       );

//       if (alreadyIndex !== -1) {
//         setError(`SN : ${serial} ถูกยิงไปแล้ว`);
//       } else {
//         setError(`ไม่พบ SERIAL_NO ${serial}`);
//       }

//       errorSoundRef.current?.play();

//       setSerialInput("");
//       return;
//     }

//     // ย้ายจากซ้าย → ขวา
//     const row = pendingRows[index];
//     setPendingRows((prev) => prev.filter((_, i) => i !== index));
//     setScannedRows((prev) => [row, ...prev]);

//     setInfo(`ยิง SN : ${serial} สำเร็จ`);
//     successSoundRef.current?.play();
//     setSerialInput("");

//     // โฟกัสช่องยิงต่อ
//     inputRef.current?.focus();
//   };

//   const handleSaveAccept = async () => {
//     if (!scannedRows.length) {
//       setError("ยังไม่มีรายการที่ยิงแล้วสำหรับบันทึก");
//       return;
//     }

//     setSaving(true);
//     setError(null);
//     setInfo(null);

//     try {
//       const serials = scannedRows.map((r) => r.SERIAL_NO);

//       await axios.post("https://xsendwork.com/api/bills-dc/accept", {
//         serials,
//         accept_flag: "Y",
//       });

//       setInfo(`บันทึกผลการยิงแล้วจำนวน ${serials.length} รายการ`);

//       await fetchPendingBills();
//       setScannedRows([]);
//     } catch (err) {
//       console.error("Error saving warehouse accept:", err);
//       setError("เกิดข้อผิดพลาดในการบันทึกผลการยิง");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const totalCount = pendingRows.length + scannedRows.length;

//   return (
//     <div className="font-thai w-full p-4">
//       <audio ref={successSoundRef} src={successSound} preload="auto" />
//       <audio ref={errorSoundRef} src={errorSound} preload="auto" />
//       <h2 className="text-xl font-bold mb-4">ยิงเทียบพัสดุ (คลัง DC)</h2>

//       {/* ส่วนช่องยิงบาร์โค้ด */}
//       <form
//         onSubmit={handleSubmit}
//         className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-2"
//       >
//         <label className="text-sm font-medium">ยิงบาร์โค้ด :</label>

//         <input
//           ref={inputRef}
//           type="text"
//           value={serialInput}
//           onChange={(e) => {
//             const value = e.target.value.trim();
//             setSerialInput(value);

//             if (typingTimer.current) {
//               clearTimeout(typingTimer.current);
//             }

//             typingTimer.current = setTimeout(() => {
//               handleScanSerial(value.trim());
//             }, 150);
//           }}
//           className="border rounded px-2 py-1 text-sm w-64"
//           placeholder="SERIAL_NO"
//         />

//         <div className="ml-auto flex flex-col md:flex-row items-start md:items-center gap-2 text-lg text-gray-600">
//           <div>
//             ทั้งหมด:{" "}
//             <span className="font-semibold">{totalCount.toLocaleString()}</span>{" "}
//             | รอเช็ค:{" "}
//             <span className="font-semibold text-red-600">
//               {pendingRows.length.toLocaleString()}
//             </span>{" "}
//             | เช็คแล้ว:{" "}
//             <span className="font-semibold text-green-600">
//               {scannedRows.length.toLocaleString()}
//             </span>
//           </div>

//           <button
//             type="button"
//             onClick={handleSaveAccept}
//             disabled={!scannedRows.length || saving}
//             className={`px-4 py-2 rounded text-white text-sm ${
//               !scannedRows.length || saving
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-green-600 hover:bg-green-700"
//             }`}
//           >
//             {saving ? "กำลังบันทึก..." : "บันทึก"}
//           </button>
//         </div>
//       </form>

//       {/* แสดง error / info */}
//       {error && (
//         <div className="mb-3 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
//           {error}
//         </div>
//       )}
//       {info && (
//         <div className="mb-3 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
//           {info}
//         </div>
//       )}

//       {loading && <div className="mb-3 text-gray-500">กำลังโหลดข้อมูล...</div>}

//       {/* สองฝั่ง: ซ้าย (รอเช็ค) / ขวา (ยิงแล้ว) */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {/* ฝั่งซ้าย */}
//         <div className="border rounded bg-white flex flex-col max-h-[70vh]">
//           <div className="px-3 py-2 border-b bg-gray-100 flex justify-between items-center">
//             <span className="font-medium text-sm">รายการรอเช็ค</span>
//             <span className="text-lg text-red-600">
//               {pendingRows.length.toLocaleString()} รายการ
//             </span>
//           </div>

//           <div className="overflow-auto">
//             {pendingRows.length === 0 ? (
//               <div className="p-3 text-center text-gray-500 text-sm">
//                 ไม่มีรายการที่รอเช็ค
//               </div>
//             ) : (
//               <table className="w-full table-fixed border-collapse text-sm">
//                 <thead className="bg-gray-50 sticky top-0 z-10">
//                   <tr>
//                     <th className="px-2 py-1 border-b w-14">ลำดับ</th>
//                     <th className="px-2 py-1 border-b min-w-[220px]">
//                       SERIAL_NO
//                     </th>
//                     <th className="px-2 py-1 border-b">CUSTOMER_NAME</th>
//                     <th className="px-2 py-1 border-b">DC ปลายทาง</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {pendingRows.map((row, idx) => (
//                     <tr
//                       key={row.id}
//                       className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                     >
//                       <td className="px-2 py-1 border-b text-center">
//                         {idx + 1}
//                       </td>
//                       <td className="px-2 py-1 border-b font-semibold text-white text-lg bg-red-500">
//                         {row.SERIAL_NO}
//                       </td>
//                       <td className="px-2 py-1 border-b truncate">
//                         {row.CUSTOMER_NAME || "-"}
//                       </td>
//                       <td className="px-2 py-1 border-b truncate">
//                         {row.warehouse_name || "-"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>

//         {/* ฝั่งขวา */}
//         <div className="border rounded bg-white flex flex-col max-h-[70vh]">
//           <div className="px-3 py-2 border-b bg-gray-100 flex justify-between items-center">
//             <span className="font-medium text-sm">รายการที่ยิงแล้ว</span>
//             <span className="text-lg text-green-600">
//               {scannedRows.length.toLocaleString()} รายการ
//             </span>
//           </div>

//           <div className="overflow-auto">
//             {scannedRows.length === 0 ? (
//               <div className="p-3 text-center text-gray-500 text-sm">
//                 ยังไม่มีรายการที่ถูกยิง
//               </div>
//             ) : (
//               <table className="w-full table-fixed border-collapse text-sm">
//                 <thead className="bg-gray-50 sticky top-0 z-10">
//                   <tr>
//                     <th className="px-2 py-1 border-b w-14">ลำดับ</th>
//                     <th className="px-2 py-1 border-b min-w-[220px]">
//                       SERIAL_NO
//                     </th>
//                     <th className="px-2 py-1 border-b">CUSTOMER_NAME</th>
//                     <th className="px-2 py-1 border-b">DC ปลายทาง</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {scannedRows.map((row, idx) => (
//                     <tr
//                       key={row.id}
//                       className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
//                     >
//                       <td className="px-2 py-1 border-b text-center">
//                         {idx + 1}
//                       </td>
//                       <td className="px-2 py-1 border-b font-semibold text-lg bg-green-400">
//                         {row.SERIAL_NO}
//                       </td>
//                       <td className="px-2 py-1 border-b truncate">
//                         {row.CUSTOMER_NAME || "-"}
//                       </td>
//                       <td className="px-2 py-1 border-b truncate">
//                         {row.warehouse_name || "-"}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











import { useEffect, useRef, useState, FormEvent } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import successSound from "../../assets/sounds/success.mp3";
import errorSound from "../../assets/sounds/error.mp3";

type BillRow = {
  id: number;
  NO_BILL: string;
  SERIAL_NO: string;
  CUSTOMER_NAME: string;
  warehouse_name: string;
};

export default function BillScanDc() {
  const [pendingRows, setPendingRows] = useState<BillRow[]>([]); // ฝั่งซ้าย
  const [scannedRows, setScannedRows] = useState<BillRow[]>([]); // ฝั่งขวา
  const [serialInput, setSerialInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const typingTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const errorSoundRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("https://xsendwork.com/api/bills-dc", {
        params: {
          warehouse_accept: "Y",
          dc_accept: "N",
          user_id: user?.user_id,
        },
      });

      const data: BillRow[] = res.data.data || [];
      setPendingRows(data);
    } catch (err) {
      console.error("Error fetching pending bills:", err);
      setError("ไม่สามารถดึงข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // โฟกัสช่องยิงตลอด
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleScanSerial();
  };

  const handleScanSerial = (value?: string) => {
    const serial = (value || serialInput).trim();
    if (!serial) return;

    setError(null);
    setInfo(null);

    const index = pendingRows.findIndex((row) => row.SERIAL_NO === serial);

    if (index === -1) {
      const alreadyIndex = scannedRows.findIndex(
        (row) => row.SERIAL_NO === serial
      );

      if (alreadyIndex !== -1) {
        setError(`SN : ${serial} ถูกยิงไปแล้ว`);
      } else {
        setError(`ไม่พบ SERIAL_NO ${serial}`);
      }

      errorSoundRef.current?.play();
      setSerialInput("");
      return;
    }

    const row = pendingRows[index];
    setPendingRows((prev) => prev.filter((_, i) => i !== index));
    setScannedRows((prev) => [row, ...prev]);

    setInfo(`ยิง SN : ${serial} สำเร็จ`);
    successSoundRef.current?.play();
    setSerialInput("");
    inputRef.current?.focus();
  };

  const handleSaveAccept = async () => {
    if (!scannedRows.length) {
      setError("ยังไม่มีรายการที่ยิงแล้วสำหรับบันทึก");
      return;
    }

    setSaving(true);
    setError(null);
    setInfo(null);

    try {
      const serials = scannedRows.map((r) => r.SERIAL_NO);

      await axios.post("https://xsendwork.com/api/bills-dc/accept", {
        serials,
        accept_flag: "Y",
      });

      setInfo(`บันทึกผลการยิงแล้วจำนวน ${serials.length} รายการ`);

      await fetchPendingBills();
      setScannedRows([]);
    } catch (err) {
      console.error("Error saving warehouse accept:", err);
      setError("เกิดข้อผิดพลาดในการบันทึกผลการยิง");
    } finally {
      setSaving(false);
    }
  };

  const totalCount = pendingRows.length + scannedRows.length;

  return (
    <div
      className={`font-thai w-full min-h-screen bg-white px-4 py-5 ${
        loading || saving ? "cursor-wait" : ""
      }`}
    >
      <audio ref={successSoundRef} src={successSound} preload="auto" />
      <audio ref={errorSoundRef} src={errorSound} preload="auto" />

      {/* Header / Summary */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            ยิงเทียบพัสดุ (คลัง DC)
          </h2>
          {/* <p className=" text-slate-500">
            ยิงบาร์โค้ดเพื่อรับพัสดุเข้าคลัง DC แสดงรายการรอเช็ค / ยิงแล้วแบบเรียลไทม์
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
              รวมรายการ
            </span>
            <span className="font-semibold text-slate-800">
              {totalCount.toLocaleString("th-TH")}
            </span>
          </div>
        </div>
      </div>

      {/* ส่วนช่องยิงบาร์โค้ด + ปุ่มบันทึก */}
      <form
        onSubmit={handleSubmit}
        className="mb-4 bg-white/90 border border-slate-200 rounded-xl shadow-sm px-4 py-3 flex flex-col md:flex-row md:items-center gap-3"
      >
        <div className="flex flex-col gap-1">
          {/* <span className="text-[11px] text-slate-600 font-medium">
            ยิงบาร์โค้ด (SERIAL_NO)
          </span> */}
          <input
            ref={inputRef}
            type="text"
            value={serialInput}
            onChange={(e) => {
              const value = e.target.value.trim();
              setSerialInput(value);

              if (typingTimer.current) {
                window.clearTimeout(typingTimer.current);
              }

              typingTimer.current = window.setTimeout(() => {
                handleScanSerial(value.trim());
              }, 150);
            }}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm w-64 shadow-inner focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            placeholder="ยิงบาร์โค้ด..."
          />
        </div>

        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-end gap-3  text-slate-600 mt-1">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:mr-2">
            <span>
              ทั้งหมด{" "}
              <span className="font-semibold text-lg text-slate-800">
                {totalCount.toLocaleString("th-TH")}
              </span>
            </span>
            <span>
              | รอเช็ค{" "}
              <span className="font-semibold text-lg text-red-600">
                {pendingRows.length.toLocaleString("th-TH")}
              </span>
            </span>
            <span>
              | เช็คแล้ว{" "}
              <span className="font-semibold text-lg text-emerald-600">
                {scannedRows.length.toLocaleString("th-TH")}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveAccept}
            disabled={!scannedRows.length || saving}
            className={`px-4 py-1.5 rounded-full  font-medium transition
              ${
                !scannedRows.length || saving
                  ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>

      {/* error / info */}
      {error && (
        <div className="mb-3  text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      {info && (
        <div className="mb-3  text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
          {info}
        </div>
      )}

      {loading && (
        <div className="mb-3  text-slate-500">กำลังโหลดข้อมูล...</div>
      )}

      {/* สองฝั่ง: ซ้าย (รอเช็ค) / ขวา (ยิงแล้ว) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ฝั่งซ้าย: รอเช็ค */}
        <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col max-h-[70vh]">
          <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
            <span className="font-medium  text-slate-700">
              รายการรอเช็ค
            </span>
            <span className="text-lg text-red-600 font-semibold">
              {pendingRows.length.toLocaleString("th-TH")} รายการ
            </span>
          </div>

          <div className="overflow-auto rounded-b-xl">
            {pendingRows.length === 0 ? (
              <div className="p-3 text-center  text-slate-500">
                ไม่มีรายการที่รอเช็ค
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse text-[13px]">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1.5 border-b border-slate-200 w-14  text-slate-600">
                      ลำดับ
                    </th>
                    <th className="px-2 py-1.5 border-b border-slate-200 min-w-[400px]  text-slate-600">
                      SERIAL_NO
                    </th>
                    <th className="px-2 py-1.5 border-b border-slate-200  text-slate-600">
                      CUSTOMER_NAME
                    </th>
                    <th className="px-2 py-1.5 border-b border-slate-200  text-slate-600">
                      DC ปลายทาง
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } hover:bg-blue-50/50`}
                    >
                      <td className="px-2 py-1.5 border-b border-slate-200 text-center ">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1.5 border-b border-slate-200">
                        <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-[1px] text-lg font-mono font-semibold text-red-600">
                          {row.SERIAL_NO}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                        {row.CUSTOMER_NAME || "-"}
                      </td>
                      <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                        {row.warehouse_name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ฝั่งขวา: ยิงแล้ว */}
        <div className="border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col max-h-[70vh]">
          <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
            <span className="font-medium  text-slate-700">
              รายการที่ยิงแล้ว
            </span>
            <span className="text-lg text-emerald-600 font-semibold">
              {scannedRows.length.toLocaleString("th-TH")} รายการ
            </span>
          </div>

          <div className="overflow-auto rounded-b-xl">
            {scannedRows.length === 0 ? (
              <div className="p-3 text-center  text-slate-500">
                ยังไม่มีรายการที่ถูกยิง
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse text-[13px]">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1.5 border-b border-slate-200 w-14  text-slate-600">
                      ลำดับ
                    </th>
                    <th className="px-2 py-1.5 border-b border-slate-200 min-w-[400px]  text-slate-600">
                      SERIAL_NO
                    </th>
                    <th className="px-2 py-1.5 border-b border-slate-200  text-slate-600">
                      CUSTOMER_NAME
                    </th>
                    <th className="px-2 py-1.5 border-b border-slate-200  text-slate-600">
                      DC ปลายทาง
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {scannedRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      } hover:bg-blue-50/50`}
                    >
                      <td className="px-2 py-1.5 border-b border-slate-200 text-center ">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1.5 border-b border-slate-200">
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-[1px] text-lg font-mono font-semibold text-emerald-700">
                          {row.SERIAL_NO}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                        {row.CUSTOMER_NAME || "-"}
                      </td>
                      <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                        {row.warehouse_name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

