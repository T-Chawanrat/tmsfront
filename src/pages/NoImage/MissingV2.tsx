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

export interface MissingV2 {
  to_warehouse_name: string;
  license_plate: string;
  datetime: string;
  customer_name: string;
  shipper_name: string;
  recipient_name: string;
  receive_code: string;
  serial_no: string;
}

const headers = [
  "คลังปลายทาง",
  "ทะเบียนรถ",
  "วันที่ปิดระบบ",
  "เจ้าของงาน",
  "ชื่อผู้ส่ง",
  "ชื่อผู้รับ",
  "เลขที่เอกสาร",
  "เลขที่กล่อง",
];

export default function MissingV2() {
  const [ReceiveNoImage, setReceiveNoImage] = useState<MissingV2[]>([]);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  );
  const [searchCustomer, setSearchCustomer] = useState<string>("");
  const [searchRecipient, setSearchRecipient] = useState<string>("");
  const [searchLicensePlate, setSearchLicensePlate] = useState<string>("");
  const [searchShipper, setSearchShipper] = useState<string>("");
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
        searchLicensePlate,
        searchShipper,
        to_warehouse_id: selectedWarehouseId,
      };

      const res = await AxiosInstance.get("/missingv2", { params });

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
  }, [
    searchCustomer,
    searchRecipient,
    searchLicensePlate,
    searchShipper,
    selectedWarehouseId,
  ]);

  useEffect(() => {
    fetchReceiveNoImage();
  }, [
    page,
    searchCustomer,
    searchRecipient,
    searchLicensePlate,
    searchShipper,
    selectedWarehouseId,
  ]);

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
            value={searchLicensePlate}
            onChange={setSearchLicensePlate}
            placeholder="ค้นหาทะเบียนรถ"
          />
          <SearchInput
            value={searchCustomer}
            onChange={setSearchCustomer}
            placeholder="ค้นหาเจ้าของงาน"
          />
          <SearchInput
            value={searchShipper}
            onChange={setSearchShipper}
            placeholder="ค้นหาชื่อผู้ส่ง"
          />
          <SearchInput
            value={searchRecipient}
            onChange={setSearchRecipient}
            placeholder="ค้นหาชื่อผู้รับ"
          />
        </div>
        <div>
          <ExportExcelButton
            url="/export-missingv2"
            filename="MissingV2.xlsx"
            label="Export Excel"
          />
        </div>
      </div>
      <div className="overflow-x-auto w-full">
        <table className="w-full table-fixed border border-gray-300 rounded overflow-hidden">
          <ResizableColumns headers={headers} pageKey="MissingV2" />
          <tbody>
            {ReceiveNoImage.map((t) => (
              <tr key={crypto.randomUUID()}>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.to_warehouse_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.license_plate || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.datetime
                    ? format(new Date(t.datetime), "dd-MM-yyyy | HH:mm:ss")
                    : "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.customer_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.shipper_name || "-"}
                </td>
                <td className="px-4 py-2 border-b truncate max-w-xs">
                  {t.recipient_name || "-"}
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
