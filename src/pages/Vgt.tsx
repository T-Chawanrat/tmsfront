import { useState, useEffect, useRef } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import ResizableColumns from "../components/ResizableColumns";
import { format } from "date-fns";
import { ChevronDownIcon, FileDown } from "lucide-react";
import { ExportExcel } from "../utils/ExportExcel";

export interface Vgt {
  row_no: number;
  vgt_reference: string;
  DO_TT: string;
  BOX: string;
  BOOKING_NO: string;
  sender_name: string;
  from_dc: string;
  from_province: string;
  recipient_name: string;
  recipient_province: string;
  to_dc: string;
  license_plate: string;
  pickup_staff_first_name: string;
  pickup_staff_last_name: string;
  phone_number: string;
  status_message: string;
  tt_status_date: string;
  tt_status_time: string;
  date_time_report: string;
  books_is_deleted_text: string;
  receives_is_deleted_text: string;
  book_status_th: string;
}

const headers = [
  "ลำดับ",
  "อ้างอิง VGT",
  "DO TT",
  "Box",
  "Booking No",
  "ชื่อผู้ส่ง",
  "DC ต้นทาง",
  "จังหวัดต้นทาง",
  "ชื่อผู้รับ",
  "จังหวัดผู้รับ",
  "DC ต้นปลายทาง",
  "ทะเบียนรถ",
  "ชื่อพนักงานเข้ารับ",
  "นามสกุลพนักงานเข้ารับ",
  "เบอร์โทร ",
  "สถานะ",
  "วันที่สถานะ",
  "เวลาสถานะ",
  "วันที่รายงาน",
  "ใบจองรถ",
  "ใบส่งสินค้า",
  "สถานะใบจองรถ",
];

export default function Vgt() {
  const [vtg, setVtg] = useState<Vgt[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [bookStatus, setBookStatus] = useState<"READY" | "PENDING">("READY");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 20;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / limit);

  const fetchVtg = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        book_status: bookStatus,
      };

      const res = await AxiosInstance.get("/vgt", { params });

      setVtg(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err?.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  };

  if (typeof window !== "undefined") {
    window.addEventListener("mousedown", handleClickOutside);
  }

  const handleDownload = async () => {
    setLoading(true);
    try {
      await ExportExcel({
        url: "/export-vgt",
        filename: "Vgt.xlsx",
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [bookStatus]);

  useEffect(() => {
    fetchVtg();
  }, [page, bookStatus]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="overflow-x-auto w-full">
        <div className="flex justify-between gap-1 mb-1">
          <div className="relative inline-block w-55" ref={dropdownRef}>
            {/* Button */}
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center justify-between w-full h-9 px-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none"
            >
              {bookStatus === "READY"
                ? "สร้างใบจองรถ เข้ารับสินค้า"
                : "อยู่ระหว่างเข้ารับสินค้า"}
              <ChevronDownIcon className="h-5 w-5 text-gray-500 ml-2" />
            </button>

            {/* Dropdown List */}
            {open && (
              <ul className="absolute z-10 w-full mt-1 max-h-40 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                <li
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                    bookStatus === "READY" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    setBookStatus("READY");
                    setOpen(false);
                  }}
                >
                  สร้างใบจองรถ เข้ารับสินค้า
                </li>
                <li
                  className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                    bookStatus === "PENDING" ? "bg-gray-100" : ""
                  }`}
                  onClick={() => {
                    setBookStatus("PENDING");
                    setOpen(false);
                  }}
                >
                  อยู่ระหว่างเข้ารับสินค้า
                </li>
              </ul>
            )}
          </div>
          <div>
            <button
              onClick={handleDownload}
              className="h-9 flex-shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <FileDown />
              <span className="hidden md:inline">Export Excel</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
            <ResizableColumns headers={headers} pageKey="vgt" />
            <tbody>
              {vtg.map((t, i) => (
                <tr
                  key={crypto.randomUUID()}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.row_no ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.vgt_reference ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.DO_TT ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.BOX ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.BOOKING_NO ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.sender_name ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.from_dc ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.from_province ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.recipient_name ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.recipient_province ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.to_dc ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.license_plate ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.pickup_staff_first_name ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.pickup_staff_last_name ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.phone_number ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.status_message ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.tt_status_date
                      ? format(new Date(t.tt_status_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.tt_status_time ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {" "}
                    {t.date_time_report
                      ? format(
                          new Date(t.date_time_report),
                          "dd-MM-yyyy | HH:mm"
                        )
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.books_is_deleted_text ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.receives_is_deleted_text ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.book_status_th ?? "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          disabled={loading}
        />
      </div>

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
    </div>
  );
}
