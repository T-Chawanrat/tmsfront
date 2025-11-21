import React, { useState, useEffect, useRef } from "react";
import AxiosInstance from "../../utils/AxiosInstance";
import { ChevronDownIcon } from "lucide-react";

export interface Customer {
  customer_id: number;
  customer_name: string;
}

interface CustomerDropdownProps {
  onChange: (customerId: number | null) => void; // Callback สำหรับส่งค่า customer_id ไปยัง parent
}

const CustomerDropdown: React.FC<CustomerDropdownProps> = ({ onChange }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(""); // คำค้นหาใน input
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  ); // ID ที่เลือกไว้
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false); // สถานะ dropdown เปิด/ปิด
  const dropdownRef = useRef<HTMLDivElement>(null); // ใช้ตรวจจับการคลิกภายนอก dropdown

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await AxiosInstance.get("/customers");
        const data = response.data.data || [];
        setCustomers(data);
        setFilteredCustomers(data); // ตั้งค่าเริ่มต้นสำหรับ dropdown
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    // กรองข้อมูลตาม searchTerm
    if (searchTerm) {
      const results = customers.filter((customer) =>
        customer.customer_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(results);
    } else {
      setFilteredCustomers(customers); // ถ้าไม่มี searchTerm ให้แสดงรายการทั้งหมด
    }
  }, [searchTerm, customers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false); // ปิด dropdown เมื่อคลิกนอก dropdown
        // หาก dropdown ถูกปิดโดยไม่ได้เลือกตัวเลือกใหม่ ให้แสดงค่าที่เลือกไว้
        if (!searchTerm && selectedCustomerId) {
          const selectedCustomer = customers.find(
            (customer) => customer.customer_id === selectedCustomerId
          );
          if (selectedCustomer) {
            setSearchTerm(selectedCustomer.customer_name); // แสดงชื่อ customer ที่เลือกไว้ใน input
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchTerm, selectedCustomerId, customers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // ค่าที่พิมพ์ใน input
    setSearchTerm(value); // อัปเดตคำค้นหา
    setIsDropdownOpen(true); // เปิด dropdown เมื่อมีการพิมพ์

    // หากข้อความถูกลบจนเป็นค่าว่าง ให้รีเซ็ต selectedCustomerId และส่ง callback
    if (value === "") {
      setSelectedCustomerId(null); // ไม่เลือกตัวเลือกใดๆ
      onChange(null); // ส่งค่า null กลับไปยัง parent
    }
  };

  const handleSelectChange = (customerId: number, customerName: string) => {
    setSelectedCustomerId(customerId); // บันทึก customer_id ที่เลือก
    setSearchTerm(customerName); // แสดงชื่อ customer ใน input
    setIsDropdownOpen(false); // ปิด dropdown
    onChange(customerId); // ส่งค่า customer_id กลับไปยัง parent component
  };

  const toggleDropdown = () => {
    // toggle dropdown และรีเซ็ต searchTerm (เพื่อเปิด dropdown ให้แสดงรายการทั้งหมด)
    setIsDropdownOpen((prev) => !prev);
    if (!isDropdownOpen) {
      setSearchTerm(""); // รีเซ็ต searchTerm เมื่อกดลูกศร
    }
  };

  return (
    <div className="relative max-w-xs" ref={dropdownRef}>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 h-9">
        <input
          type="text"
          placeholder="ค้นหาเจ้าของงาน"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsDropdownOpen(true)} // เปิด dropdown เมื่อ focus
          className="flex-grow focus:outline-none"
        />
        <button
          type="button"
          onClick={toggleDropdown} // เปิด dropdown เมื่อคลิกลูกศร
          className="ml-2 focus:outline-none"
        >
          <ChevronDownIcon className="h-5 text-gray-500 -ml-5" />
        </button>
      </div>
      {isDropdownOpen && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-95">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <li
                key={customer.customer_id}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                  customer.customer_id === selectedCustomerId
                    ? "bg-gray-100"
                    : ""
                }`}
                onClick={() =>
                  handleSelectChange(
                    customer.customer_id,
                    customer.customer_name
                  )
                }
              >
                {customer.customer_name}
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

export default CustomerDropdown;