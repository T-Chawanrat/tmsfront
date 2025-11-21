import React, { useState } from "react";

interface OverStatusRadioProps {
  onChange: (filterType: "not_yet" | "overtime" | "all") => void;
}

const OverStatusRadio: React.FC<OverStatusRadioProps> = ({ onChange }) => {
  const [selected, setSelected] = useState<"not_yet" | "overtime" | "all">("all");

  const filterOptions = [
    { id: "all", label: "ทั้งหมด" },
    { id: "not_yet", label: "ยังไม่ถึง" },
    { id: "overtime", label: "เกินเวลา" },
  ];

  const handleSelect = (option: "not_yet" | "overtime" | "all") => {
    setSelected(option);
    onChange(option);
  };

  return (
    <div className="flex gap-6">
      {filterOptions.map((option) => (
        <label
          key={option.id}
          className="flex items-center cursor-pointer gap-1"
        >
          <input
            type="radio"
            name="filter"
            value={option.id}
            checked={selected === option.id}
            onChange={() => handleSelect(option.id as "not_yet" | "overtime" | "all")}
            className="hidden"
          />
          <span
            className={`w-3 h-3 rounded-full border border-gray-400 flex items-center justify-center 
              ${selected === option.id ? "bg-brand-500" : "bg-white"}`}
          />
          <span className="text-sm">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default OverStatusRadio;
