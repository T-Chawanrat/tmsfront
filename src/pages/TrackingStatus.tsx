import { useState } from "react";
import AxiosInstance from "../utils/AxiosInstance";
import axios from "axios";
import { format } from "date-fns";

type TrackingType = "receiveCode" | "serialNo" | "referenceNo";

const TRACKING_API = "https://api-admin.trantech.co.th/tracking";

interface SerialDetail {
  serial_no: string;
  status_name: string;
  group_status_name: string;
  datetime: string;
  warehouse_name_show: string;
  address: string;
  tambon_name: string;
  ampur_name: string;
  province_name: string;
  zipcode: string;
  imageSend?: string[];
  sign_name?: string;
}

interface TrackingRow {
  receive_code: string;
  recipient_tel: string;
  shipper_tel: string;
  serials: SerialDetail[];
}

interface ApiResponse {
  ok: boolean;
  rows: TrackingRow[];
}

export default function TrackingStatus() {
  const [code, setCode] = useState("");
  const [trackingType, setTrackingType] = useState<TrackingType>("receiveCode");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showNotFound, setShowNotFound] = useState(false);

  const handleSearch = async () => {
    if (!code) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowNotFound(false);

    try {
      const res = await AxiosInstance.get<ApiResponse>(`${TRACKING_API}?type=${trackingType}&code=${code}`);
      if (res.data.rows.length === 0) {
        setShowNotFound(true);
      } else {
        setResult(res.data);
        setShowNotFound(false);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || err.message || "เกิดข้อผิดพลาด");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาด");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-thai relative">
      {/* Card */}
      <div className="p-2">
        {/* Search Form */}
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="md:w-1/3">
            <input
              type="text"
              placeholder="ค้นหาสถานะสินค้า"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
            />
          </div>

          <div>
            <div className="text-xs font-medium mb-1">ตัวกรอง</div>
            <div className="flex gap-4">
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  className="accent-primary-500"
                  checked={trackingType === "receiveCode"}
                  onChange={() => setTrackingType("receiveCode")}
                />
                <span>DO</span>
              </label>
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  className="accent-primary-500"
                  checked={trackingType === "serialNo"}
                  onChange={() => setTrackingType("serialNo")}
                />
                <span>Serial</span>
              </label>
              <label className="flex items-center space-x-1">
                <input
                  type="radio"
                  className="accent-primary-500"
                  checked={trackingType === "referenceNo"}
                  onChange={() => setTrackingType("referenceNo")}
                />
                <span>Reference</span>
              </label>
            </div>
          </div>
          <button
            className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 font-semibold mt-2 md:mt-0"
            onClick={handleSearch}
            disabled={loading}
          >
            ค้นหา
          </button>
        </div>

        {/* Result */}
        {(result || loading) && (
          <div className="mt-3 bg-white rounded-lg shadow p-2">
            {loading && <div className="text-center py-6 text-gray-500">กำลังค้นหา...</div>}
            {error && <div className="text-center py-6 text-red-500">{error}</div>}
            {result &&
              result.rows.map((row, rowIndex) => (
                <div key={rowIndex} className="">
                  <h3 className="text-lg font-semibold mb-2">{row.receive_code}</h3>
                  <h3 className="font-semibold mb-2">Serial: {row.serials[0].serial_no}</h3>
                  <h3 className="font-semibold mb-6">
                    ที่อยู่: {row.serials[0].address}, {row.serials[0].tambon_name}, {row.serials[0].ampur_name},{" "}
                    {row.serials[0].province_name}, {row.serials[0].zipcode}
                  </h3>
                  <br />
                  {row.serials.map((serial, serialIndex) => (
                    <div className="">
                      <div key={serialIndex} className="grid grid-cols-3 justify-between gap-4 -mt-6">
                        <p>{serial.datetime ? format(new Date(serial.datetime), "dd-MM-yyyy | HH:mm:ss") : "-"}</p>
                        <p>
                          {serial.status_name} - {serial.warehouse_name_show}
                        </p>
                        <p>{serial.group_status_name}</p>
                        <br />
                      </div>
                      <div>
                        {serial.imageSend && (
                          <div className="mt-4">
                            <h4>รูปภาพการส่ง:</h4>
                            <div className="flex gap-2 overflow-x-auto sm:overflow-x-visible flex-wrap">
                              {serial.imageSend.map((image, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={image}
                                  alt={`Image ${imgIndex + 1}`}
                                  className="h-24 w-auto rounded cursor-pointer flex-shrink-0"
                                  onClick={() => setSelectedImage(image)}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {serial.sign_name && (
                          <div className="mt-8">
                            <h4>ลายเซ็น:</h4>
                            <img
                              src={serial.sign_name || ""}
                              alt="Signature"
                              className="h-24 w-auto rounded cursor-pointer"
                              onClick={() => setSelectedImage(serial.sign_name || "")}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-100000 flex items-center justify-center bg-white/30 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative bg-white rounded-lg shadow-lg" onClick={(e) => e.stopPropagation()}>
            <img src={selectedImage} alt="Enlarged" className="max-w-full max-h-[800px] rounded" />
            <button
              className="absolute top-4 right-4 bg-gray-300 text-black rounded-full p-2"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {showNotFound && <div className="mt-4 text-center text-red-500 font-semibold">ไม่พบข้อมูลในระบบ</div>}
    </div>
  );
}
