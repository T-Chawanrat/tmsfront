import { useEffect, useRef, useState, FormEvent } from "react";
import axios from "axios";

type BillRow = {
  id: number;
  NO_BILL: string;
  SERIAL_NO: string;
  CUSTOMER_NAME: string;
  warehouse_name: string;
};

export default function BillScanWarehouse() {
  const [pendingRows, setPendingRows] = useState<BillRow[]>([]); // ฝั่งซ้าย
  const [scannedRows, setScannedRows] = useState<BillRow[]>([]); // ฝั่งขวา
  const [serialInput, setSerialInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false); // ⭐ เพิ่ม state saving
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const typingTimer = useRef<number | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  
  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get("https://xsendwork.com/api/bills-warehouse", {});

      // backend ที่เราเขียนส่งกลับ { success, data: [...] }
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
  }, []);

  // โฟกัสช่องยิงตลอด
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleScanSerial();
  };

  // const handleScanSerial = () => {
  //   const serial = serialInput.trim();
  //   if (!serial) return;

  //   setError(null);
  //   setInfo(null);

  //   // หาในฝั่งซ้าย (pending)
  //   const index = pendingRows.findIndex((row) => row.SERIAL_NO === serial);

  //   if (index === -1) {
  //     // ถ้าไม่เจอในฝั่งซ้าย ลองเช็คว่าถูกยิงไปแล้วหรือยัง
  //     const alreadyIndex = scannedRows.findIndex(
  //       (row) => row.SERIAL_NO === serial
  //     );

  //     if (alreadyIndex !== -1) {
  //       setError(`SERIAL_NO ${serial} ถูกยิงไปแล้ว`);
  //     } else {
  //       setError(`ไม่พบ SERIAL_NO ${serial} ในรายการที่รอเช็ค`);
  //     }

  //     setSerialInput("");
  //     return;
  //   }

  //   const row = pendingRows[index];

  //   // ย้ายจากซ้าย → ขวา
  //   setPendingRows((prev) => prev.filter((_, i) => i !== index));
  //   setScannedRows((prev) => [row, ...prev]); // ใส่ด้านบนสุด

  //   setInfo(`SERIAL_NO ${serial} ยิงสำเร็จ`);
  //   setSerialInput("");

  //   // โฟกัสช่องยิงต่อ
  //   if (inputRef.current) {
  //     inputRef.current.focus();
  //   }
  // };

  const handleScanSerial = (value?: string) => {
    const serial = (value || serialInput).trim();
    if (!serial) return;

    setError(null);
    setInfo(null);

    // หาในฝั่งซ้าย
    const index = pendingRows.findIndex((row) => row.SERIAL_NO === serial);

    if (index === -1) {
      const alreadyIndex = scannedRows.findIndex(
        (row) => row.SERIAL_NO === serial
      );

      if (alreadyIndex !== -1) {
        setError(`SERIAL_NO ${serial} ถูกยิงไปแล้ว`);
      } else {
        setError(`ไม่พบ SERIAL_NO ${serial}`);
      }

      setSerialInput("");
      return;
    }

    // ย้ายจากซ้าย → ขวา
    const row = pendingRows[index];
    setPendingRows((prev) => prev.filter((_, i) => i !== index));
    setScannedRows((prev) => [row, ...prev]);

    setInfo(`ยิง SERIAL_NO ${serial} สำเร็จ`);
    setSerialInput("");

    // โฟกัสช่องยิงต่อ
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

      await axios.post("https://xsendwork.com/api/bills-warehouse/accept", {
        serials,
        accept_flag: "Y", 
      });

      setInfo(`บันทึกผลการยิงแล้วจำนวน ${serials.length} รายการ`);

      // รีโหลดฝั่งซ้ายใหม่ และเคลียร์ฝั่งขวา
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
    <div className="font-thai w-full p-4">
      <h2 className="text-xl font-bold mb-4">ยิงเทียบพัสดุ (คลัง 345)</h2>

      {/* ส่วนช่องยิงบาร์โค้ด */}
      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-2"
      >
        <label className="text-sm font-medium">ยิงบาร์โค้ด SERIAL_NO:</label>
        {/* <input
          ref={inputRef}
          type="text"
          value={serialInput}
          onChange={(e) => setSerialInput(e.target.value)}
          className="border rounded px-2 py-1 text-sm w-64"
          placeholder="ยิงบาร์โค้ดแล้วกด Enter"
        /> */}
        <input
          ref={inputRef}
          type="text"
          value={serialInput}
          onChange={(e) => {
            const value = e.target.value;
            setSerialInput(value);

            // ถ้ามี timer เดิม → เคลียร์ก่อน
            if (typingTimer.current) {
              clearTimeout(typingTimer.current);
            }

            // ตั้งดีเลย์ 150ms → คิดว่าเป็นการยิงบาร์โค้ดเสร็จแล้ว
            typingTimer.current = setTimeout(() => {
              handleScanSerial(value);
            }, 150);
          }}
          className="border rounded px-2 py-1 text-sm w-64"
          placeholder="ยิงบาร์โค้ด"
        />

        {/* <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
        >
          ตกลง
        </button> */}

        <div className="ml-auto flex flex-col md:flex-row items-start md:items-center gap-2 text-lg text-gray-600">
          <div>
            ทั้งหมด:{" "}
            <span className="font-semibold">{totalCount.toLocaleString()}</span>{" "}
            | รอเช็ค:{" "}
            <span className="font-semibold text-red-600">
              {pendingRows.length.toLocaleString()}
            </span>{" "}
            | เช็คแล้ว:{" "}
            <span className="font-semibold text-green-600">
              {scannedRows.length.toLocaleString()}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveAccept}
            disabled={!scannedRows.length || saving}
            className={`px-4 py-2 rounded text-white text-sm ${
              !scannedRows.length || saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </form>

      {/* แสดง error / info */}
      {error && (
        <div className="mb-3 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}
      {info && (
        <div className="mb-3 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
          {info}
        </div>
      )}

      {loading && <div className="mb-3 text-gray-500">กำลังโหลดข้อมูล...</div>}

      {/* สองฝั่ง: ซ้าย (รอเช็ค) / ขวา (ยิงแล้ว) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ฝั่งซ้าย */}
        <div className="border rounded bg-white flex flex-col max-h-[70vh]">
          <div className="px-3 py-2 border-b bg-gray-100 flex justify-between items-center">
            <span className="font-medium text-sm">รายการรอเช็ค</span>
            <span className="text-lg text-red-600">
              {pendingRows.length.toLocaleString()} รายการ
            </span>
          </div>

          <div className="overflow-auto">
            {pendingRows.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                ไม่มีรายการที่รอเช็ค
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 border-b w-14">ลำดับ</th>
                    <th className="px-2 py-1 border-b w-40">SERIAL_NO</th>
                    <th className="px-2 py-1 border-b">CUSTOMER_NAME</th>
                    <th className="px-2 py-1 border-b">DC ปลายทาง</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-2 py-1 border-b text-center">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1 border-b font-semibold text-lg bg-red-500">
                        {row.SERIAL_NO}
                      </td>
                      <td className="px-2 py-1 border-b truncate">
                        {row.CUSTOMER_NAME || "-"}
                      </td>
                      <td className="px-2 py-1 border-b truncate">
                        {row.warehouse_name || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ฝั่งขวา */}
        <div className="border rounded bg-white flex flex-col max-h-[70vh]">
          <div className="px-3 py-2 border-b bg-gray-100 flex justify-between items-center">
            <span className="font-medium text-sm">รายการที่ยิงแล้ว</span>
            <span className="text-lg text-green-600">
              {scannedRows.length.toLocaleString()} รายการ
            </span>
          </div>

          <div className="overflow-auto">
            {scannedRows.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                ยังไม่มีรายการที่ถูกยิง
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 border-b w-14">ลำดับ</th>
                    <th className="px-2 py-1 border-b w-40">SERIAL_NO</th>
                    <th className="px-2 py-1 border-b">CUSTOMER_NAME</th>
                    <th className="px-2 py-1 border-b">DC ปลายทาง</th>
                  </tr>
                </thead>
                <tbody>
                  {scannedRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-2 py-1 border-b text-center">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1 border-b font-semibold text-lg  bg-green-400">
                        {row.SERIAL_NO}
                      </td>
                      <td className="px-2 py-1 border-b truncate">
                        {row.CUSTOMER_NAME || "-"}
                      </td>
                       <td className="px-2 py-1 border-b truncate">
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
