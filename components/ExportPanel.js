import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { motion, AnimatePresence } from 'framer-motion';

const formatOptions = [
  { id: 'excel', label: 'Excel', icon: '📊', action: 'exportToExcel' },
  { id: 'pdf', label: 'PDF', icon: '📄', action: 'exportToPDF' },
  { id: 'csv', label: 'CSV', icon: '🧾', action: 'exportToCSV' }
];

const STORAGE_KEYS = {
  EXPANDED: 'rwb_export_panel_expanded',
  LAST_FORMAT: 'rwb_export_last_format'
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

export default function ExportPanel({ data = [] }) {
  const [isExpanded, setIsExpanded] = useState(true); // Default to true
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [activeFormat, setActiveFormat] = useState(null); // Default to null
  const dropdownRef = useRef(null);

  // Initialize state from localStorage after mount
  useEffect(() => {
    const savedExpanded = getLocalStorage(STORAGE_KEYS.EXPANDED, true);
    const savedFormat = getLocalStorage(STORAGE_KEYS.LAST_FORMAT, null);
    setIsExpanded(savedExpanded);
    setActiveFormat(savedFormat);
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.EXPANDED, isExpanded);
  }, [isExpanded]);

  // Save last used format to localStorage
  useEffect(() => {
    if (activeFormat) {
      setLocalStorage(STORAGE_KEYS.LAST_FORMAT, activeFormat);
    }
  }, [activeFormat]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    window.document.addEventListener('mousedown', handleClickOutside);
    return () => window.document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showErrorToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const exportToExcel = () => {
    try {
      setIsExporting(true);
      setActiveFormat('excel');
      
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      XLSX.writeFile(wb, "rwb_export.xlsx");
      
      setIsExporting(false);
      setActiveFormat(null);
    } catch (error) {
      console.error('Excel export error:', error);
      showErrorToast('Ошибка при экспорте в Excel');
      setIsExporting(false);
      setActiveFormat(null);
    }
  };

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      setActiveFormat('pdf');
      
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text("RWB Dashboard — Отчёт", 14, 15);
      
      doc.setFontSize(10);
      doc.text(`Дата: ${new Date().toLocaleDateString('ru-RU')}`, 14, 25);
      
      doc.autoTable({
        head: [Object.keys(data[0] || {})],
        body: data.map(item => Object.values(item)),
        startY: 35,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
        },
      });
      
      doc.save("rwb_report.pdf");
      
      setIsExporting(false);
      setActiveFormat(null);
    } catch (error) {
      console.error('PDF export error:', error);
      showErrorToast('Ошибка при экспорте в PDF');
      setIsExporting(false);
      setActiveFormat(null);
    }
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      setActiveFormat('csv');
      
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(data));
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'rwb_export.csv';
      link.click();
      
      setIsExporting(false);
      setActiveFormat(null);
    } catch (error) {
      console.error('CSV export error:', error);
      showErrorToast('Ошибка при экспорте в CSV');
      setIsExporting(false);
      setActiveFormat(null);
    }
  };

  const handleExport = (format) => {
    setShowDropdown(false);
    switch (format) {
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
    }
  };

  return (
    <div className="sticky bottom-4 left-1/2 -translate-x-1/2 z-40 sm:absolute sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white dark:bg-dark-200 rounded-xl shadow-md overflow-hidden"
      >
        {/* Toggle button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-400 flex items-center justify-between text-gray-700 dark:text-gray-300 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-2">
            {isExpanded ? '⬆️' : '⬇️'} Экспорт
          </span>
          <motion.span
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          >
            ▾
          </motion.span>
        </motion.button>

        {/* Export content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
              className="overflow-hidden"
            >
              <div className="p-3" ref={dropdownRef}>
                <div className="relative">
                  <motion.button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={!data.length || isExporting}
                    className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-lg">📤</span>
                    <span className="text-sm font-medium">
                      {isExporting ? 'Экспорт...' : 'Экспорт'}
                    </span>
                  </motion.button>

                  {/* Format dropdown */}
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-dark-200 rounded-lg shadow-lg overflow-hidden"
                      >
                        {formatOptions.map((format) => (
                          <motion.button
                            key={format.id}
                            onClick={() => handleExport(format.id)}
                            disabled={isExporting}
                            className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <span className="text-lg">{format.icon}</span>
                            <span className="text-sm">{format.label}</span>
                            {activeFormat === format.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="ml-auto"
                              >
                                <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg text-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 