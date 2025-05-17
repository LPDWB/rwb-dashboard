import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "../components/DataTable";
import BarChartComponent from "../components/BarChartComponent";

export default function Home() {
  const [data, setData] = useState([]);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const json = XLSX.utils.sheet_to_json(ws);
      setData(json);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📊 RWB Dashboard</h1>
        <button
          onClick={() => setIsDark(!isDark)}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          {isDark ? "🌞 Светлая тема" : "🌙 Тёмная тема"}
        </button>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded shadow">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-4 block w-full text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
        />
        {data.length > 0 && (
          <>
            <BarChartComponent data={data} />
            <DataTable data={data} />
          </>
        )}
        {data.length === 0 && <p className="text-sm">Загрузите Excel-файл для отображения данных.</p>}
      </div>
    </div>
  );
}
