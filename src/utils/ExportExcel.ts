import AxiosInstance from './AxiosInstance'; 
import axios from 'axios';

type ExportExcelOptions = {
  url: string;
  filename: string;
  params?: Record<string, string | number | boolean>;
};

export async function ExportExcel({
  url,
  filename,
  params = {},
}: ExportExcelOptions): Promise<void> {
  try {
    const response = await AxiosInstance.get(url, {
      params,
      responseType: 'blob',
    });

    const urlBlob = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement("a");
    a.href = urlBlob;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(urlBlob);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.statusText || "Download failed");
    }
    throw new Error("Download failed");
  }
}