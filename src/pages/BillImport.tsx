import { useState, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import ResizableColumns from "../components/ResizableColumns";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";

type ImportRow = {
  NO_BILL: string;
  REFERENCE: string;
  SEND_DATE: string;
  CUSTOMER_NAME: string;
  RECIPIENT_CODE: string;
  RECIPIENT_NAME: string;
  RECIPIENT_TEL: string;
  RECIPIENT_ADDRESS: string;
  RECIPIENT_SUBDISTRICT: string;
  RECIPIENT_DISTRICT: string;
  RECIPIENT_PROVINCE: string;
  RECIPIENT_ZIPCODE: string;
  SERIAL_NO: string;
};

const headers = [
  "ลำดับ",
  "จัดการ",
  "NO_BILL",
  "SERIAL_NO",
  "REFERENCE",
  "SEND_DATE",
  "CUSTOMER_NAME",
  "RECIPIENT_CODE",
  "RECIPIENT_NAME",
  "RECIPIENT_TEL",
  "RECIPIENT_ADDRESS",
  "RECIPIENT_SUBDISTRICT",
  "RECIPIENT_DISTRICT",
  "RECIPIENT_PROVINCE",
  "RECIPIENT_ZIPCODE",
];

export default function BillImport() {
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
      const res = await axios.post("https://xsendwork.com/api/import-bills", {
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

  const excelDateToJSDate = (serial: number): Date | null => {
    if (!serial || isNaN(serial)) return null;
    return new Date((serial - 25569) * 86400 * 1000);
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
            นำเข้าข้อมูลบิลจาก Excel
          </h2>
          {/* <p className=" text-slate-500">
            อัปโหลดไฟล์ Excel เพื่อนำเข้าข้อมูลบิลเข้าสู่ระบบ
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
                <span className="text-blue-700 font-medium">เลือกไฟล์</span>
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
                    มี SERIAL_NO ซ้ำในไฟล์
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
                pageKey="bill-import"
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

                    {/* NO_BILL */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.NO_BILL || "-"}
                    </td>

                    {/* SERIAL_NO (เช็คซ้ำ) */}
                    <td
                      className={
                        "px-2 py-1.5 border-b border-slate-200  truncate font-mono " +
                        (duplicates[row.SERIAL_NO] > 1
                          ? "text-red-600 font-semibold"
                          : "text-slate-800")
                      }
                    >
                      {row.SERIAL_NO || "-"}
                    </td>

                    {/* REFERENCE */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.REFERENCE || "-"}
                    </td>

                    {/* SEND_DATE แปลงเป็น dd/MM/yyyy */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.SEND_DATE && excelDateToJSDate(Number(row.SEND_DATE))
                        ? format(
                            excelDateToJSDate(Number(row.SEND_DATE))!,
                            "dd/MM/yyyy"
                          )
                        : "-"}
                    </td>

                    {/* CUSTOMER_NAME */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.CUSTOMER_NAME || "-"}
                    </td>

                    {/* RECIPIENT_CODE */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.RECIPIENT_CODE || "-"}
                    </td>

                    {/* RECIPIENT_NAME */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate max-w-[220px] ">
                      {row.RECIPIENT_NAME || "-"}
                    </td>

                    {/* RECIPIENT_TEL */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.RECIPIENT_TEL || "-"}
                    </td>

                    {/* RECIPIENT_ADDRESS */}
                    <td className="px-2 py-1.5 border-b border-slate-200 truncate max-w-[220px]">
                      {row.RECIPIENT_ADDRESS || "-"}
                    </td>

                    {/* RECIPIENT_SUBDISTRICT */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.RECIPIENT_SUBDISTRICT || "-"}
                    </td>

                    {/* RECIPIENT_DISTRICT */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.RECIPIENT_DISTRICT || "-"}
                    </td>

                    {/* RECIPIENT_PROVINCE */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.RECIPIENT_PROVINCE || "-"}
                    </td>

                    {/* RECIPIENT_ZIPCODE */}
                    <td className="px-2 py-1.5 border-b border-slate-200  truncate">
                      {row.RECIPIENT_ZIPCODE || "-"}
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
