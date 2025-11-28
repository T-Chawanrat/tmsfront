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
};

type LabelRow = BillRow & {
  barcode_url: string;
  qr_url: string;
};

const headers = [
  "เลือก",
  "ลำดับ",
  "SERIAL_NO",
  "REFERENCE",
  "CUSTOMER_NAME",
  "RECIPIENT_ADDRESS",
];

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

  // 1) โหลด bills_data + label info (ของ user นี้) จาก /api/print-labels แค่ครั้งเดียว
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
          setBills(rows); // ใช้แสดงตารางลิสต์
          setLabels(rows); // ใช้ preview labels (มี barcode_url, qr_url แล้ว)
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

  // 2) กดปุ่มสร้าง Label → แค่เปลี่ยน step ไปหน้า preview (ไม่ต้องยิง API อีก)
  const handleCreateLabels = () => {
    if (!selectedIds.length) {
      setError("กรุณาเลือกรายการอย่างน้อย 1 รายการ");
      return;
    }

    // filter เฉพาะที่ถูกเลือก
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

  return (
    <div className="font-thai w-full p-4 bg-gray-100 print:bg-white">
      {/* Header + ปุ่มด้านบน (ซ่อนตอน print) */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h2 className="text-xl font-bold">
          {step === "bills"
            ? "รายการบิลสำหรับสร้าง Label"
            : "พิมพ์สติ๊กเกอร์ (Labels)"}
        </h2>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            ผู้ใช้: {user?.first_name || user?.username}
          </span>

          {step === "bills" ? (
            <button
              onClick={handleCreateLabels}
              disabled={!bills.length}
              className={`px-4 py-2 rounded text-white font-medium ${
                !bills.length
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              สร้าง Label สำหรับรายการนี้
            </button>
          ) : (
            <>
              <button
                onClick={handleBackToBills}
                className="px-3 py-2 rounded text-sm font-medium bg-gray-300 hover:bg-gray-400 text-gray-800"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handlePrint}
                disabled={!labels.length}
                className={`px-4 py-2 rounded text-white font-medium ${
                  !labels.length
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                พิมพ์
              </button>
            </>
          )}
        </div>
      </div>

      {/* แสดง error */}
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* STEP 1: ตาราง bills_data */}
      {step === "bills" && (
        <>
          {loadingBills && (
            <div className="text-center text-gray-600">
              กำลังโหลดรายการบิล...
            </div>
          )}

          {!loadingBills && !bills.length && !error && (
            <div className="text-center text-gray-500">
              ยังไม่มีบิลสำหรับสร้าง Label
            </div>
          )}

          {bills.length > 0 && (
            <div className="overflow-x-auto border border-gray-300 rounded bg-white">
              <table className="w-md table-fixed border-collapse">
                {/* หัวตารางแบบ ResizableColumns */}
                <ResizableColumns headers={headers} pageKey="labels-page" />
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 border-b text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === bills.length}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th colSpan={headers.length} />
                  </tr>
                </thead>

                <tbody>
                  {bills.map((b, idx) => (
                    <tr
                      key={b.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {/* checkbox */}
                      <td className="px-2 py-1 border-b text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(b.id)}
                          onChange={() => toggleSelect(b.id)}
                        />
                      </td>

                      {/* ลำดับ */}
                      <td className="px-3 py-1 border-b text-sm bg-gray-100 font-semibold text-center sticky left-0 z-10">
                        {idx + 1}
                      </td>

                      <td className="px-3 py-1 border-b text-sm truncate">
                        {b.SERIAL_NO || "-"}
                      </td>
                      <td className="px-3 py-1 border-b text-sm truncate">
                        {b.REFERENCE || "-"}
                      </td>
                      <td className="px-3 py-1 border-b text-sm truncate">
                        {b.CUSTOMER_NAME || "-"}
                      </td>
                      <td className="px-3 py-1 border-b text-sm truncate">
                        {b.RECIPIENT_ADDRESS
                          ? `${b.RECIPIENT_NAME || ""} ${
                              b.RECIPIENT_ADDRESS
                            } ต.${b.RECIPIENT_SUBDISTRICT} อ.${
                              b.RECIPIENT_DISTRICT
                            } จ.${b.RECIPIENT_PROVINCE} ${b.RECIPIENT_ZIPCODE}`
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                bg-white border border-gray-300 rounded shadow-sm
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
              {/* บรรทัดบน: ข้อมูล + Barcode */}
              {/* <div className="flex flex-col gap-1">
                <div className="text-xs font-semibold">
                  เลขที่บาร์โค้ด: {row.SERIAL_NO}
                </div>
                <div className="text-xs">
                  เลขที่บิล: {row.REFERENCE || "-"}
                </div>
                <div className="text-xs">
                  ลูกค้า: {row.CUSTOMER_NAME || "-"}
                </div>

                {row.barcode_url && (
                  <div className="mt-1 flex justify-center">
                    <img
                      src={row.barcode_url}
                      alt={`BARCODE_${row.SERIAL_NO}`}
                      style={{ maxWidth: "100%", maxHeight: "1.8cm" }}
                    />
                    
                  </div>
                  
                )}
              </div> */}

              <div className="flex flex-col gap-1">
                {/* <div className="text-xs font-semibold">
    เลขที่บาร์โค้ด: {row.SERIAL_NO}
  </div>
  <div className="text-xs">
    เลขที่บิล: {row.REFERENCE || "-"}
  </div>
  <div className="text-xs">
    ลูกค้า: {row.CUSTOMER_NAME || "-"}
  </div> */}

                {row.barcode_url && (
                  <div className="mt-1 flex flex-col items-center">
                    <img
                      src={row.barcode_url}
                      alt={`BARCODE_${row.SERIAL_NO}`}
                      style={{ maxWidth: "100%", maxHeight: "2cm" }}
                    />

                    {/* 🔥 ตัวหนังสือใต้บาร์โค้ด */}
                    <div className="text-md mt-1 tracking-widest font-bold text-center">
                      {row.SERIAL_NO}
                    </div>
                  </div>
                )}
              </div>

              {/* ที่อยู่ผู้รับ */}
              <div className="text-[10px] leading-snug mt-1">
                <div className="font-semibold">
                  ผู้รับ: {row.RECIPIENT_NAME || "-"}
                </div>
                <div>ที่อยู่: {row.RECIPIENT_ADDRESS || "-"}</div>
                <div>
                  ต.{row.RECIPIENT_SUBDISTRICT || "-"} อ.
                  {row.RECIPIENT_DISTRICT || "-"} จ.
                  {row.RECIPIENT_PROVINCE || "-"} {row.RECIPIENT_ZIPCODE || ""}
                </div>
              </div>

              {/* QR + text เพิ่มเติม */}
              <div className="flex justify-between items-center mt-1">
                <div className="text-[9px] text-right">
                  <div>Ref: {row.REFERENCE || "-"}</div>
                  <div>SN: {row.SERIAL_NO}</div>
                </div>

                {row.qr_url && (
                  <img
                    src={row.qr_url}
                    alt={`QR_${row.SERIAL_NO}`}
                    style={{ width: "2.5cm", height: "2.5cm" }}
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


