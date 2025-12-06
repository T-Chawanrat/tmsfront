import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import ResizableColumns from "../components/ResizableColumns";
import { downloadImage } from "../utils/DownloadImage";

type BillReportRow = {
  id: number;
  NO_BILL: string | null;
  REFERENCE: string | null;
  SEND_DATE: string | null;
  CUSTOMER_NAME: string | null;
  RECIPIENT_CODE: string | null;
  RECIPIENT_NAME: string | null;
  RECIPIENT_TEL: string | null;
  RECIPIENT_ADDRESS: string | null;
  RECIPIENT_SUBDISTRICT: string | null;
  RECIPIENT_DISTRICT: string | null;
  RECIPIENT_PROVINCE: string | null;
  RECIPIENT_ZIPCODE: string | null;
  SERIAL_NO: string | null;
  user_id: number;
  create_date: string | null;
  create_time: string | null;
  warehouse_name: string | null;
  type: string | null;
  customer_input: "Y" | "N" | null;
  warehouse_accept: "Y" | "N" | null;
  dc_accept: "Y" | "N" | null;
  image: "Y" | "N" | null;
  sign: "Y" | "N" | null;
  warehouse_id: number | null;
  bill_sign: string | null;
  bill_image_urls: string[] | null;
  bill_remark: string | null;
  bill_id?: number;
};

const API_ENDPOINT = "https://xsendwork.com/api/bills-data";

export default function BillReport() {
  const { user } = useAuth();

  const [rows, setRows] = useState<BillReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSerial, setSearchSerial] = useState("");
  const [searchReference, setSearchReference] = useState("");
  const [modalSerialNo, setModalSerialNo] = useState<string | null>(null);
  const [modalReference, setModalReference] = useState<string | null>(null);
  const [modalSignUrl, setModalSignUrl] = useState<string | null>(null);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalBillId, setModalBillId] = useState<number | null>(null);
  const [modalBillInfo, setModalBillInfo] = useState<{
    name: string | null;
    surname: string | null;
    license_plate: string | null;
    remark: string | null;
  }>({
    name: null,
    surname: null,
    license_plate: null,
    remark: null,
  });

  const headers = [
    "ลำดับ",
    "SERIAL_NO",
    "REFERENCE",
    "ชื่อลูกค้า",
    "ผู้รับ",
    "ที่อยู่ผู้รับ",
    "ปลายทาง",
    // "วันที่สร้าง",
    "ประเภท",
    "สถานะ",
    "ลายเซ็น",
    "รูปภาพ",
    "หมายเหตุ",
  ];

  // ------------------------------------------
  // Helper
  // ------------------------------------------
  const renderStatusBadge = (value: "Y" | "N" | null, label: string) => {
    if (!value) return null;
    const isYes = value === "Y";
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-[2px] text-[10px] font-semibold ${
          isYes
            ? "bg-green-100 text-green-700 border border-green-300"
            : "bg-red-100 text-red-700 border border-red-300"
        }`}
      >
        {label}: {isYes ? "Y" : "N"}
      </span>
    );
  };

  //   const formatDateTime = (dateStr: string | null, timeStr: string | null) => {
  //     if (!dateStr && !timeStr) return "-";
  //     try {
  //       const d = dateStr ? new Date(dateStr) : null;
  //       const dateText = d
  //         ? d.toLocaleDateString("th-TH", {
  //             year: "numeric",
  //             month: "2-digit",
  //             day: "2-digit",
  //           })
  //         : "";
  //       const timeText = timeStr || "";
  //       return `${dateText} ${timeText}`.trim() || "-";
  //     } catch {
  //       return "-";
  //     }
  //   };

  const buildFullAddress = (r: BillReportRow) => {
    const parts = [
      r.RECIPIENT_ADDRESS || "",
      r.RECIPIENT_SUBDISTRICT ? `ต.${r.RECIPIENT_SUBDISTRICT}` : "",
      r.RECIPIENT_DISTRICT ? `อ.${r.RECIPIENT_DISTRICT}` : "",
      r.RECIPIENT_PROVINCE ? `จ.${r.RECIPIENT_PROVINCE}` : "",
      r.RECIPIENT_ZIPCODE || "",
    ].filter(Boolean);
    return parts.join(" ");
  };

  const truncateText = (text: string, maxLength = 80) => {
    if (!text) return "-";
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // ------------------------------------------
  // ดึงข้อมูล (รองรับค่าค้นหาที่ส่งเข้ามา)
  // ------------------------------------------
  const fetchData = async (customSerial?: string, customReference?: string) => {
    if (!user?.user_id) return;

    const serial = customSerial ?? searchSerial;
    const reference = customReference ?? searchReference;

    setLoading(true);
    setError(null);

    try {
      const res = await axios.get(API_ENDPOINT, {
        params: {
          user_id: user.user_id,
          SERIAL_NO: serial && serial.length >= 3 ? serial : undefined,
          REFERENCE: reference && reference.length >= 3 ? reference : undefined,
        },
      });

      if (res.data?.success) {
        setRows(res.data.data || []);
      } else {
        setError(res.data?.message || "ดึงข้อมูลไม่สำเร็จ");
      }
    } catch (err) {
      console.error(err);
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setLoading(false);
    }
  };

  // const openImageModal = (r: any) => {
  //   const signUrl = r.bill_sign ? `https://xsendwork.com/${r.bill_sign}` : null;

  //   const images = Array.isArray(r.bill_image_urls)
  //     ? r.bill_image_urls.map((p: string) => `https://xsendwork.com/${p}`)
  //     : [];

  //   // ถ้าไม่มีทั้ง sign และรูป จะไม่เปิด modal
  //   if (!signUrl && images.length === 0) return;

  //   setModalSerialNo(r.SERIAL_NO || null);
  //   setModalReference(r.REFERENCE || null);
  //   setModalSignUrl(signUrl);
  //   setModalImages(images);
  // };

  const openImageModal = (r: any) => {
    const signUrl = r.bill_sign ? `https://xsendwork.com/${r.bill_sign}` : null;

    const images = Array.isArray(r.bill_image_urls)
      ? r.bill_image_urls.map((p: string) => `https://xsendwork.com/${p}`)
      : [];

    if (!signUrl && images.length === 0) return;

    setModalSerialNo(r.SERIAL_NO || null);
    setModalReference(r.REFERENCE || null);
    setModalSignUrl(signUrl);
    setModalImages(images);

    // ⭐ ดึงข้อมูลจาก API มาเก็บ
    setModalBillInfo({
      name: r.bill_name || null,
      surname: r.bill_surname || null,
      license_plate: r.bill_license_plate || null,
      remark: r.bill_remark ?? null,
    });

    setModalBillId(r.bill_id ?? null);
  };

  // const closeImageModal = () => {
  //   setModalSerialNo(null);
  //   setModalReference(null);
  //   setModalSignUrl(null);
  //   setModalImages([]);
  // };

  const closeImageModal = () => {
    setModalSerialNo(null);
    setModalReference(null);
    setModalSignUrl(null);
    setModalImages([]);
    setModalBillInfo({
      name: null,
      surname: null,
      license_plate: null,
      remark: null,
    });

    setModalBillId(null);
  };

  useEffect(() => {
    if (user?.user_id) {
      fetchData("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id]);

  // ------------------------------------------
  // UI
  // ------------------------------------------
  return (
    <div className="font-thai w-full p-4 bg-gray-100">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">รายงานรายการบิล (Bill Report)</h2>

        <div className="flex flex-col items-end text-sm text-gray-600">
          <span>ผู้ใช้: {user?.first_name || user?.username || "-"}</span>
          <span>จำนวนรายการ: {rows.length.toLocaleString("th-TH")}</span>
        </div>
      </div>

      {/* Search Panel */}
      <div className="mb-4 bg-white border border-gray-300 rounded shadow-sm p-3 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-gray-700 mb-1">ค้นหา SERIAL_NO</label>
          <input
            type="text"
            value={searchSerial}
            onChange={(e) => {
              const value = e.target.value;
              setSearchSerial(value);

              if (value.length === 0) {
                // ลบหมด → โหลดทั้งหมด
                fetchData("", searchReference);
              } else if (value.length >= 3) {
                // พิมพ์ครบ 3 ตัวขึ้นไป → ค้น
                fetchData(value, searchReference);
              }
              // ถ้า 1–2 ตัว → ยังไม่ยิง API
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[220px]"
            placeholder="อย่างน้อย 3 ตัว เช่น BX2..."
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-700 mb-1">ค้นหา REFERENCE</label>
          <input
            type="text"
            value={searchReference}
            onChange={(e) => {
              const value = e.target.value;
              setSearchReference(value);

              if (value.length === 0) {
                fetchData(searchSerial, "");
              } else if (value.length >= 3) {
                fetchData(searchSerial, value);
              }
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm min-w-[220px]"
            placeholder="อย่างน้อย 3 ตัว เช่น TR6..."
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-3 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-600 mt-4">กำลังโหลดข้อมูล...</div>
      )}

      {/* Table */}
      {!loading && rows.length === 0 && !error && (
        <div className="text-center text-gray-500 mt-4">
          ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="border border-gray-300 rounded bg-white shadow-sm">
          {/* เลื่อนทั้งแนวนอน + แนวตั้ง ใน div เดียว */}
          <div className="max-h-[75vh] overflow-auto">
            <table className="border-collapse min-w-max">
              <ResizableColumns
                headers={headers}
                pageKey="bill-report"
                minWidths={{
                  7: 50,
                  8: 370,
                  9: 80,
                  10: 370,
                }}
              />
              <tbody>
                {rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    {/* ลำดับ */}
                    <td className="px-2 py-1 border-b border-gray-300 text-center text-sm bg-gray-100 font-semibold">
                      {idx + 1}
                    </td>

                    {/* SERIAL_NO */}
                    <td
                      onClick={() => openImageModal(r)}
                      title="คลิกเพื่อดูรูปภาพ"
                      className="
                      px-2 py-1 border-b border-gray-300 text-sm truncate
                      font-medium cursor-pointer
                     hover:text-gray-400"
                    >
                      🔍 {r.SERIAL_NO || "-"}
                    </td>

                    {/* REFERENCE */}
                    <td className="px-2 py-1 border-b border-gray-300 text-sm truncate">
                      {r.REFERENCE || "-"}
                    </td>

                    {/* CUSTOMER_NAME */}
                    <td className="px-2 py-1 border-b border-gray-300 text-sm truncate">
                      {r.CUSTOMER_NAME || "-"}
                    </td>

                    {/* ผู้รับ */}
                    <td className="px-2 py-1 border-b border-gray-300  leading-snug truncate max-w-[100px]">
                      {truncateText(
                        `${r.RECIPIENT_NAME || "-"}${
                          r.RECIPIENT_TEL ? ` (${r.RECIPIENT_TEL})` : ""
                        }`,
                        100
                      )}
                    </td>

                    {/* ที่อยู่ผู้รับ */}
                    <td
                      className="px-2 py-1 border-b border-gray-300 text-[11px] leading-snug max-w-[200px] truncate"
                      title={buildFullAddress(r)}
                    >
                      {truncateText(buildFullAddress(r), 255)}
                    </td>

                    {/* ปลายทาง */}
                    <td className="px-2 py-1 border-b border-gray-300 leading-snug">
                      {r.warehouse_name || "-"}
                    </td>
                    {/* วันที่สร้าง */}
                    {/* <td className="px-2 py-1 border-b border-gray-300 text-[11px] text-center">
                      {formatDateTime(r.create_date, r.create_time)}
                    </td> */}

                    {/* Type */}
                    <td className="px-2 py-1 border-b border-gray-300 text-xs text-center">
                      <span className="inline-flex items-center rounded-full px-2 py-[2px] bg-gray-100 border border-gray-300">
                        {r.type || "-"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-2 py-1 border-b border-gray-300 text-[10px]">
                      <div className="flex flex-wrap gap-1">
                        {renderStatusBadge(r.customer_input, "นำเข้าบิล")}
                        {renderStatusBadge(r.warehouse_accept, "คลังรับเข้า")}
                        {renderStatusBadge(r.dc_accept, "DC รับเข้า")}
                        {renderStatusBadge(r.image, "รูปภาพ")}
                        {renderStatusBadge(r.sign, "ลายเซ็น")}
                      </div>
                    </td>
                    <td className="px-2 py-1 border-b border-gray-300 text-center">
                      {r.bill_sign ? (
                        <img
                          src={`https://xsendwork.com/${r.bill_sign}`}
                          className="h-8 mx-auto rounded border cursor-pointer"
                          onClick={() =>
                            window.open(
                              `https://xsendwork.com/${r.bill_sign}`,
                              "_blank"
                            )
                          }
                          alt=""
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-2 py-1 border-b border-gray-300 text-center">
                      {r.bill_image_urls && r.bill_image_urls.length > 0 ? (
                        <div className="flex flex-wrap gap-1 justify-center">
                          {r.bill_image_urls.map((img, i) => (
                            <img
                              key={i}
                              src={`https://xsendwork.com/${img}`}
                              className="h-8 w-10 object-cover rounded border cursor-pointer"
                              onClick={() =>
                                window.open(
                                  `https://xsendwork.com/${img}`,
                                  "_blank"
                                )
                              }
                              alt=""
                            />
                          ))}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-2 py-1 border-b border-gray-300 text-sm truncate">
                      {r.bill_remark || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Modal แสดงรูป */}

            {(modalSignUrl || modalImages.length > 0) && (
              <div
                className="fixed inset-0 z-100000 flex items-center justify-center bg-white/30 backdrop-blur-sm"
                onClick={closeImageModal}
              >
                <div
                  className="bg-white rounded-lg max-w-3xl w-full mx-4 p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-sm font-semibold flex flex-col gap-1">
                      <div className="flex gap-10">
                        <div>SN: {modalSerialNo || "-"}</div>
                        <div>REF: {modalReference || "-"}</div>
                      </div>

                      {/* ⭐ ข้อมูลจาก API: ชื่อ / ทะเบียน / DC */}
                      <div className="flex flex-wrap gap-4">
                        <span>
                          คนขับ:{" "}
                          {modalBillInfo.name || modalBillInfo.surname
                            ? `${modalBillInfo.name || ""} ${
                                modalBillInfo.surname || ""
                              }`
                            : "-"}
                        </span>
                        <span>
                          ทะเบียนรถ: {modalBillInfo.license_plate || "-"}
                        </span>
                        <span>หมายเหตุ: {modalBillInfo.remark || "-"}</span>
                      </div>
                    </div>

                    <button
                      className="text-gray-500 hover:text-black text-lg"
                      onClick={closeImageModal}
                    >
                      ✕
                    </button>
                  </div>

                  {/* === ลายเซ็น === */}
                  {modalSignUrl && (
                    <div className="mb-4">
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        ลายเซ็น
                      </div>
                      <img
                        src={modalSignUrl}
                        className="w-40 h-auto rounded border cursor-pointer"
                        onClick={() => window.open(modalSignUrl, "_blank")}
                        alt="signature"
                      />
                    </div>
                  )}

                  {/* === รูปภาพจาก bill_image_urls === */}
                  {modalImages.length > 0 && (
                    <>
                      <div className="text-xs font-bold text-gray-700 mb-1">
                        รูปถ่าย
                      </div>
                      <div className="grid grid-cols-3 gap-2 max-h-[70vh] overflow-auto">
                        {modalImages.map((url, i) => (
                          <img
                            key={i}
                            src={url}
                            className="w-full h-30 object-cover rounded border cursor-pointer"
                            onClick={() => window.open(url, "_blank")}
                            alt=""
                          />
                        ))}
                      </div>
                    </>
                  )}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        if (modalBillId) {
                          downloadImage(modalBillId);
                        } else {
                          // กันไว้เฉย ๆ เผื่อไม่มี id
                          // toast.warn("ไม่พบรหัสบิลสำหรับดาวน์โหลด");
                        }
                      }}
                      disabled={!modalBillId}
                      className={`px-3 py-1 text-sm rounded 
                      ${
                        modalBillId
                          ? "bg-green-600 text-white hover:bg-green-700"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      Download
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
