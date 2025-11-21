// import Chart from "react-apexcharts";
// import { ApexOptions } from "apexcharts";
// import { MoreDotIcon } from "../../icons";
// import { useState, useEffect } from "react";
// import AxiosInstance from "../../utils/AxiosInstance";

// interface ApiResponse {
//   data: WarehouseStandardData[];
// }

// interface WarehouseStandardData {
//   warehouse_id: number;
//   warehouse_name: string;
//   no_resend_count: number;
//   overdue_count: number;
//   overdue_days_avg: string | null;
//   overdue_days_max: number | null;
//   overdue_days_min: number | null;
// }

// export default function WarehouseStdChart() {
//   const [windowWidth, setWindowWidth] = useState(0);
//   const [series, setSeries] = useState<{ name: string; data: number[] }[]>([
//     {
//       name: "ไม่มีการส่งซ้ำ",
//       data: [],
//     },
//     {
//       name: "เกินกำหนด",
//       data: [],
//     },
//   ]);
//   const [isOpen, setIsOpen] = useState(false);

//   // เช็คขนาดหน้าจอ
//   useEffect(() => {
//     const handleResize = () => setWindowWidth(window.innerWidth);
//     handleResize(); // เรียกครั้งแรก
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const options: ApexOptions = {
//     colors: ["#465fff", "#ff6b6b"],
//     chart: {
//       fontFamily: "Sarabun, sans-serif",
//       type: "bar",
//       height: 180,
//       toolbar: { show: false },
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: windowWidth < 768 ? "100%" : "60%", // responsive column width
//         borderRadius: 5,
//         borderRadiusApplication: "end",
//       },
//     },
//     dataLabels: {
//       enabled: true,
//       offsetX: 1,
//       style: {
//         fontSize: windowWidth < 768 ? "10px" : "11px",
//         fontWeight: "bold",
//       },
//     },
//     stroke: {
//       show: true,
//       width: 2,
//       colors: ["transparent"],
//     },
//     xaxis: {
//       categories: [
//         "กทม.",
//         "ขอนแก่น",
//         "พิษณุโลก",
//         "นครสวรรค์",
//         "ชลบุรี",
//         "นครราชสีมา",
//         "ร้อยเอ็ด",
//         "อุดรธานี",
//         "ลำปาง",
//         "ชุมพร",
//         "สงขลา-หาดใหญ่",
//         "กระบี่",
//       ],
//       axisBorder: { show: false },
//       axisTicks: { show: false },
//       labels: {
//         style: {
//           fontSize: windowWidth < 768 ? "9px" : "10px",
//         },
//         rotate: windowWidth < 768 ? -45 : 0, // หมุนข้อความในมือถือ
//       },
//     },
//     legend: {
//       show: true,
//       position: "top",
//       horizontalAlign: "left",
//       fontFamily: "Sarabun, sans-serif",
//       fontSize: windowWidth < 768 ? "11px" : "12px",
//       onItemClick: {
//         toggleDataSeries: false, // ปิดการคลิกเพื่อซ่อน/แสดง series
//       },
//       onItemHover: {
//         highlightDataSeries: false, // ปิด highlight เมื่อ hover
//       },
//     },
//     yaxis: {
//       title: { text: undefined },
//       labels: {
//         style: {
//           fontSize: windowWidth < 768 ? "10px" : "10px",
//         },
//       },
//     },
//     grid: {
//       yaxis: { lines: { show: true } },
//     },
//     fill: { opacity: 1 },
//     tooltip: {
//       x: { show: false },
//       y: {
//         formatter: (val: number) => `${val} `,
//       },
//     },
//   };

//   const fetchData = async () => {
//     try {
//       const { data }: { data: ApiResponse } = await AxiosInstance.get("/dashboard03std");

//       const warehouseNames = data.data.map(
//         (item) => item.warehouse_name.replace("DC ", "") // ลบ "DC " เพื่อให้ชื่อสั้นลง
//       );
//       const noResendCounts = data.data.map((item) => item.no_resend_count);
//       const overdueCounts = data.data.map((item) => item.overdue_count);

//       // อัปเดต categories ใน options
//       options.xaxis!.categories = warehouseNames;

//       setSeries([
//         {
//           name: "ไม่มีการส่งซ้ำ",
//           data: noResendCounts,
//         },
//         {
//           name: "เกินกำหนด",
//           data: overdueCounts,
//         },
//       ]);
//     } catch (error) {
//       console.error("Error fetching data from API:", error);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   function toggleDropdown() {
//     setIsOpen(!isOpen);
//   }

//   return (
//     <div className="font-thai overflow-hidden rounded-2xl border border-gray-200 bg-white px-3 pt-3 sm:px-5 sm:pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
//       <div className="flex items-center justify-between mb-2 sm:mb-0">
//         <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">03std</h3>
//         <div className="relative inline-block">
//           <button className="dropdown-toggle" onClick={toggleDropdown}>
//             <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-5 sm:size-6" />
//           </button>
//         </div>
//       </div>

//       <div className="w-full overflow-hidden">
//         <div className="w-full">
//           <Chart options={options} series={series} type="bar" height={180} />
//         </div>
//       </div>
//     </div>
//   );
// }

import { MoreDotIcon } from "../../icons";
import { useState, useEffect } from "react";
import AxiosInstance from "../../utils/AxiosInstance";

interface ApiResponse {
  data: WarehouseStandardData[];
}

interface WarehouseStandardData {
  warehouse_id: number;
  warehouse_name: string;
  no_resend_count: number;
  overdue_count: number;
  overdue_days_avg: string | null;
  overdue_days_max: number | null;
  overdue_days_min: number | null;
}

export default function WarehouseStdTable() {
  const [data, setData] = useState<WarehouseStandardData[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchData = async () => {
    try {
      const { data }: { data: ApiResponse } = await AxiosInstance.get("/dashboard03std");
      setData(data.data);
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  return (
    <div className="font-thai overflow-hidden rounded-2xl border border-gray-200 bg-white px-3 pt-3 sm:px-5 sm:pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-2 sm:mb-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">
          สินค้าในคลัง ไม่มีและเกินวันจัดส่งใหม่
        </h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-5 sm:size-6" />
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse table-auto">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-4 py-2 text-gray-600 dark:text-gray-300">คลังปัจจุบัน</th>
              <th className="px-4 py-2 text-gray-600 dark:text-gray-300">ไม่มีวันจัดส่งใหม่</th>
              <th className="px-4 py-2 text-gray-600 dark:text-gray-300">เกินวันจัดส่งใหม่</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={index}
                className={`border-t ${index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}`}
              >
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.warehouse_name.replace("DC ", "")}</td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.no_resend_count}</td>
                <td className="px-4 py-2 text-gray-800 dark:text-gray-200">{item.overdue_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
