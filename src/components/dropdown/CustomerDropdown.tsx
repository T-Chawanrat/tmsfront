import React, { useState, useEffect, useRef } from "react";
// import AxiosInstance from "../../utils/AxiosInstance";
import { ChevronDownIcon } from "lucide-react";
import axios from "axios";

export interface Customer {
  customer_id: number;
  customer_name: string;
}

interface CustomerDropdownProps {
  onChange: (customer: Customer | null) => void;
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
        const response = await axios.get("https://xsendwork.com/api/customers");
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
        customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
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
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(true);

    if (value === "") {
      setSelectedCustomerId(null);
      onChange(null); // 👈 ส่ง null กลับไป
    }
  };

  const handleSelectChange = (customerId: number, customerName: string) => {
    setSelectedCustomerId(customerId);
    setSearchTerm(customerName);
    setIsDropdownOpen(false);

    onChange({
      customer_id: customerId,
      customer_name: customerName,
    }); // 👈 ส่งทั้ง object กลับไป
  };

  // const toggleDropdown = () => {
  //   // toggle dropdown และรีเซ็ต searchTerm (เพื่อเปิด dropdown ให้แสดงรายการทั้งหมด)
  //   setIsDropdownOpen((prev) => !prev);
  //   if (!isDropdownOpen) {
  //     setSearchTerm(""); // รีเซ็ต searchTerm เมื่อกดลูกศร
  //   }
  // };

  return (
    // <div className="relative max-w-xs" ref={dropdownRef}>
    //   <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 h-9">
    //     <input
    //       type="text"
    //       placeholder="ค้นหาเจ้าของงาน"
    //       value={searchTerm}
    //       onChange={handleInputChange}
    //       onFocus={() => setIsDropdownOpen(true)} // เปิด dropdown เมื่อ focus
    //       className="flex-grow focus:outline-none"
    //     />
    //     <button
    //       type="button"
    //       onClick={toggleDropdown} // เปิด dropdown เมื่อคลิกลูกศร
    //       className="ml-2 focus:outline-none"
    //     >
    //       <ChevronDownIcon className="h-5 text-gray-500 -ml-5" />
    //     </button>
    //   </div>
    //   {isDropdownOpen && (
    //     <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 overflow-y-auto w-95">
    //       {filteredCustomers.length > 0 ? (
    //         filteredCustomers.map((customer) => (
    //           <li
    //             key={customer.customer_id}
    //             className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
    //               customer.customer_id === selectedCustomerId
    //                 ? "bg-gray-100"
    //                 : ""
    //             }`}
    //             onClick={() =>
    //               handleSelectChange(
    //                 customer.customer_id,
    //                 customer.customer_name
    //               )
    //             }
    //           >
    //             {customer.customer_name}
    //           </li>
    //         ))
    //       ) : (
    //         <li className="px-3 py-2 text-gray-500">ไม่พบข้อมูล</li>
    //       )}
    //     </ul>
    //   )}
    // </div>
    <div className="relative w-full" ref={dropdownRef}>
  {/* <label className="block text-sm font-medium mb-1">
    ชื่อลูกค้า (CUSTOMER_NAME)
  </label> */}

  {/* ช่องค้นหา / แสดงลูกค้า */}
  <div
    className="flex items-center w-full border border-slate-300 rounded-lg px-2.5 py-1.5 
               text-sm cursor-text bg-white shadow-inner 
               focus-within:ring-1 focus-within:ring-blue-400 focus-within:border-blue-400"
    onClick={() => setIsDropdownOpen(true)}
  >
    <input
      type="text"
      placeholder="ค้นหาลูกค้า"
      value={searchTerm}
      onChange={handleInputChange}
      onFocus={() => setIsDropdownOpen(true)}
      className="flex-grow bg-transparent focus:outline-none text-xs sm:text-sm placeholder-slate-400"
    />
    <ChevronDownIcon className="h-4 w-4 text-slate-400 ml-1" />
  </div>

  {isDropdownOpen && (
    <ul
      className="absolute z-20 bg-white border border-slate-200 rounded-xl mt-1 w-full 
                 max-h-52 overflow-y-auto shadow-lg text-xs sm:text-sm"
    >
      {filteredCustomers.length > 0 ? (
        filteredCustomers.map((customer) => (
          <li
            key={customer.customer_id}
            className={`px-3 py-1.5 cursor-pointer truncate 
                       hover:bg-blue-50
                       ${
                         customer.customer_id === selectedCustomerId
                           ? "bg-blue-50 text-blue-700 font-medium"
                           : "text-slate-700"
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
        <li className="px-3 py-2 text-slate-400 text-xs sm:text-sm">
          ไม่พบข้อมูล
        </li>
      )}
    </ul>
  )}
</div>


  );
};

export default CustomerDropdown;
