import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import UserMenu from '../components/UserMenu';
import Sidebar from "../components/Sidebar";

// Dynamically import components that use browser APIs
const DataTableDynamic = dynamic(() => import('../components/DataTable'), {
  ssr: false,
  loading: () => <div>Loading table...</div>
});

const BarChartComponent = dynamic(() => import('../components/BarChartComponent'), {
  ssr: false,
  loading: () => <div>Loading chart...</div>
});

const AssistantPanel = dynamic(() => import('../components/AssistantPanel'), {
  ssr: false,
  loading: () => <div>Loading assistant...</div>
});

const ExportPanel = dynamic(() => import('../components/ExportPanel'), {
  ssr: false,
  loading: () => <div>Loading export panel...</div>
});

const ArchiveItem = dynamic(() => import('../components/ArchiveItem'), {
  ssr: false,
  loading: () => <div>Loading archive...</div>
});

const STORAGE_KEYS = {
  ACTIVE_SECTION: 'rwb_active_section',
  UPLOAD_HISTORY: 'rwb_upload_history'
};

// Helper function to safely access localStorage
const getLocalStorage = (key, defaultValue) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

// Helper function to safely set localStorage
const setLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage:', error);
  }
};

export default function Home() {
  const { data: session, status } = useSession();
  const [data, setData] = useState([]);
  const [isDark, setIsDark] = useState(false);
  const [activeSection, setActiveSection] = useState('charts');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle mounting state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize state from localStorage after mount
  useEffect(() => {
    if (!mounted) return;
    
    const savedSection = getLocalStorage(STORAGE_KEYS.ACTIVE_SECTION, 'charts');
    const savedHistory = getLocalStorage(STORAGE_KEYS.UPLOAD_HISTORY, []);
    setActiveSection(savedSection);
    setUploadHistory(savedHistory);
    setIsLoading(false);
  }, [mounted]);

  // Save active section to localStorage
  useEffect(() => {
    if (!isLoading && mounted) {
      setLocalStorage(STORAGE_KEYS.ACTIVE_SECTION, activeSection);
    }
  }, [activeSection, isLoading, mounted]);

  // Save upload history to localStorage
  useEffect(() => {
    if (!isLoading && mounted) {
      setLocalStorage(STORAGE_KEYS.UPLOAD_HISTORY, uploadHistory);
    }
  }, [uploadHistory, isLoading, mounted]);

  // Theme handling
  useEffect(() => {
    if (!mounted) return;
    
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark, mounted]);

  // Theme preferences
  useEffect(() => {
    if (!mounted) return;

    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    } else if (savedTheme === "light") {
      setIsDark(false);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, [mounted]);

  const toggleTheme = () => {
    if (!mounted) return;
    
    const newTheme = !isDark;
    setIsDark(newTheme);
    window.localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const handleFileUpload = (e) => {
    if (!mounted) return;
    
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
    if (!mounted) return;
    
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
    if (!mounted) return;
    
    setUploadHistory(prev =>
      prev.map(file =>
        file.id === id
          ? { ...file, customTitle: newTitle }
          : file
      )
    );
  };

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Загрузка...
          </h1>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
            Пожалуйста, войдите в систему
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                RWB Dashboard
              </h1>
              <UserMenu />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-600 dark:text-gray-300">
                Добро пожаловать, {session.user?.name || 'Пользователь'}!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
