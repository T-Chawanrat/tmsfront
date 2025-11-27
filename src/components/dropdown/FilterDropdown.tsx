import React, { useState, useEffect, useRef } from "react";
import { ChevronDownIcon } from "lucide-react";

interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "ค้นหา",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const [filtered, setFiltered] = useState<string[]>(options);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    setFiltered(
      term
        ? options.filter((o) => o.toLowerCase().includes(term))
        : options
    );
  }, [searchTerm, options]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setSearchTerm(v);
    onChange(v);
    setIsOpen(true);
  };

  const handleSelect = (val: string) => {
    setSearchTerm(val);
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      <div
        className="flex items-center w-full border rounded px-2 py-1 text-sm cursor-text bg-white"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          className="flex-grow focus:outline-none text-sm bg-transparent"
        />
        <ChevronDownIcon className="h-4 text-gray-500 ml-1" />
      </div>

      {isOpen && (
        <ul className="absolute z-20 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <li
                key={item}
                className="px-3 py-2 cursor-pointer text-sm hover:bg-gray-100"
                onClick={() => handleSelect(item)}
              >
                {item}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-gray-500 text-sm">ไม่พบข้อมูล</li>
          )}
        </ul>
      )}
    </div>
  );
};
