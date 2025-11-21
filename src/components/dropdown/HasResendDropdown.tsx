import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "lucide-react";

interface HasResendDropdownProps {
  onChange: (filterType: "has_resend" | "no_resend" | "all") => void;
}

const HasResendDropdown: React.FC<HasResendDropdownProps> = ({ onChange }) => {
  const [selectedFilter, setSelectedFilter] = useState<"has_resend" | "no_resend" | "all">("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { id: "all", label: "ทั้งหมด" },
    { id: "has_resend", label: "มีวันที่จัดส่งใหม่" },
    { id: "no_resend", label: "ไม่มีวันที่จัดส่งใหม่" },
  ];

  const handleSelectChange = (filterId: "has_resend" | "no_resend" | "all") => {
    setSelectedFilter(filterId);
    setIsDropdownOpen(false);
    onChange(filterId);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-40" ref={dropdownRef}>
      <div className="flex items-center border border-gray-300 rounded-lg px-3 py-1 h-9">
        <button
          type="button"
          onClick={toggleDropdown}
          className="flex-grow text-left focus:outline-none"
        >
          {filterOptions.find((option) => option.id === selectedFilter)?.label || "All"}
        </button>
        <ChevronDownIcon className="h-5 text-gray-500" />
      </div>
      {isDropdownOpen && (
        <ul className="absolute z-10 bg-white border border-gray-300 rounded-lg mt-1 max-h-40 w-40 overflow-y-auto">
          {filterOptions.map((option) => (
            <li
              key={option.id}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-200 ${
                option.id === selectedFilter ? "bg-gray-100" : ""
              }`}
              onClick={() => handleSelectChange(option.id as "has_resend" | "no_resend" | "all")}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HasResendDropdown;