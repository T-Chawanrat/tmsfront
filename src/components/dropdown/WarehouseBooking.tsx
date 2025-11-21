// import React, { useState, useEffect, useRef } from "react";
// import AxiosInstance from "../../utils/AxiosInstance";
// import { ChevronDownIcon } from "lucide-react";

// export interface Warehouse {
//   warehouse_id: number;
//   warehouse_name: string;
//   warehouse_code: string | null;
// }

// interface WarehouseBookingProps {
//   selectedWarehouseId: number | null; // รับ selectedWarehouseId จาก parent
//   setSelectedWarehouseId: (id: number | null) => void; // รับ setSelectedWarehouseId จาก parent
// }

// const WarehouseBooking: React.FC<WarehouseBookingProps> = ({
//   selectedWarehouseId,
//   setSelectedWarehouseId,
// }) => {
//   const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
//   const [searchTerm, setSearchTerm] = useState<string>(""); // คำค้นหาใน input
//   const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
//   const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // สถานะ dropdown เปิด/ปิด
//   const dropdownRef = useRef<HTMLDivElement>(null); // ใช้ตรวจจับการคลิกภายนอก dropdown

//   useEffect(() => {
//     const fetchWarehouses = async () => {
//       try {
//         const response = await AxiosInstance.get("/warehouses");
//         const data = response.data.data || [];
//         setWarehouses(data);
//         setFilteredWarehouses(data);
//       } catch (error) {
//         console.error("Error fetching warehouses:", error);
//       }
//     };

//     fetchWarehouses();
//   }, []);

//   useEffect(() => {
//     if (searchTerm) {
//       const results = warehouses.filter((warehouse) =>
//         warehouse.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredWarehouses(results);
//     } else {
//       setFilteredWarehouses(warehouses);
//     }
//   }, [searchTerm, warehouses]);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);

//         if (!searchTerm && selectedWarehouseId) {
//           const selectedWarehouse = warehouses.find((warehouse) => warehouse.warehouse_id === selectedWarehouseId);
//           if (selectedWarehouse) {
//             setSearchTerm(selectedWarehouse.warehouse_name);
//           }
//         }
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [searchTerm, selectedWarehouseId, warehouses]);

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchTerm(value);
//     setIsDropdownOpen(true);

//     if (value === "") {
//       setSelectedWarehouseId(null);
//     }
//   };

//   const handleSelectChange = (warehouseId: number, warehouseName: string) => {
//     setSelectedWarehouseId(warehouseId);
//     setSearchTerm(warehouseName);
//     setIsDropdownOpen(false);
//   };

//   const toggleDropdown = () => {
//     setIsDropdownOpen((prev) => !prev);
//     if (!isDropdownOpen) {
//       setSearchTerm("");
//     }
//   };

//   return (
//     <div className="relative w-50 font-thai" ref={dropdownRef}>
//       <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 h-9">
//         <input
//           type="text"
//           placeholder="ค้นหาคลังสินค้า (ทั้งหมด)"
//           value={searchTerm}
//           onChange={handleInputChange}
//           onFocus={() => setIsDropdownOpen(true)}
//           className="flex-grow focus:outline-none "
//         />
//         <button type="button" onClick={toggleDropdown} className="ml-2 focus:outline-none">
//           <ChevronDownIcon className="h-5 text-gray-500 -ml-5" />
//         </button>
//       </div>
//       {isDropdownOpen && (
//         <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-50">
//           {filteredWarehouses.length > 0 ? (
//             filteredWarehouses.map((warehouse) => (
//               <li
//                 key={warehouse.warehouse_id}
//                 className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
//                   warehouse.warehouse_id === selectedWarehouseId ? "bg-gray-100" : ""
//                 }`}
//                 onClick={() => handleSelectChange(warehouse.warehouse_id, warehouse.warehouse_name)}
//               >
//                 {warehouse.warehouse_name}
//               </li>
//             ))
//           ) : (
//             <li className="px-3 py-2 text-gray-500">ไม่พบข้อมูล</li>
//           )}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default WarehouseBooking;