import { useState } from "react";
import { FileDown } from "lucide-react";
import { ExportExcel } from "../utils/ExportExcel";

interface ExportExcelButtonProps {
  url: string;
  filename: string;
  label?: string;
}

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  url,
  filename,
  label,
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await ExportExcel({ url, filename });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="h-9 flex-shrink-0 inline-flex items-center gap-2 px-2 py-1 rounded-md bg-brand-500 hover:bg-brand-600 text-white font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={loading}
    >
      <FileDown />
      <span className="hidden md:inline">{label || "Export Excel"}</span>
    </button>
  );
};

export default ExportExcelButton;
