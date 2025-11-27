import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

type LabelRow = {
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
  barcode_url: string;
  qr_url: string;
};

export default function PrintLabel() {
  const { user } = useAuth();
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLabels = async () => {
      if (!user?.user_id) return;
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          "https://xsendwork.com/api/print-labels",
          {
            params: { user_id: user.user_id },
          }
        );

        if (res.data?.success) {
          setLabels(res.data.data || []);
        } else {
          setError(res.data?.message || "ดึงข้อมูล label ไม่สำเร็จ");
        }
      } catch (err) {
        console.error(err);
        setError("เกิดข้อผิดพลาดในการดึงข้อมูล label");
      } finally {
        setLoading(false);
      }
    };

    fetchLabels();
  }, [user?.user_id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="font-thai w-full p-4 bg-gray-100 print:bg-white">
      {/* ส่วนหัว + ปุ่ม (จะถูกซ่อนตอนพิมพ์) */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <h2 className="text-xl font-bold">พิมพ์สติ๊กเกอร์ (Labels)</h2>

        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-600">
            ผู้ใช้งาน: {user?.first_name || user?.username}
          </span>
          <button
            onClick={handlePrint}
            disabled={!labels.length}
            className={`px-4 py-2 rounded text-white font-medium ${
              !labels.length
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            พิมพ์
          </button>
        </div>
      </div>

      {/* แสดงสถานะโหลด/ error */}
      {loading && (
        <div className="text-center text-gray-600">กำลังโหลดข้อมูล...</div>
      )}
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}
      {!loading && !error && labels.length === 0 && (
        <div className="text-center text-gray-500">
          ยังไม่มีข้อมูลสำหรับพิมพ์ในวันนี้
        </div>
      )}

      {/* พื้นที่ Preview / Print */}
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
            {/* บรรทัดบน: Barcode + ข้อมูลพื้นฐาน */}
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

              {/* Barcode */}
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

            {/* บรรทัดกลาง: ที่อยู่ผู้รับ */}
            <div className="text-[10px] leading-snug mt-1">
              <div className="font-semibold">
                ผู้รับ: {row.RECIPIENT_NAME || "-"}
              </div>
              <div>
                ที่อยู่: {row.RECIPIENT_ADDRESS || "-"}
              </div>
              <div>
                ต.{row.RECIPIENT_SUBDISTRICT || "-"} อ.
                {row.RECIPIENT_DISTRICT || "-"} จ.
                {row.RECIPIENT_PROVINCE || "-"}{" "}
                {row.RECIPIENT_ZIPCODE || ""}
              </div>
            </div>

            {/* บรรทัดล่าง: QR + ข้อมูลเสริม */}
            <div className="flex justify-between items-center mt-1">
              {/* QR */}
              {row.qr_url && (
                <img
                  src={row.qr_url}
                  alt={`QR_${row.SERIAL_NO}`}
                  style={{ width: "2.2cm", height: "2.2cm" }}
                />
              )}

              {/* Text มุมขวา */}
              <div className="text-[9px] text-right">
                <div>Ref: {row.REFERENCE || "-"}</div>
                <div>SN: {row.SERIAL_NO}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
