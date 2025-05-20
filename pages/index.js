import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "../components/DataTable";
import BarChartComponent from "../components/BarChartComponent";
import Sidebar from "../components/Sidebar";
import AssistantPanel from "../components/AssistantPanel";
import ExportPanel from "../components/ExportPanel";
import ArchiveItem from "../components/ArchiveItem";

const STORAGE_KEYS = {
  ACTIVE_SECTION: 'rwb_active_section',
  UPLOAD_HISTORY: 'rwb_upload_history'
};

export default function Home() {
  const [data, setData] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SECTION);
    return saved ? JSON.parse(saved) : 'charts';
  });
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [uploadHistory, setUploadHistory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.UPLOAD_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  // Save active section to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SECTION, JSON.stringify(activeSection));
  }, [activeSection]);

  // Save upload history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.UPLOAD_HISTORY, JSON.stringify(uploadHistory));
  }, [uploadHistory]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Theme preferences
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    } else if (savedTheme === "light") {
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

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

      // Add to upload history with metadata
      const newFile = {
        id: Date.now().toString(),
        filename: file.name,
        data: json,
        date: new Date().toISOString(),
        size: file.size,
        metadata: {
          rows: json.length,
          columns: Object.keys(json[0] || {}).length
        },
        lastOpened: new Date().toISOString(),
        customTitle: '',
        locked: false
      };

      setUploadHistory(prev => [newFile, ...prev]);
    };
    reader.readAsBinaryString(file);
  };

  const handleLoadArchiveFile = (file) => {
    // Update last opened timestamp
    setUploadHistory(prev => 
      prev.map(f => 
        f.id === file.id 
          ? { ...f, lastOpened: new Date().toISOString() }
          : f
      )
    );

    // Load the file
    setData(file.data);
    setActiveSection('table');
  };

  const handleRenameArchive = (id, newTitle) => {
    setUploadHistory(prev =>
      prev.map(file =>
        file.id === id
          ? { ...file, customTitle: newTitle }
          : file
      )
    );
  };

  // File uploader component
  const FileUploader = () => (
    <div className="bg-gray-50 dark:bg-dark-200 p-5 rounded-xl shadow-smooth dark:shadow-smooth-dark mb-6 transition-all duration-200">
      <div className="flex items-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-500 dark:text-primary-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Загрузите Excel-файл</span>
      </div>
      <label className="flex flex-col items-center px-4 py-6 bg-white dark:bg-dark-300 rounded-lg cursor-pointer border-2 border-dashed border-gray-300 dark:border-dark-400 hover:border-primary-400 dark:hover:border-primary-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-dark-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm text-gray-500 dark:text-dark-600 text-center">
          Перетащите сюда файл или кликните для выбора
          <br />
          <span className="text-xs">(Поддерживаются форматы .xlsx, .xls)</span>
        </span>
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          onChange={handleFileUpload} 
          className="hidden" 
        />
      </label>
    </div>
  );

  // Archive content component
  const ArchiveContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
          <span className="mr-2">📁</span>
          Архив файлов
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {uploadHistory.length} файлов
        </span>
      </div>
      
      {uploadHistory.map((file) => (
        <ArchiveItem
          key={file.id}
          file={file}
          onLoad={handleLoadArchiveFile}
          onRename={handleRenameArchive}
        />
      ))}
      
      {uploadHistory.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-dark-200 rounded-xl shadow-smooth dark:shadow-smooth-dark">
          <span className="text-4xl mb-4 block">📂</span>
          <p className="text-gray-500 dark:text-gray-400">
            Нет загруженных файлов
          </p>
        </div>
      )}
    </div>
  );

  // Main content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'charts':
        return (
          <>
            <FileUploader />
            {data.length > 0 ? (
              <div className="rounded-xl overflow-hidden shadow-smooth-lg dark:shadow-smooth-dark bg-white dark:bg-dark-200 transition-all duration-200">
                <BarChartComponent data={data} />
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-200 p-8 rounded-xl shadow-smooth dark:shadow-smooth-dark flex flex-col items-center justify-center text-center h-64 transition-all duration-200">
                <svg className="w-16 h-16 text-gray-300 dark:text-dark-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 dark:text-dark-600">
                  Загрузите Excel-файл для отображения графиков
                </p>
              </div>
            )}
          </>
        );
      case 'table':
        return (
          <>
            <FileUploader />
            {data.length > 0 ? (
              <div className="rounded-xl overflow-hidden shadow-smooth-lg dark:shadow-smooth-dark bg-white dark:bg-dark-200 transition-all duration-200">
                <DataTable data={data} />
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-200 p-8 rounded-xl shadow-smooth dark:shadow-smooth-dark flex flex-col items-center justify-center text-center h-64 transition-all duration-200">
                <svg className="w-16 h-16 text-gray-300 dark:text-dark-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 dark:text-dark-600">
                  Загрузите Excel-файл для отображения таблицы
                </p>
              </div>
            )}
          </>
        );
      case 'archive':
        return <ArchiveContent />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 ease-in-out">
      {/* Sidebar */}
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main content */}
      <div className="md:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="border-b border-gray-200 dark:border-dark-300 p-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center">
              <span className="mr-2">📊</span>
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-500 dark:to-primary-300 bg-clip-text text-transparent">
                RWB Dashboard
              </span>
            </h1>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-full bg-white dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-400 shadow-smooth dark:shadow-smooth-dark transition-all duration-300 flex items-center"
            >
              <span className="mr-2">{isDark ? "🌞" : "🌙"}</span>
              <span className="text-sm font-medium">{isDark ? "Светлая тема" : "Тёмная тема"}</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-6xl mx-auto p-4 sm:p-6">
          {renderContent()}
        </main>
      </div>

      {/* Assistant button */}
      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-full flex items-center justify-center text-white shadow-smooth-lg dark:shadow-smooth-dark z-50 transition-all duration-400 ease-in-out-quart"
        title="Открыть помощника"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Assistant panel */}
      <AssistantPanel
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        data={data}
      />
      
      {/* Export panel */}
      <ExportPanel data={data} />
    </div>
  );
}
