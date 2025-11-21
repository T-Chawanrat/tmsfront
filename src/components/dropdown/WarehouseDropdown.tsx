import React, { useState, useEffect, useRef } from "react";
import AxiosInstance from "../../utils/AxiosInstance";
import { ChevronDownIcon } from "lucide-react";

export interface Warehouse {
  warehouse_id: number;
  warehouse_name: string;
  warehouse_code: string | null;
}

interface WarehouseDropdownProps {
  onChange: (warehouseId: number | null) => void;
  className?: string;
}

const WarehouseDropdown: React.FC<WarehouseDropdownProps> = ({ onChange }) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // คำค้นหาใน input
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | null>(
    null
  ); // ID ที่เลือกไว้
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // สถานะ dropdown เปิด/ปิด
  const dropdownRef = useRef<HTMLDivElement>(null); // ใช้ตรวจจับการคลิกภายนอก dropdown

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await AxiosInstance.get("/warehouses");
        const data = response.data.data || [];
        setWarehouses(data);
        setFilteredWarehouses(data); // ตั้งค่าเริ่มต้นสำหรับ dropdown
      } catch (error) {
        console.error("Error fetching warehouses:", error);
      }
    };

    fetchWarehouses();
  }, []);

  useEffect(() => {
    // กรองข้อมูลตาม searchTerm
    if (searchTerm) {
      const results = warehouses.filter((warehouse) =>
        warehouse.warehouse_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredWarehouses(results);
    } else {
      setFilteredWarehouses(warehouses); // ถ้าไม่มี searchTerm ให้แสดงรายการทั้งหมด
    }
  }, [searchTerm, warehouses]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false); // ปิด dropdown เมื่อคลิกนอก dropdown
        // หาก dropdown ถูกปิดโดยไม่ได้เลือกตัวเลือกใหม่ ให้แสดงค่าที่เลือกไว้
        if (!searchTerm && selectedWarehouseId) {
          const selectedWarehouse = warehouses.find(
            (warehouse) => warehouse.warehouse_id === selectedWarehouseId
          );
          if (selectedWarehouse) {
            setSearchTerm(selectedWarehouse.warehouse_name); // แสดงชื่อ warehouse ที่เลือกไว้ใน input
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchTerm, selectedWarehouseId, warehouses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // ค่าที่พิมพ์ใน input
    setSearchTerm(value); // อัปเดตคำค้นหา
    setIsDropdownOpen(true); // เปิด dropdown เมื่อมีการพิมพ์

    // หากข้อความถูกลบจนเป็นค่าว่าง ให้รีเซ็ต selectedWarehouseId และส่ง callback
    if (value === "") {
      setSelectedWarehouseId(null); // ไม่เลือกตัวเลือกใดๆ
      onChange(null); // ส่งค่า null กลับไปยัง parent
    }
  };

  const handleSelectChange = (warehouseId: number, warehouseName: string) => {
    setSelectedWarehouseId(warehouseId); // บันทึก warehouse_id ที่เลือก
    setSearchTerm(warehouseName); // แสดงชื่อ warehouse ใน input
    setIsDropdownOpen(false); // ปิด dropdown
    onChange(warehouseId); // ส่งค่า warehouse_id กลับไปยัง parent component
  };

  const toggleDropdown = () => {
    // toggle dropdown และรีเซ็ต searchTerm (เพื่อเปิด dropdown ให้แสดงรายการทั้งหมด)
    setIsDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      setSearchTerm(""); // รีเซ็ต searchTerm เมื่อกดลูกศร
    }
  };

  return (
    <div className="relative max-w-xs lg:w-48" ref={dropdownRef}>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 h-9">
        <input
          type="text"
          placeholder="ค้นหาคลังสินค้า"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)} // เปิด dropdown เมื่อ focus
          className="flex-grow focus:outline-none"
        />
        <button
          type="button"
          onClick={toggleDropdown} // เปิด dropdown เมื่อคลิกลูกศร
          className=" focus:outline-none"
        >
          <ChevronDownIcon className="h-5 text-gray-500 -ml-5" />
        </button>
      </div>
      {isDropdownOpen && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-full">
          {filteredWarehouses.length > 0 ? (
            filteredWarehouses.map((warehouse) => (
              <li
                key={warehouse.warehouse_id}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                  warehouse.warehouse_id === selectedWarehouseId
                    ? "bg-gray-100"
                    : ""
                }`}
                onClick={() =>
                  handleSelectChange(
                    warehouse.warehouse_id,
                    warehouse.warehouse_name
                  )
                }
              >
                {warehouse.warehouse_name}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500">ไม่พบข้อมูล</li>
          )}
        </ul>
      )}
    </div>
  );
};

export default WarehouseDropdown;
