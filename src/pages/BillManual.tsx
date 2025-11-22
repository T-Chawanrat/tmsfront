import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ResizableColumns from "../components/ResizableColumns";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { useAuth } from "../context/AuthContext";
import CustomerDropdown from "../components/dropdown/CustomerDropdown";
import AddressDropdown from "../components/AddressDropdown";

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

type ZipAddressRow = {
  id: number;
  tambon_id: number;
  tambon_name_th: string;
  ampur_id: number;
  ampur_name_th: string;
  province_id: number;
  province_name_th: string;
  zip_code: string;
  warehouse_id: number;
  warehouse_code: string;
  warehouse_name: string;
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
  const [addressOptions, setAddressOptions] = useState<ZipAddressRow[]>([]);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [activeField, setActiveField] = useState<keyof ImportRow | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const { user } = useAuth();

  const handleChangeField = (field: keyof ImportRow, value: string) => {
    setFormRow((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // พิมพ์ในช่องตำบล/อำเภอ/จังหวัด/รหัสไปรษณีย์ ช่องไหนก็ได้
  const handleAddressInputChange = async (
    field: keyof ImportRow,
    value: string
  ) => {
    // อัปเดตค่าฟอร์มตามปกติ
    handleChangeField(field, value);

    const keyword = value.trim();

    // ถ้าน้อยกว่า 2 ตัว ไม่ต้องค้น
    if (!keyword || keyword.length < 2) {
      setAddressOptions([]);
      return;
    }

    try {
      setLoadingAddress(true);

      const res = await axios.get("https://xsendwork.com/api/address-search", {
        params: { keyword },
      });

      const data: ZipAddressRow[] = res.data.data || [];
      setAddressOptions(data);
    } catch (err) {
      console.error("Error fetching address search:", err);
      setAddressOptions([]);
    } finally {
      setLoadingAddress(false);
    }
  };

  // เวลาเลือกจากลิสต์ autocomplete → เติมครบ 4 ช่อง
  const handleSelectAddress = (row: ZipAddressRow) => {
    handleChangeField("RECIPIENT_SUBDISTRICT", row.tambon_name_th);
    handleChangeField("RECIPIENT_DISTRICT", row.ampur_name_th);
    handleChangeField("RECIPIENT_PROVINCE", row.province_name_th);
    handleChangeField("RECIPIENT_ZIPCODE", row.zip_code);

    // ปิด dropdown
    setAddressOptions([]);
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
      nextRows = [...rows, formRow];
    } else {
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
    setFormRow(row);
    setEditingIndex(null);
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!dropdownRef.current) return;

      if (!dropdownRef.current.contains(event.target as Node)) {
        // คลิกนอกบริเวณ 4 ช่อง + dropdown → ปิด
        setAddressOptions([]);
        setActiveField(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`font-thai w-full p-4 ${saving ? "cursor-wait" : ""}`}>
      <h2 className="text-xl font-bold mb-4">คีย์ Bills</h2>

      <div className="mb-4 border border-gray-200 rounded p-3 bg-white space-y-2">
        <div
          ref={dropdownRef}
          className="grid grid-cols-1 md:grid-cols-6 gap-3"
        >
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
            <CustomerDropdown
              onChange={(customer) => {
                handleChangeField(
                  "CUSTOMER_NAME",
                  customer?.customer_name || ""
                );
              }}
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
          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              ตำบล (RECIPIENT_SUBDISTRICT)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_SUBDISTRICT}
              onChange={(e) =>
                handleAddressInputChange(
                  "RECIPIENT_SUBDISTRICT",
                  e.target.value
                )
              }
              onFocus={() => setActiveField("RECIPIENT_SUBDISTRICT")}
              className="w-full border rounded px-2 py-1 text-sm"
            />

            {activeField === "RECIPIENT_SUBDISTRICT" &&
              addressOptions.length > 0 && (
                <AddressDropdown
                  addressOptions={addressOptions}
                  loading={loadingAddress}
                  onSelect={handleSelectAddress}
                />
              )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              อำเภอ (RECIPIENT_DISTRICT)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_DISTRICT}
              onChange={(e) =>
                handleAddressInputChange("RECIPIENT_DISTRICT", e.target.value)
              }
              onFocus={() => setActiveField("RECIPIENT_DISTRICT")}
              className="w-full border rounded px-2 py-1 text-sm"
            />
            {activeField === "RECIPIENT_DISTRICT" &&
              addressOptions.length > 0 && (
                <AddressDropdown
                  addressOptions={addressOptions}
                  loading={loadingAddress}
                  onSelect={handleSelectAddress}
                />
              )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              จังหวัด (RECIPIENT_PROVINCE)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_PROVINCE}
              onChange={(e) =>
                handleAddressInputChange("RECIPIENT_PROVINCE", e.target.value)
              }
              onFocus={() => setActiveField("RECIPIENT_PROVINCE")}
              className="w-full border rounded px-2 py-1 text-sm"
            />
            {activeField === "RECIPIENT_PROVINCE" &&
              addressOptions.length > 0 && (
                <AddressDropdown
                  addressOptions={addressOptions}
                  loading={loadingAddress}
                  onSelect={handleSelectAddress}
                />
              )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">
              รหัสไปรษณีย์ (RECIPIENT_ZIPCODE)
            </label>
            <input
              type="text"
              value={formRow.RECIPIENT_ZIPCODE}
              onChange={(e) =>
                handleAddressInputChange("RECIPIENT_ZIPCODE", e.target.value)
              }
              onFocus={() => setActiveField("RECIPIENT_ZIPCODE")}
              className="w-full border rounded px-2 py-1 text-sm"
            />

            {activeField === "RECIPIENT_ZIPCODE" &&
              addressOptions.length > 0 && (
                <AddressDropdown
                  addressOptions={addressOptions}
                  loading={loadingAddress}
                  onSelect={handleSelectAddress}
                />
              )}
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
