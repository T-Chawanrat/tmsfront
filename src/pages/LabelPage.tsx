import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

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

export default function LabelPage() {
  const { user } = useAuth();

  const [bills, setBills] = useState<BillRow[]>([]);
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [loadingLabels, setLoadingLabels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // step: bills = ดูลิสต์ก่อน, labels = preview label
  const [step, setStep] = useState<"bills" | "labels">("bills");

  // 1) โหลด bills_data ที่จะใช้สร้าง label (วันนี้ของ user นี้)
  useEffect(() => {
    const fetchBills = async () => {
      if (!user?.user_id) return;
      setLoadingBills(true);
      setError(null);

      try {
        // 👇 ถ้ายังไม่มี endpoint นี้ ให้ทำ backend ง่าย ๆ SELECT bills_data ตาม user + วันที่
        const res = await axios.get(
          "https://xsendwork.com/api/preview",
          {
            params: {
              user_id: user.user_id,
            },
          }
        );

        if (res.data?.success) {
          setBills(res.data.data || []);
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

    fetchBills();
  }, [user?.user_id]);

  // 2) กดปุ่มสร้าง Label → เรียก /api/print-labels (ที่คุณเขียนไว้แล้ว)
  const handleCreateLabels = async () => {
    if (!user?.user_id) return;
    setLoadingLabels(true);
    setError(null);

    try {
      const res = await axios.get("https://xsendwork.com/api/print-labels", {
        params: { user_id: user.user_id },
      });

      if (res.data?.success) {
        setLabels(res.data.data || []);
        setStep("labels"); // ไปหน้า preview labels
      } else {
        setError(res.data?.message || "สร้าง Label ไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดระหว่างสร้าง Label");
    } finally {
      setLoadingLabels(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="font-thai w-full p-4 bg-gray-100 print:bg-white">
      {/* Header + ปุ่มด้านบน (ซ่อนตอน print) */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h2 className="text-xl font-bold">
          {step === "bills" ? "รายการบิลสำหรับสร้าง Label" : "พิมพ์สติ๊กเกอร์ (Labels)"}
        </h2>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            ผู้ใช้: {user?.first_name || user?.username}
          </span>

          {step === "bills" ? (
            <button
              onClick={handleCreateLabels}
              disabled={!bills.length || loadingLabels}
              className={`px-4 py-2 rounded text-white font-medium ${
                !bills.length || loadingLabels
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingLabels ? "กำลังสร้าง Label..." : "สร้าง Label สำหรับรายการนี้"}
            </button>
          ) : (
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
            <div className="text-center text-gray-600">กำลังโหลดรายการบิล...</div>
          )}
          {!loadingBills && !bills.length && !error && (
            <div className="text-center text-gray-500">
              ยังไม่มีบิลสำหรับสร้าง Label ในวันนี้
            </div>
          )}

          {bills.length > 0 && (
            <div className="overflow-x-auto border border-gray-300 rounded bg-white">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 border">ลำดับ</th>
                    <th className="px-2 py-1 border">เลขที่บาร์โค้ด</th>
                    <th className="px-2 py-1 border">เลขที่บิล</th>
                    <th className="px-2 py-1 border">ลูกค้า</th>
                    <th className="px-2 py-1 border">ผู้รับ</th>
                    <th className="px-2 py-1 border">ที่อยู่</th>
                  </tr>
                </thead>
                <tbody>
                  {bills.map((b, idx) => (
                    <tr
                      key={b.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-2 py-1 border text-center">{idx + 1}</td>
                      <td className="px-2 py-1 border">{b.SERIAL_NO}</td>
                      <td className="px-2 py-1 border">{b.REFERENCE}</td>
                      <td className="px-2 py-1 border">{b.CUSTOMER_NAME}</td>
                      <td className="px-2 py-1 border">{b.RECIPIENT_NAME}</td>
                      <td className="px-2 py-1 border">
                        {b.RECIPIENT_ADDRESS} ต.{b.RECIPIENT_SUBDISTRICT} อ.
                        {b.RECIPIENT_DISTRICT} จ.{b.RECIPIENT_PROVINCE}{" "}
                        {b.RECIPIENT_ZIPCODE}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* STEP 2: Preview Labels + Print (ส่วนนี้จะถูกพิมพ์จริง) */}
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
              <div className="flex flex-col gap-1">
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
              </div>

              {/* ที่อยู่ผู้รับ */}
              <div className="text-[10px] leading-snug mt-1">
                <div className="font-semibold">
                  ผู้รับ: {row.RECIPIENT_NAME || "-"}
                </div>
                <div>ที่อยู่: {row.RECIPIENT_ADDRESS || "-"}</div>
                <div>
                  ต.{row.RECIPIENT_SUBDISTRICT || "-"} อ.{row.RECIPIENT_DISTRICT || "-"} จ.
                  {row.RECIPIENT_PROVINCE || "-"} {row.RECIPIENT_ZIPCODE || ""}
                </div>
              </div>

              {/* QR + text เพิ่มเติม */}
              <div className="flex justify-between items-center mt-1">
                {row.qr_url && (
                  <img
                    src={row.qr_url}
                    alt={`QR_${row.SERIAL_NO}`}
                    style={{ width: "2.2cm", height: "2.2cm" }}
                  />
                )}

                <div className="text-[9px] text-right">
                  <div>Ref: {row.REFERENCE || "-"}</div>
                  <div>SN: {row.SERIAL_NO}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
