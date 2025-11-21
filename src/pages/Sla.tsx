import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import ResizableColumns from "../components/ResizableColumns";
import { format } from "date-fns";
import SearchInput from "../components/SearchInput";
import ExportExcelButton from "../components/ExportExcelButton";

export interface Transaction {
  tambon_id: string;
  zip_code: string;
  tambon: string;
  ampur: string;
  province: string;
  warehouse_name: string;
  Monday: string;
  Tuesday: string;
  Wednesday: string;
  Thursday: string;
  Friday: string;
  Saturday: string;
  Sunday: string;
  route_code: string;
  route_name: string;
  DC_Mapping: string;
  lastupdate: string;
}

const headers = [
  "รหัส",
  "รหัสไปรษณีย์",
  "ตำบล",
  "อำเภอ",
  "จังหวัด",
  "คลัง",
  "วันจันทร์",
  "วันอังคาร",
  "วันพุธ",
  "วันพฤหัสบดี",
  "วันศุกร์",
  "วันเสาร์",
  "วันอาทิตย์",
  "รหัสสายรถ",
  "ชื่อสายรถ",
  "พื้นที่รับผิดชอบ",
  "อัปเดตล่าสุด",
];

export default function Sla() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 20;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTambon, setSearchTambon] = useState<string>("");
  const [searchAmpur, setSearchAmpur] = useState<string>("");
  const [searchProvince, setSearchProvince] = useState<string>("");
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
        search_tambon: searchTambon,
        search_ampur: searchAmpur,
        search_province: searchProvince,
      };

      const res = await AxiosInstance.get("/sla", { params });

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

  useEffect(() => {
    setPage(1);
  }, [searchTambon, searchAmpur, searchProvince]);

  useEffect(() => {
    fetchTransactions();
  }, [page, searchTambon, searchAmpur, searchProvince]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="overflow-x-auto w-full">
        <div className="flex justify-between gap-1 mt-1 mb-1">
          <div className="flex gap-1">
            <SearchInput
              value={searchTambon}
              onChange={setSearchTambon}
              placeholder="ค้นหาตำบล"
            />
            <SearchInput
              value={searchAmpur}
              onChange={setSearchAmpur}
              placeholder="ค้นหาอำเภอ"
            />
            <SearchInput
              value={searchProvince}
              onChange={setSearchProvince}
              placeholder="ค้นหาจังหวัด"
            />
          </div>
          <div>
            <ExportExcelButton
              url="/export-sla"
              filename="SLA.xlsx"
              label="Export Excel"
            />
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
            <ResizableColumns headers={headers} pageKey="sla" />
            <tbody>
              {transactions.map((t, i) => (
                <tr
                  key={crypto.randomUUID()}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.tambon_id || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.zip_code || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.tambon || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.ampur || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.province || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.warehouse_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.Monday || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.Tuesday || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.Wednesday || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.Thursday || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.Friday || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.Saturday || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.Sunday || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.route_code || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.route_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.DC_Mapping || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.lastupdate
                      ? format(new Date(t.lastupdate), "dd-MM-yyyy | HH:mm")
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
