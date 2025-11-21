import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "ทั้งหมด" },
  { value: "overtime", label: "เกินเวลา" },
  { value: "not_yet", label: "ยังไม่ถึง" },
];

const StatusFilter: React.FC<StatusFilterProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // หาตัวเลือกที่เลือกอยู่
  const selected = STATUS_OPTIONS.find(opt => opt.value === value) || STATUS_OPTIONS[0];

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="mb-2">
      {/* ปรับให้สั้นลง: เปลี่ยนจาก w-45 เป็น w-32 */}
      <div className="relative w-25" ref={dropdownRef}>
        <div 
          className="flex items-center justify-between border border-gray-300 rounded-lg px-3 py-1 h-9 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="">{selected.label}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-500" />
        </div>

        {isOpen && (
          <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 w-25 shadow-lg">
            {STATUS_OPTIONS.map((option) => (
              <li
                key={option.value}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  option.value === value ? "bg-gray-200" : ""
                }`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StatusFilter;