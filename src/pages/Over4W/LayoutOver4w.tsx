// import { useState } from "react";
// import WarehouseOver4W from "../../components/dropdown/WarehouseOver4W";
// import OntruckV05_09 from "./OntruckV05_09";
// import OntruckV05_11 from "./OntruckV05_11";
// import OntruckV05_n09n11 from "./OntruckV05_n09n11";
// import { FileDown } from "lucide-react";
// import { ExportExcel } from "../../utils/ExportExcel";

// export default function Layout05() {
//   const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleDownload = async () => {
//     setLoading(true);
//     try {
//       await ExportExcel({
//         url: "/export05",
//         filename: "Over4w.xlsx",
//       });
//     } catch (err) {
//       alert((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="flex items-center justify-between mb-2 gap-2">
//         <WarehouseOver4W selectedWarehouseId={selectedWarehouseId} setSelectedWarehouseId={setSelectedWarehouseId} />

//         <button
//           onClick={handleDownload}
//           className="h-9 flex-shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
//           disabled={loading}
//         >
//           <FileDown />
//           <span className="hidden md:inline">Export Excel</span>
//         </button>
//       </div>

//       <OntruckV05_09 selectedWarehouseId={selectedWarehouseId} />
//       <OntruckV05_11 selectedWarehouseId={selectedWarehouseId} />
//       <OntruckV05_n09n11 selectedWarehouseId={selectedWarehouseId} />
//     </div>
//   );
// }

import Over4wTabs from "../../components/Over4wTabs";

export default function Ontruck() {
  return (
    <div>
      <Over4wTabs />
    </div>
  );
}
