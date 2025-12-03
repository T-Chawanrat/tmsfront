import { useState, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
// import AxiosInstance from "../utils/AxiosInstance";
// import { useAuth } from "../context/AuthContext";
// import { useNavigate } from "react-router-dom";
import ResizableColumns from "../components/ResizableColumns";
import { useAuth } from "../context/AuthContext";

type ImportRow = {
  NO_BILL: string | null;
  SEND_DATE: string | null;
  SERIAL_NO: string;
  REFERENCE: string;
  CUSTOMER_NAME: string;
  RECIPIENT_CODE: string;
  RECIPIENT_NAME: string;
  RECIPIENT_TEL: null;
  RECIPIENT_ADDRESS: null;
  RECIPIENT_SUBDISTRICT: string;
  RECIPIENT_DISTRICT: string;
  RECIPIENT_PROVINCE: string;
  RECIPIENT_ZIPCODE: null;
  TO_DC?: string;
};

const headers = [
  "ลำดับ",
  "จัดการ",
  "เลขที่บาร์โค้ด",
  "เลขที่บิล",
  "รหัสอ้างอิง",
  "ผู้รับ",
  "ตำบล",
  "อำเภอ",
  "จังหวัด",
  "DCปลายทาง",
];

export default function BillImportVGT() {
  const [fileName, setFileName] = useState<string>("");
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<Record<string, number>>({});
  const { user } = useAuth();

  // const { isLoggedIn } = useAuth();
  // const navigate = useNavigate();

  // useEffect(() => {
  //   if (!isLoggedIn) {
  //     navigate("/signin", { replace: true });
  //   }
  // }, [isLoggedIn, navigate]);

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

        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
          }
        );

        const mapped: ImportRow[] = rawRows.map((r) => ({
          NO_BILL: null,
          SEND_DATE: null,
          RECIPIENT_TEL: null,
          RECIPIENT_ADDRESS: null,
          RECIPIENT_ZIPCODE: null,
          SERIAL_NO: (r["เลขที่บาร์โค้ด"] || "").toString().trim(),
          REFERENCE: (r["เลขที่บิล"] || "").toString().trim(),
          CUSTOMER_NAME: "VGT",
          RECIPIENT_CODE: (r["รหัสอ้างอิง"] || "").toString().trim(),
          RECIPIENT_NAME: (r["ผู้รับ"] || "").toString().trim(),
          RECIPIENT_SUBDISTRICT: (r["ตำบล"] || "").toString().trim(),
          RECIPIENT_DISTRICT: (r["อำเภอ"] || "").toString().trim(),
          RECIPIENT_PROVINCE: (r["จังหวัด"] || "").toString().trim(),
          TO_DC: (r["DCปลายทาง"] || "").toString().trim(),
        }));

        console.log("rawRows[0] =", rawRows[0]);
        console.log("mapped[0] =", mapped[0]);

        setRows(mapped);
        setDuplicates(findDuplicates(mapped));
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
      const res = await axios.post("https://xsendwork.com/api/import-vgt", {
        rows,
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
      if (!r.SERIAL_NO) return;
      count[r.SERIAL_NO] = (count[r.SERIAL_NO] || 0) + 1;
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
      className={`font-thai w-full p-4 ${
        loading || saving ? "cursor-wait" : ""
      }`}
    >
      <h2 className="text-xl font-bold mb-4">นำเข้า Excel (Bills VGT)</h2>

      {/* ส่วนอัปโหลดไฟล์ */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <label className="inline-flex items-center">
          <span className="mr-2 font-medium">เลือกไฟล์ Excel:</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block border border-gray-300 rounded px-2 py-1 "
          />
        </label>
        {fileName && (
          <span className="text-sm text-gray-600">ไฟล์: {fileName}</span>
        )}

        {/* ปุ่มบันทึก */}
        <div className="mb-4 flex gap-2 justify-end flex-grow">
          {rows.length > 0 && (
            <span className="text-sm mt-2 text-gray-600">
              พบข้อมูล {rows.length.toLocaleString()} แถว
            </span>
          )}

          <button
            onClick={handleSave}
            disabled={!rows.length || saving}
            className={`px-4 py-2 rounded text-white font-medium ${
              !rows.length || saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>

      {/* แสดง error / success */}
      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
          {success}
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto max-h-[80vh] w-full border border-gray-300 rounded">
        {!rows.length && !loading && (
          <div className="p-4 text-center text-gray-500">
            ยังไม่มีข้อมูล แสดงตัวอย่าง กรุณาเลือกไฟล์ Excel
          </div>
        )}

        {rows.length > 0 && (
          <table className="w-sm table-fixed border-collapse">
            <ResizableColumns
              headers={headers}
              pageKey="import-vgt"
              minWidths={{
                0: 60,
                1: 40,
              }}
            />
            <thead className="bg-gray-100"></thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-1 border-b text-sm bg-gray-100 font-semibold text-center sticky left-0 z-10">
                    {idx + 1}
                  </td>

                  <td className="px-3 py-1 border-b text-center text-sm whitespace-nowrap min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      ลบ
                    </button>
                  </td>

                  <td
                    className={
                      "px-3 py-1 border-b text-sm truncate " +
                      (duplicates[row.SERIAL_NO] > 1
                        ? "text-red-500 font-bold"
                        : "")
                    }
                  >
                    {row.SERIAL_NO || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.REFERENCE || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_CODE || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_NAME || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_SUBDISTRICT || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_DISTRICT || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_PROVINCE || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.TO_DC || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
}
