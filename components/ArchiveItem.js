import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const STORAGE_KEYS = {
  LOCKED_ARCHIVES: 'rwb_locked_archives'
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

export default function ArchiveItem({ file, onLoad, onRename }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customTitle, setCustomTitle] = useState(file.customTitle || '');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const exportDropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize lock state from localStorage after mount
  useEffect(() => {
    const lockedArchives = getLocalStorage(STORAGE_KEYS.LOCKED_ARCHIVES, []);
    setIsLocked(lockedArchives.includes(file.id));
  }, [file.id]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleClickOutside = (event) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setShowExportDropdown(false);
      }
    };

    window.document.addEventListener('mousedown', handleClickOutside);
    return () => window.document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRename = () => {
    if (customTitle.trim()) {
      onRename(file.id, customTitle.trim());
      setIsEditing(false);
      showToastMessage('Название архива обновлено');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleRename();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setCustomTitle(file.customTitle || '');
    }
  };

  const toggleLock = () => {
    const lockedArchives = getLocalStorage(STORAGE_KEYS.LOCKED_ARCHIVES, []);
    const newLockedState = !isLocked;
    
    if (newLockedState) {
      lockedArchives.push(file.id);
    } else {
      const index = lockedArchives.indexOf(file.id);
      if (index > -1) {
        lockedArchives.splice(index, 1);
      }
    }
    
    setLocalStorage(STORAGE_KEYS.LOCKED_ARCHIVES, lockedArchives);
    setIsLocked(newLockedState);
    showToastMessage(newLockedState ? 'Архив защищён' : 'Защита снята');
  };

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      const doc = new jsPDF();
      
      doc.setFontSize(16);
      doc.text(`${file.customTitle || file.filename} — Отчёт`, 14, 15);
      
      doc.setFontSize(10);
      doc.text(`Дата загрузки: ${formatDate(file.date)}`, 14, 25);
      doc.text(`Последнее открытие: ${file.lastOpened ? formatDate(file.lastOpened) : 'N/A'}`, 14, 30);
      doc.text(`Размер: ${formatSize(file.size)}`, 14, 35);
      
      doc.autoTable({
        head: [Object.keys(file.data[0] || {})],
        body: file.data.map(item => Object.values(item)),
        startY: 45,
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
      
      doc.save(`${file.customTitle || file.filename}.pdf`);
      showToastMessage('Экспорт в PDF завершён');
    } catch (error) {
      console.error('PDF export error:', error);
      showToastMessage('Ошибка при экспорте в PDF');
    } finally {
      setIsExporting(false);
      setShowExportDropdown(false);
    }
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      const ws = XLSX.utils.json_to_sheet(file.data);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${file.customTitle || file.filename}.csv`;
      link.click();
      showToastMessage('Экспорт в CSV завершён');
    } catch (error) {
      console.error('CSV export error:', error);
      showToastMessage('Ошибка при экспорте в CSV');
    } finally {
      setIsExporting(false);
      setShowExportDropdown(false);
    }
  };

  return (
    <motion.div
      layout
      className="bg-white dark:bg-dark-200 rounded-xl shadow-smooth dark:shadow-smooth-dark overflow-hidden"
    >
      {/* Header */}
      <motion.button
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div className="text-left">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleRename}
                className="font-medium text-gray-800 dark:text-gray-200 bg-transparent border-b border-primary-500 focus:outline-none focus:border-primary-600"
                placeholder={file.filename}
              />
            ) : (
              <h4 className="font-medium text-gray-800 dark:text-gray-200">
                {file.customTitle || file.filename}
              </h4>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(file.date)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatSize(file.size)}
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="text-gray-400"
          >
            ▾
          </motion.div>
        </div>
      </motion.button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-gray-100 dark:border-dark-300 space-y-3">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Строк:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {file.metadata?.rows || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Колонок:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {file.metadata?.columns || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Последнее открытие:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {file.lastOpened ? formatDate(file.lastOpened) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Размер:</span>
                  <span className="ml-2 text-gray-700 dark:text-gray-300">
                    {formatSize(file.size)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2">
                <motion.button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-400 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>✏️</span>
                  <span>Переименовать</span>
                </motion.button>

                <div className="relative" ref={exportDropdownRef}>
                  <motion.button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    disabled={isExporting}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>📤</span>
                    <span>{isExporting ? 'Экспорт...' : 'Экспорт'}</span>
                  </motion.button>

                  <AnimatePresence>
                    {showExportDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-dark-200 rounded-lg shadow-lg overflow-hidden"
                      >
                        <motion.button
                          onClick={exportToPDF}
                          disabled={isExporting}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>📄</span>
                          <span>PDF</span>
                        </motion.button>
                        <motion.button
                          onClick={exportToCSV}
                          disabled={isExporting}
                          className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300 transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span>📊</span>
                          <span>CSV</span>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  onClick={toggleLock}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${
                    isLocked
                      ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-dark-300 dark:hover:bg-dark-400 text-gray-700 dark:text-gray-300'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  title={isLocked ? 'Архив защищён от удаления' : 'Защитить архив'}
                >
                  <span>{isLocked ? '🔒' : '🔓'}</span>
                  <span>{isLocked ? 'Защищён' : 'Защитить'}</span>
                </motion.button>

                <motion.button
                  onClick={() => onLoad(file)}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🔄</span>
                  <span>Загрузить</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 