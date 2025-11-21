import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import ResizableColumns from "../components/ResizableColumns";
import WarehouseOver4W from "../components/dropdown/WarehouseOver4W";
import { FileDown } from "lucide-react";
import { ExportExcel } from "../utils/ExportExcel";
import OverStatusRadio from "../components/dropdown/OverStatusRadio";

export interface Transaction {
  warehouse_name: string;
  license_plate: string;
  tambon_name: string;
  ampur_name: string;
  time_in: string;
  time_in_over_status_text: string;
  time_in_over_amount_text: string;
  truck_code: string;
  recipient_name: string;
  address: string;
  tel: string;
  receive_code_count: string;
  serial_count: string;
}

const headers = [
  "คลังปัจจุบัน",
  "ทะเบียนรถ",
  "ตำบล",
  "อำเภอ",
  "เวลาส่ง",
  "เกินเวลา",
  "กี่นาที",
  "ใบปิดบรรทุก",
  "ชื่อผู้รับ",
  "ที่อยู่ผู้รับ",
  "เบอร์โทร",
  "รวม (บิล)",
  "รวม (กล่อง)",
];

export default function OntruckV05std() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [selectedOverStatus, setSelectedOverStatus] = useState<
    "not_yet" | "overtime" | "all"
  >("all");
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
        warehouse_id: selectedWarehouseId,
        over_status: selectedOverStatus,
      };

      const res = await AxiosInstance.get("/05std", { params });

      setTransactions(res.data.data || []);
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

  const handleDownload = async () => {
    setLoading(true);
    try {
      await ExportExcel({
        url: "/export05std",
        filename: "Intransit.xlsx",
      });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [selectedWarehouseId, selectedOverStatus]);

  useEffect(() => {
    fetchTransactions();
  }, [page, selectedWarehouseId, selectedOverStatus]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="flex flex-wrap items-center justify-between mb-2">
        <WarehouseOver4W
          selectedWarehouseId={selectedWarehouseId}
          setSelectedWarehouseId={setSelectedWarehouseId}
        />
        <OverStatusRadio onChange={setSelectedOverStatus} />
        <button
          onClick={handleDownload}
          className="h-9 flex-shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          <FileDown />
          <span className="hidden md:inline">Export Excel</span>
        </button>
      </div>
      <div className="overflow-x-auto w-full">
        <h2 className="text-xl font-semibold mt-2">
          กำลังนำจ่าย (เรียงตามเวลาส่งตำบล)
        </h2>
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <ResizableColumns headers={headers} pageKey="intransit" />
          <tbody>
            {transactions.map((t, i) => (
              <tr
                key={crypto.randomUUID()}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-4 py-2 border-b truncate">
                  {t.warehouse_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.license_plate || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.tambon_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.ampur_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.time_in || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.time_in_over_status_text || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate">
                  {t.time_in_over_amount_text || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.truck_code || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.recipient_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.address || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.tel || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.receive_code_count || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.serial_count || "-"}
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

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}
    </div>
  );
}
