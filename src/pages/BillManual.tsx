import { useState } from "react";
import axios from "axios";
import ResizableColumns from "../components/ResizableColumns";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
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
  "REFERENCE",
  "SEND_DATE",
  "รหัสผู้ส่ง",
  "รหัสผู้รับ",
  "ชื่อผู้รับ",
  "เบอร์โทร",
  "ที่อยู่",
  "ตำบล",
  "อำเภอ",
  "จังหวัด",
  "รหัสไปรษณีย์",
  "SERIAL_NO",
];

const emptyRow: ImportRow = {
  NO_BILL: "",
  REFERENCE: "",
  SEND_DATE: "",
  CUSTOMER_NAME: "",
  RECIPIENT_CODE: "",
  RECIPIENT_NAME: "",
  RECIPIENT_TEL: "",
  RECIPIENT_ADDRESS: "",
  RECIPIENT_SUBDISTRICT: "",
  RECIPIENT_DISTRICT: "",
  RECIPIENT_PROVINCE: "",
  RECIPIENT_ZIPCODE: "",
  SERIAL_NO: "",
};

const requiredFields: (keyof ImportRow)[] = [
  "NO_BILL",
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
  "SERIAL_NO",
];

export default function BillManual() {
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [formRow, setFormRow] = useState<ImportRow>(emptyRow);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user } = useAuth();

  const handleChangeField = (field: keyof ImportRow, value: string) => {
    setFormRow((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddOrUpdateRow = () => {
    setError(null);
    setSuccess(null);

    const missingFields = requiredFields.filter((field) => {
      const value = (formRow[field] ?? "").toString().trim();
      return value === "";
    });

    if (missingFields.length > 0) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    let nextRows: ImportRow[] = [];

    if (editingIndex === null) {
      // เพิ่มใหม่
      nextRows = [...rows, formRow];
    } else {
      // แก้ไขรายการเดิม
      nextRows = [...rows];
      nextRows[editingIndex] = formRow;
    }

    setRows(nextRows);
    setFormRow(emptyRow);
    setEditingIndex(null);
  };

  const handleEditRow = (index: number) => {
    setFormRow(rows[index]);
    setEditingIndex(index);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteRow = (index: number) => {
    const nextRows = rows.filter((_, i) => i !== index);
    setRows(nextRows);
    setError(null);
    setSuccess(null);

    if (editingIndex === index) {
      setFormRow(emptyRow);
      setEditingIndex(null);
    }
  };

  const handleCopyRow = (index: number) => {
    const row = rows[index];
    setFormRow(row); // เอาข้อมูลมาใส่ฟอร์ม
    setEditingIndex(null); // ให้เป็นโหมด "เพิ่มใหม่" ไม่ใช่แก้แถวเดิม
    setError(null);
    setSuccess(null);
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
        ...r,
        SEND_DATE: r.SEND_DATE || "",
      }));

      const res = await axios.post("https://xsendwork.com/api/import-bills", {
        rows: payloadRows,
        user_id: user?.user_id,
        type: "INPUT",
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

  return (
    <div className={`font-thai w-full p-4 ${saving ? "cursor-wait" : ""}`}>
      <h2 className="text-xl font-bold mb-4">คีย์ Bills</h2>

      {/* ฟอร์มกรอก 1 แถว */}
      <div className="mb-4 border border-gray-200 rounded p-3 bg-white space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">NO_BILL</label>
            <input
              type="text"
              value={formRow.NO_BILL}
              onChange={(e) => handleChangeField("NO_BILL", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">REFERENCE</label>
            <input
              type="text"
              value={formRow.REFERENCE}
              onChange={(e) => handleChangeField("REFERENCE", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SEND_DATE</label>
            <DatePicker
              selected={formRow.SEND_DATE ? new Date(formRow.SEND_DATE) : null}
              onChange={(date: Date | null) => {
                const iso = date ? format(date, "yyyy-MM-dd") : "";
                handleChangeField("SEND_DATE", iso);
              }}
              dateFormat="dd/MM/yyyy"
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อลูกค้า (CUSTOMER_NAME)
            </label>
            <input
              type="text"
              value={formRow.CUSTOMER_NAME}
              onChange={(e) =>
                handleChangeField("CUSTOMER_NAME", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              รหัสผู้รับ (RECIPIENT_CODE)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_CODE}
              onChange={(e) =>
                handleChangeField("RECIPIENT_CODE", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ชื่อผู้รับ (RECIPIENT_NAME)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_NAME}
              onChange={(e) =>
                handleChangeField("RECIPIENT_NAME", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              เบอร์โทร (RECIPIENT_TEL)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_TEL}
              onChange={(e) =>
                handleChangeField("RECIPIENT_TEL", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              ที่อยู่ (RECIPIENT_ADDRESS)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_ADDRESS}
              onChange={(e) =>
                handleChangeField("RECIPIENT_ADDRESS", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              ตำบล (RECIPIENT_SUBDISTRICT)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_SUBDISTRICT}
              onChange={(e) =>
                handleChangeField("RECIPIENT_SUBDISTRICT", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              อำเภอ (RECIPIENT_DISTRICT)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_DISTRICT}
              onChange={(e) =>
                handleChangeField("RECIPIENT_DISTRICT", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              จังหวัด (RECIPIENT_PROVINCE)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_PROVINCE}
              onChange={(e) =>
                handleChangeField("RECIPIENT_PROVINCE", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              รหัสไปรษณีย์ (RECIPIENT_ZIPCODE)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_ZIPCODE}
              onChange={(e) =>
                handleChangeField("RECIPIENT_ZIPCODE", e.target.value)
              }
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SERIAL_NO</label>
            <input
              type="text"
              value={formRow.SERIAL_NO}
              onChange={(e) => handleChangeField("SERIAL_NO", e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2 justify-end">
          {editingIndex !== null && (
            <button
              type="button"
              onClick={() => {
                setFormRow(emptyRow);
                setEditingIndex(null);
              }}
              className="px-4 py-2 rounded bg-gray-300 text-sm"
            >
              ยกเลิกแก้ไข
            </button>
          )}
          <button
            type="button"
            onClick={handleAddOrUpdateRow}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
          >
            {editingIndex === null ? "เพิ่มรายการ" : "บันทึกการแก้ไข"}
          </button>
        </div>
      </div>

      {/* ปุ่มบันทึกทั้งหมด */}
      <div className="mb-4 flex justify-between items-center">
        {rows.length > 0 && (
          <span className="text-sm text-gray-600">
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

      {/* error / success */}
      {error && (
        <div className="mb-4 text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">
          {success}
        </div>
      )}

      {/* Preview Table */}
      <div className="overflow-x-auto overflow-y-auto max-h-[70vh] w-full border border-gray-300 rounded">
        {!rows.length && (
          <div className="p-4 text-center text-gray-500">
            ยังไม่มีข้อมูลในตาราง กรุณาเพิ่มรายการจากฟอร์มด้านบน
          </div>
        )}

        {rows.length > 0 && (
          <table className="w-full table-fixed border-collapse">
            <ResizableColumns headers={headers} pageKey="bill-manual" />
            <thead className="bg-gray-100" />
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-3 py-1 border-b text-sm bg-gray-100 font-semibold text-center sticky left-0 z-10">
                    {idx + 1}
                  </td>

                  <td className="px-3 py-1 border-b text-sm whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleEditRow(idx)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded mr-2"
                    >
                      แก้ไข
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyRow(idx)}
                      className="px-2 py-1 text-xs bg-yellow-500 text-white rounded mr-2"
                    >
                      คัดลอก
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRow(idx)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded"
                    >
                      ลบ
                    </button>
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.NO_BILL || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.REFERENCE || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.SEND_DATE
                      ? format(new Date(row.SEND_DATE), "dd/MM/yyyy")
                      : "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.CUSTOMER_NAME || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_CODE || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_NAME || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_TEL || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.RECIPIENT_ADDRESS || "-"}
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
                    {row.RECIPIENT_ZIPCODE || "-"}
                  </td>
                  <td className="px-3 py-1 border-b text-sm truncate">
                    {row.SERIAL_NO || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
