import { useState, useEffect } from "react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination";
import AxiosInstance from "../utils/AxiosInstance";
import Button from "../components/ui/button/Button";
import { Loader2, 
  // Logs
 } from "lucide-react";
import WarehouseDropdown from "../components/dropdown/WarehouseDropdown";
import CustomerDropdown from "../components/dropdown/CustomerDropdown";
import ResizableColumns from "../components/ResizableColumns";
import ExportExcelButton from "../components/ExportExcelButton";
import SearchInput from "../components/SearchInput";

export interface Transaction {
  id?: number;
  receive_code?: string;
  customer_name?: string;
  recipient_name?: string;
  warehouse_name?: string;
  reference_no?: string;
  receive_business_id?: string;
  to_warehouse_name?: string;
  receive_date?: string;
  delivery_date?: string;
  resend_date?: string;
  status_message?: string;
}

const headers = [
  // "Log",
  "คลังปัจจุบัน",
  "เจ้าของงาน",
  "ชื่อผู้รับ",
  "วันที่บิล",
  "วันที่จัดส่ง",
  "วันที่จัดส่งใหม่",
  "เลขที่บิล",
  "เลขที่อ้างอิง",
  "คลังปลายทาง",
  "สถานะล่าสุด",
];

export default function ProductWarehouse() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  );
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 18;
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const pageCount = Math.ceil(total / limit);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalData, setModalData] = useState<
    Transaction | Transaction[] | null
  >(null);
  const [countWarehouse15, setCountWarehouse15] = useState<number>(0);
  const [countWarehouseNot15, setCountWarehouseNot15] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [newRemark, setNewRemark] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        search,
        warehouse_id: selectedWarehouseId,
        customer_id: selectedCustomerId,
        page,
        limit,
      };

      const res = await AxiosInstance.get("/02", { params });
      const data = res.data.data || [];

      setTransactions(res.data.data || []);
      setTotal(res.data.total || 0);

      if (data.length > 0) {
        setCountWarehouse15(data[0].count_warehouse_15 || 0);
        setCountWarehouseNot15(data[0].count_warehouse_not_15 || 0);
      } else {
        setCountWarehouse15(0);
        setCountWarehouseNot15(0);
      }
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

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  useEffect(() => {
    setPage(1);
  }, [search, selectedWarehouseId, selectedCustomerId]);

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    } else {
      fetchTransactions();
    }
  }, [search, page, pageCount, selectedWarehouseId, selectedCustomerId]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddRemark = async () => {
    if (updateLoading) return;
    if (!newRemark.trim()) return;
    if (
      !modalData ||
      Array.isArray(modalData) ||
      !modalData.receive_business_id
    )
      return;

    setUpdateLoading(true);
    setUpdateError(null);
    try {
      await AxiosInstance.post("/update-remark", {
        in_receive_code: modalData.receive_code,
        in_user_id: String(user?.user_id),
        in_new_remark: newRemark,
      });

      setNewRemark("");

      setModalData((prev) =>
        prev && !Array.isArray(prev) ? { ...prev, remark: newRemark } : prev
      );
      setTransactions((txs) =>
        txs.map((tx) =>
          tx.receive_code === modalData.receive_code
            ? { ...tx, remark: newRemark }
            : tx
        )
      );
    } catch (err) {
      setUpdateError((err as Error).message);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className={`font-thai w-full ${loading ? "cursor-wait" : ""}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-wrap items-center gap-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ค้นหา Do หรือ Ref"
          />
          <WarehouseDropdown
            onChange={(warehouseId) => setSelectedWarehouseId(warehouseId)}
          />
          <CustomerDropdown
            onChange={(customerId) => setSelectedCustomerId(customerId)}
          />
          <div className="flex gap-3">
            <div>
              กรุงเทพ <strong>{countWarehouse15}</strong>
            </div>
            <div>
              ต่างจังหวัด <strong>{countWarehouseNot15}</strong>
            </div>
            <span className="">
              {currentTime.toLocaleString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
          </div>
        </div>
        <ExportExcelButton
          url="/export02"
          filename="Product_Warehouse.xlsx"
          label="Export Excel"
        />
      </div>

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto w-full">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <ResizableColumns headers={headers} pageKey="ProductWarehouse" />
          <tbody>
            {transactions.map((t, i) => {
              return (
                <tr
                  key={t.id ?? i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {/* log modal เดิม */}
                  {/* <td className="px-4 py-1 border-b truncate">
                    <button
                      className="inline-flex gap-1 px-1.5 py-1 rounded text-xs bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                      onClick={async () => {
                        if (updateLoading) return;
                        setIsModalOpen(true);
                        setModalData(t);
                      }}
                    >
                      <Logs size={23} />
                    </button>
                  </td> */}
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.warehouse_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.customer_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.recipient_name || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.receive_date
                      ? format(new Date(t.receive_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td className="px-4 py-2  border-b truncate">
                    {t.delivery_date
                      ? format(new Date(t.delivery_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td className="px-4 py-2  border-b truncate">
                    {t.resend_date
                      ? format(new Date(t.resend_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.receive_code || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.reference_no || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.to_warehouse_name}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
                    {t.status_message || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* modal log */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-100000 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          onClick={() => {
            if (updateLoading) return;
            closeModal();
          }}
        >
          <div
            className="bg-white p-6 rounded shadow-lg w-full max-h-[90vh] lg:max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base">
                เพิ่มหมายเหตุ
                {modalData &&
                  !Array.isArray(modalData) &&
                  (modalData.receive_code || modalData.id) && (
                    <span className="ml-2 text-base text-gray-600 font-normal">
                      {modalData.receive_code ||
                        modalData.receive_business_id ||
                        modalData.id}
                    </span>
                  )}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-900"
                onClick={() => {
                  if (updateLoading) return;
                  closeModal();
                }}
                disabled={updateLoading}
              >
                ×
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                className="border px-2 py-1 rounded-md w-full focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                value={newRemark}
                onChange={(e) => setNewRemark(e.target.value)}
                placeholder="กรอกหมายเหตุใหม่"
                disabled={updateLoading}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddRemark}
                disabled={updateLoading || !newRemark.trim()}
                className="h-9 flex-shrink-0"
              >
                {updateLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  "เพิ่ม"
                )}
              </Button>
            </div>

            {updateLoading && (
              <div className="text-brand-500 py-2">กำลังบันทึกหมายเหตุ...</div>
            )}
            {updateError && (
              <div className="text-red-500 text-sm">{updateError}</div>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center mt-4">
          <div className="loader"></div>
        </div>
      )}
      {error && <div className="text-red-600 text-center mt-4">{error}</div>}

      <Pagination
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        disabled={loading}
      />
    </div>
  );
}
