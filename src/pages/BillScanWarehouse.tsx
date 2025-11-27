import { useEffect, useRef, useState, FormEvent } from "react";
import axios from "axios";
import { FilterDropdown } from "../components/dropdown/FilterDropdown";

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const typingTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ⭐ state filter ใหม่
  const [customerFilter, setCustomerFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");

  const fetchPendingBills = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        "https://xsendwork.com/api/bills-warehouse",
        {}
      );
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
        setError(`SERIAL_NO ${serial} ถูกยิงไปแล้ว`);
      } else {
        setError(`ไม่พบ SERIAL_NO ${serial}`);
      }

      setSerialInput("");
      return;
    }

    const row = pendingRows[index];
    setPendingRows((prev) => prev.filter((_, i) => i !== index));
    setScannedRows((prev) => [row, ...prev]);

    setInfo(`ยิง SERIAL_NO ${serial} สำเร็จ`);
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

      await axios.post("https://xsendwork.com/api/bills-warehouse/accept", {
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

  const customerOptions = Array.from(
    new Set(
      [...pendingRows, ...scannedRows]
        .map((r) => r.CUSTOMER_NAME)
        .filter((v) => !!v)
    )
  );

  const warehouseOptions = Array.from(
    new Set(
      [...pendingRows, ...scannedRows]
        .map((r) => r.warehouse_name)
        .filter((v) => !!v)
    )
  );

  // ⭐ ฟังก์ชันช่วย normalize string
  const normalize = (s: string | null | undefined) =>
    (s || "").toLowerCase().trim();

  const customerFilterNorm = normalize(customerFilter);
  const warehouseFilterNorm = normalize(warehouseFilter);

  // ⭐ filter ข้อมูลตาม CUSTOMER_NAME + warehouse_name
  const filteredPendingRows = pendingRows.filter((row) => {
    const customerMatch =
      !customerFilterNorm ||
      normalize(row.CUSTOMER_NAME).includes(customerFilterNorm);

    const warehouseMatch =
      !warehouseFilterNorm ||
      normalize(row.warehouse_name).includes(warehouseFilterNorm);

    return customerMatch && warehouseMatch;
  });

  const filteredScannedRows = scannedRows.filter((row) => {
    const customerMatch =
      !customerFilterNorm ||
      normalize(row.CUSTOMER_NAME).includes(customerFilterNorm);

    const warehouseMatch =
      !warehouseFilterNorm ||
      normalize(row.warehouse_name).includes(warehouseFilterNorm);

    return customerMatch && warehouseMatch;
  });

  return (
    <div className="font-thai w-full p-4">
      <h2 className="text-xl font-bold mb-4">ยิงเทียบพัสดุ (คลัง 345)</h2>

      {/* ส่วนช่องยิงบาร์โค้ด */}
      <form
        onSubmit={handleSubmit}
        className="mb-4 flex flex-col md:flex-row items-start md:items-center gap-2"
      >
        <label className="text-sm font-medium">ยิงบาร์โค้ด :</label>

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
          className="border rounded px-2 py-1 text-sm w-64 bg-white"
          placeholder="SERIAL_NO"
        />

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

      {/* ⭐ แถว filter CUSTOMER_NAME + warehouse_name (เป็น dropdown ที่พิมพ์ได้) */}

      <div className="mb-3 flex flex-col md:flex-row gap-3">
        {/* กรองชื่อลูกค้า */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">
            ชื่อลูกค้า:
          </span>
          <div className="w-48">
            <FilterDropdown
              value={customerFilter}
              onChange={setCustomerFilter}
              options={customerOptions}
              placeholder="ค้นหาลูกค้า"
            />
          </div>
        </div>

        {/* กรอง DC */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <span className="text-sm font-medium whitespace-nowrap">
           DC ปลายทาง:
          </span>
          <div className="w-48">
            <FilterDropdown
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={warehouseOptions}
              placeholder="ค้นหา DC"
            />
          </div>
        </div>
      </div>

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
              {/* แสดงจำนวนตาม filter / ทั้งหมด */}
              {filteredPendingRows.length.toLocaleString()} /{" "}
              {pendingRows.length.toLocaleString()} รายการ
            </span>
          </div>

          <div className="overflow-auto">
            {pendingRows.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                ไม่มีรายการที่รอเช็ค
              </div>
            ) : filteredPendingRows.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                ไม่พบรายการที่ตรงกับเงื่อนไขกรอง
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 border-b w-14">ลำดับ</th>
                    <th className="px-2 py-1 border-b min-w-[220px]">
                      SERIAL_NO
                    </th>
                    <th className="px-2 py-1 border-b">CUSTOMER_NAME</th>
                    <th className="px-2 py-1 border-b">DC ปลายทาง</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPendingRows.map((row, idx) => (
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
              {filteredScannedRows.length.toLocaleString()} /{" "}
              {scannedRows.length.toLocaleString()} รายการ
            </span>
          </div>

          <div className="overflow-auto">
            {scannedRows.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                ยังไม่มีรายการที่ถูกยิง
              </div>
            ) : filteredScannedRows.length === 0 ? (
              <div className="p-3 text-center text-gray-500 text-sm">
                ไม่พบรายการที่ตรงกับเงื่อนไขกรอง
              </div>
            ) : (
              <table className="w-full table-fixed border-collapse text-sm">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-1 border-b w-14">ลำดับ</th>
                    <th className="px-2 py-1 border-b min-w-[220px]">
                      SERIAL_NO
                    </th>
                    <th className="px-2 py-1 border-b">CUSTOMER_NAME</th>
                    <th className="px-2 py-1 border-b">DC ปลายทาง</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScannedRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-2 py-1 border-b text-center">
                        {idx + 1}
                      </td>
                      <td className="px-2 py-1 border-b font-semibold text-lg bg-green-400">
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
