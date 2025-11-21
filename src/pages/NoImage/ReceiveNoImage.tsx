import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import AxiosInstance from "../../utils/AxiosInstance";
import ResizableColumns from "../../components/ResizableColumns";
import SearchInput from "../../components/SearchInput";
import WarehouseDropdown from "../../components/dropdown/WarehouseDropdown";
import ExportExcelButton from "../../components/ExportExcelButton";

export interface ReceiveNoImage {
  warehouse_name: string;
  customer_name: string;
  recipient_name: string;
  bill_date: string;
  receive_code: string;
  serial_no: string;
}

const headers = [
  "คลังปลายทาง",
  "เจ้าของงาน",
  "ชื่อผู้รับ",
  "วันที่",
  "เลขที่เอกสาร",
  "เลขที่กล่อง",
];

export default function ReceiveNoImage() {
  const [ReceiveNoImage, setReceiveNoImage] = useState<ReceiveNoImage[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [searchCustomer, setSearchCustomer] = useState<string>("");
  const [searchRecipient, setSearchRecipient] = useState<string>("");
  const limit = 18;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / limit);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const fetchReceiveNoImage = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit,
        searchCustomer,
        searchRecipient,
        to_warehouse_id: selectedWarehouseId,
      };

      const res = await AxiosInstance.get("/noimage", { params });

      setReceiveNoImage(res.data.data || []);
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
  }, [searchCustomer, searchRecipient, selectedWarehouseId]);

  useEffect(() => {
    fetchReceiveNoImage();
  }, [page, searchCustomer, searchRecipient, selectedWarehouseId]);

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="flex justify-between gap-1 items-center mb-1">
        <div className="flex flex-wrap gap-1">
          <WarehouseDropdown
            onChange={(warehouseId) =>
              setSelectedWarehouseId(warehouseId ? Number(warehouseId) : null)
            }
          />
          <SearchInput
            value={searchCustomer}
            onChange={setSearchCustomer}
            placeholder="ค้นหาเจ้าของงาน"
          />
          <SearchInput
            value={searchRecipient}
            onChange={setSearchRecipient}
            placeholder="ค้นหาชื่อผู้รับ"
          />
        </div>
        <div>
          <ExportExcelButton
            url="/export-noimage"
            filename="ReceiveNoImage.xlsx"
            label="Export Excel"
          />
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <ResizableColumns headers={headers} pageKey="ReceiveNoImage" />
          <tbody>
            {ReceiveNoImage.map((t) => (
              <tr key={crypto.randomUUID()}>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.warehouse_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.customer_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.recipient_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.bill_date
                    ? format(new Date(t.bill_date), "dd-MM-yyyy")
                    : "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.receive_code || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.serial_no || "-"}
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
