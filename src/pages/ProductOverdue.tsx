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
import CustomerDropdown from "../components/dropdown/CustomerDropdown";
import HasResendDropdown from "../components/dropdown/HasResendDropdown";
import ResizableColumns from "../components/ResizableColumns";
import WarehouseDropdown from "../components/dropdown/WarehouseDropdown";
import SearchInput from "../components/SearchInput";
import ExportExcelButton from "../components/ExportExcelButton";

export interface Transaction {
  id?: number | string;
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
  remark?: string;
  create_date?: string;
}

export interface LeditRow {
  pk_id: number;
  create_date?: string;
  value_new?: string;
  column?: string;
  people_first_name?: string;
  people_last_name?: string;
  employee_first_name?: string;
  employee_last_name?: string;
  user_type?: string;
}

const headers = [
  // "Log",
  "หมายเหตุ",
  "วันที่หมายเหตุล่าสุด",
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

export default function ProductOverdue() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState<string>("");
  const [remark, setRemark] = useState<string>("");
  const [filterType, setFilterType] = useState<
    "has_resend" | "no_resend" | "all"
  >("all");
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
  const [leditRows, setLeditRows] = useState<LeditRow[]>([]);
  const [leditLoading, setLeditLoading] = useState(false);
  const [leditError, setLeditError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("create_date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
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
        remark,
        resend_date_filter: filterType,
        warehouse_id: selectedWarehouseId,
        customer_id: selectedCustomerId,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      const res = await AxiosInstance.get("/03", { params });
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

  const fetchLedit = async (receive_id: string) => {
    setLeditLoading(true);
    setLeditError(null);
    try {
      const res = await AxiosInstance.get("/vledit", {
        params: { receive_id },
      });
      setLeditRows(res.data.data || []);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setLeditError(err?.message || "เกิดข้อผิดพลาดในการโหลด log แก้ไข");
      } else if (err instanceof Error) {
        setLeditError(err.message);
      } else {
        setLeditError("เกิดข้อผิดพลาดในการโหลด log แก้ไข");
      }
      setLeditRows([]);
    } finally {
      setLeditLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  useEffect(() => {
    setPage(1);
  }, [search, remark, filterType, selectedWarehouseId, selectedCustomerId]);

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    } else {
      fetchTransactions();
    }
  }, [
    search,
    remark,
    filterType,
    page,
    pageCount,
    selectedWarehouseId,
    selectedCustomerId,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/signin", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    if (
      isModalOpen &&
      modalData &&
      !Array.isArray(modalData) &&
      modalData.receive_business_id
    ) {
      setLeditRows([]);
      setLeditLoading(true);
      fetchLedit(String(modalData.receive_business_id));
    }
  }, [isModalOpen, modalData]);

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
      <div className="flex items-center justify-between mb-1">
        <div className="flex flex-wrap items-center gap-1 w-full">
          <WarehouseDropdown
            onChange={(warehouseId) => setSelectedWarehouseId(warehouseId)}
          />
          <CustomerDropdown
            onChange={(customerId) => setSelectedCustomerId(customerId)}
          />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="ค้นหา Do หรือ Ref"
          />
          <SearchInput
            value={remark}
            onChange={setRemark}
            placeholder="ค้นหาหมายเหตุ"
          />
          <HasResendDropdown onChange={(type) => setFilterType(type)} />
        </div>
        <ExportExcelButton
          url="/export03"
          filename="Overdue.xlsx"
          label="Export Excel"
        />
      </div>

      {/* ตารางข้อมูล */}
      <div className="overflow-x-auto w-full">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <ResizableColumns
            headers={headers}
            pageKey="ProductOverdue"
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={(headerKey) => {
              if (sortBy === headerKey) {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              } else {
                setSortBy(headerKey);
                setSortOrder("desc");
              }
            }}
          />
          <tbody>
            {transactions.map((t, i) => {
              return (
                <tr
                  key={t.id ?? i}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  {/* log modal */}
                  {/* <td className="px-3 py-1 border-b truncate">
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
                    {t.remark || "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate max-w-xs">
                    {t.create_date
                      ? format(new Date(t.create_date), "dd-MM-yyyy | HH:mm:ss")
                      : "-"}
                  </td>
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
                  <td className="px-4 py-2 border-b truncate">
                    {t.delivery_date
                      ? format(new Date(t.delivery_date), "dd-MM-yyyy")
                      : "-"}
                  </td>
                  <td className="px-4 py-2 border-b truncate">
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

      {/* modal log เดิม */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-100000 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          onClick={() => {
            if (updateLoading) return;
            closeModal();
          }}
        >
          <div
            className="bg-white p-6 rounded shadow-lg min-w-[320px] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-base">
                ประวัติการแก้ไข
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

            {/* ตารางข้อมูล log การแก้ไข */}
            <div className="overflow-x-auto">
              {leditLoading && (
                <div className="text-brand-500 py-2">
                  กำลังโหลด log แก้ไข...
                </div>
              )}
              {leditError && (
                <div className="text-red-500 py-2">{leditError}</div>
              )}
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-2 py-1">วันที่หมายเหตุ</th>
                      <th className="border px-2 py-1">หมายเหตุ</th>
                      <th className="border px-2 py-1">ช่องทางหมายเหตุ</th>
                      <th className="border px-2 py-1">ชื่อ</th>
                      <th className="border px-2 py-1">นามสกุล</th>
                      <th className="border px-2 py-1">ชื่อ</th>
                      <th className="border px-2 py-1">นามสกุล</th>
                      <th className="border px-2 py-1">ประเภทผู้ใช้</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(leditRows) && leditRows.length > 0 ? (
                      leditRows.map((i, idx) => (
                        <tr key={i.pk_id ?? idx}>
                          <td className="border px-2 py-1 truncate">
                            {i.create_date
                              ? format(
                                  new Date(i.create_date),
                                  "dd-MM-yyyy HH:mm:ss"
                                )
                              : "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.value_new || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.column || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.people_first_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.people_last_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.employee_first_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.employee_last_name || "-"}
                          </td>
                          <td className="border px-2 py-1">
                            {i.user_type || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="border px-2 py-1 text-center"
                          colSpan={8}
                        >
                          ไม่มีข้อมูลการแก้ไข
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
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
