import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import ResizableColumns from "../components/ResizableColumns";
import { format } from "date-fns";
import WarehouseDropdown from "../components/dropdown/WarehouseDropdown";
import ExportExcelButton from "../components/ExportExcelButton";
import SearchInput from "../components/SearchInput";

export interface Bookings {
  create_date: string;
  book_code: string;
  book_date: string;
  book_time: string;
  book_status_th: string;
  customer_name: string;
  receive_code: string;
  serial_count: number;
  shipper_name: string;
  recipient_name: string;
  address: string;
  tambon_name: string;
  ampur_name: string;
  province_name: string;
  zip_code: string;
  tel: string;
  remark: string;
  license_plate: string | null;
  status_message: string;
  last_status_at: string;
  warehouse_id: string;
  warehouse_name: string;
}

const headers = [
  "คลังต้นทาง",
  "เจ้าของงาน",
  "วันที่สร้าง",
  "เลขที่ใบจองรถ",
  "วันที่จองรถ",
  "เวลาที่จองรถ",
  "สถานะการจองรถ",
  "เลขที่เอกสาร",
  "จำนวนสินค้า",
  "ชื่อผู้ส่ง",
  "ชื่อผู้รับ",
  "ที่อยู่",
  "ตำบล",
  "อำเภอ",
  "จังหวัด",
  "รหัสไปรษณีย์",
  "เบอร์โทร",
  "หมายเหตุ",
  "ทะเบียนรถ",
  "สถานะสินค้า",
  "เวลาสถานะล่าสุด",
];

export default function Bookings() {
  const [bookings, setBookings] = useState<Bookings[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 20;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / limit);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        search,
        warehouse_id: selectedWarehouseId,
      };

      const res = await AxiosInstance.get("/bookings", { params });

      setBookings(res.data.data || []);
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
  useEffect(() => {
    setPage(1);
  }, [search, selectedWarehouseId]);

  useEffect(() => {
    fetchTransactions();
  }, [page, search, selectedWarehouseId]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="overflow-x-auto w-full">
        <div className="flex justify-between mt-1 mb-1">
          <div className="flex mb-1 gap-1">
            <WarehouseDropdown
              onChange={(warehouseId) => setSelectedWarehouseId(warehouseId)}
            />
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="ค้นหา Do"
            />
          </div>
          <div>
            <ExportExcelButton
              url="/export-bookings"
              filename="Bookings.xlsx"
              label="Export Excel"
            />
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
            <ResizableColumns headers={headers} pageKey="bookings" />
            <tbody>
              {bookings.map((t, i) => (
                <tr
                  key={crypto.randomUUID()}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.warehouse_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.customer_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.create_date
                      ? format(new Date(t.create_date), "dd-MM-yyyy | HH:mm")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.book_code || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.book_date
                      ? format(new Date(t.book_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.book_time || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.book_status_th || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.receive_code || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.serial_count || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.shipper_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.recipient_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.address || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.tambon_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.ampur_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.province_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.zip_code || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.tel || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.remark || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.license_plate || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.status_message || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.last_status_at
                      ? format(new Date(t.last_status_at), "dd-MM-yyyy | HH:mm")
                      : "-"}
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
