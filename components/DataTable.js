import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';

const STORAGE_KEYS = {
  SORT_CONFIG: 'rwb_table_sort_config',
  SEARCH_TERM: 'rwb_table_search_term'
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

export default function DataTable({ data }) {
  const [headers, setHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const itemsPerPage = 10;

  // Initialize state from localStorage after mount
  useEffect(() => {
    const savedSortConfig = getLocalStorage(STORAGE_KEYS.SORT_CONFIG, { key: null, direction: 'asc' });
    const savedSearchTerm = getLocalStorage(STORAGE_KEYS.SEARCH_TERM, '');
    setSortConfig(savedSortConfig);
    setSearchTerm(savedSearchTerm);
  }, []);

  // Save state to localStorage
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.SORT_CONFIG, sortConfig);
  }, [sortConfig]);

  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.SEARCH_TERM, searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (data && data.length > 0) {
      setHeaders(Object.keys(data[0]));
      setCurrentPage(1);
    }
  }, [data]);

  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Handle export
  const handleExport = () => {
    try {
      setIsExporting(true);
      
      // Create worksheet from filtered and sorted data
      const ws = XLSX.utils.json_to_sheet(processedData);
      
      // Create workbook and add worksheet
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      
      // Generate and download file
      XLSX.writeFile(wb, 'filtered_export.xlsx');
      
      showToastMessage('Экспорт завершён');
    } catch (error) {
      console.error('Export error:', error);
      showToastMessage('Ошибка при экспорте');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        key = null;
        direction = 'asc';
      }
    }
    setSortConfig({ key, direction });
  };

  // Process data with filtering and sorting
  const processedData = useMemo(() => {
    let result = [...(data || [])];
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply sorting
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle numeric values
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return sortConfig.direction === 'asc' 
            ? Number(aValue) - Number(bValue) 
            : Number(bValue) - Number(aValue);
        }
        
        // Handle string values
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [data, searchTerm, sortConfig]);

  // Get current page data
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(processedData.length / itemsPerPage));

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Previous button
    items.push(
      <motion.button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ←
      </motion.button>
    );
    
    // First page
    if (startPage > 1) {
      items.push(
        <motion.button
          key="1"
          onClick={() => setCurrentPage(1)}
          className="px-3 py-1 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          1
        </motion.button>
      );
      if (startPage > 2) {
        items.push(<span key="ellipsis-start" className="px-1 text-gray-500">...</span>);
      }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <motion.button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded-md text-sm transition-colors ${
            currentPage === i 
              ? 'bg-primary-500 text-white' 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {i}
        </motion.button>
      );
    }
    
    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<span key="ellipsis-end" className="px-1 text-gray-500">...</span>);
      }
      items.push(
        <motion.button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className="px-3 py-1 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {totalPages}
        </motion.button>
      );
    }
    
    // Next button
    items.push(
      <motion.button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        →
      </motion.button>
    );
    
    return items;
  };

  if (!data || !data.length) return null;

  return (
    <div className="w-full">
      {/* Search and Export panel */}
      <div className="p-4 bg-white dark:bg-dark-200 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-dark-300">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Поиск в таблице..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-300 border-0 ring-1 ring-gray-200 dark:ring-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            Найдено: <span className="font-medium">{processedData.length}</span>
            {processedData.length !== data.length && (
              <> из <span className="font-medium">{data.length}</span></>
            )}
          </div>
          <motion.button
            onClick={handleExport}
            disabled={isExporting || processedData.length === 0}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={processedData.length === 0 ? 'Нет данных для экспорта' : 'Экспорт текущих данных'}
          >
            <span>📤</span>
            <span>{isExporting ? 'Экспорт...' : 'Экспорт'}</span>
          </motion.button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="sticky top-0 text-xs uppercase bg-gray-50 dark:bg-dark-300 text-gray-600 dark:text-gray-300 select-none">
            <tr>
              {headers.map((header, index) => (
                <th 
                  key={index} 
                  className="px-6 py-4 whitespace-nowrap transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-400"
                  onClick={() => handleSort(header)}
                >
                  <div className="flex items-center gap-2">
                    <span>{header}</span>
                    {sortConfig.key === header && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-primary-500"
                      >
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-300">
            <AnimatePresence mode="popLayout">
              {currentData.map((row, rowIndex) => (
                <motion.tr 
                  key={rowIndex} 
                  className="bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: rowIndex * 0.03 }}
                >
                  {headers.map((header, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                      {row[header]?.toString() || ''}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* No results message */}
      {processedData.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-8 px-4 text-center text-gray-500 dark:text-gray-400"
        >
          Ничего не найдено. Попробуйте изменить условия поиска.
        </motion.div>
      )}

      {/* Pagination */}
      {processedData.length > 0 && (
        <div className="p-4 flex justify-center items-center gap-2 bg-white dark:bg-dark-200 border-t border-gray-100 dark:border-dark-300">
          {getPaginationItems()}
        </div>
      )}

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
    </div>
  );
} 