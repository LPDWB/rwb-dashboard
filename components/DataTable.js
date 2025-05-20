import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { useSession, signIn, signOut } from 'next-auth/react';

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

// User Profile Component
const UserProfile = ({ user, onSignOut }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-dark-300 hover:bg-gray-200 dark:hover:bg-dark-400 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-gray-700 dark:text-gray-300">
          {user.name || user.email}
        </span>
        <span className="text-gray-500">▼</span>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-200 rounded-lg shadow-lg overflow-hidden"
          >
            <motion.button
              onClick={onSignOut}
              className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Выйти
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// AI Explanation Modal Component
const ExplanationModal = ({ isOpen, onClose, row, headers }) => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Try to get API key from environment or localStorage
      const storedKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || 
                       (typeof window !== 'undefined' ? localStorage.getItem('huggingface_api_key') : '');
      setApiKey(storedKey);
      
      if (storedKey) {
        generateExplanation(row, storedKey);
      } else {
        setError('API ключ не найден');
        setIsLoading(false);
      }
    }
  }, [isOpen, row]);

  const generateExplanation = async (row, key) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: `Поясни строку таблицы:\n${JSON.stringify(row, null, 2)}`,
          options: { wait_for_model: true }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка при получении ответа от модели');
      }

      const data = await response.json();
      if (!data || !data[0] || !data[0].generated_text) {
        throw new Error('Неверный формат ответа от модели');
      }

      setExplanation(data[0].generated_text);
    } catch (error) {
      console.error('Hugging Face API error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (apiKey) {
      generateExplanation(row, apiKey);
    }
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('huggingface_api_key', apiKey.trim());
      generateExplanation(row, apiKey.trim());
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-dark-200 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-dark-300 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Пояснение строки
              </h3>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-8rem)]">
              {/* Row Data */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Данные строки:
                </h4>
                <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-3 overflow-x-auto">
                  <pre className="text-sm text-gray-600 dark:text-gray-400">
                    {JSON.stringify(row, null, 2)}
                  </pre>
                </div>
              </div>

              {/* API Key Input (if not set) */}
              {!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY && !localStorage.getItem('huggingface_api_key') && (
                <form onSubmit={handleApiKeySubmit} className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Введите Hugging Face API ключ"
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-dark-300 border-0 ring-1 ring-gray-200 dark:ring-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowHelp(!showHelp)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ℹ️
                      </motion.button>
                    </div>
                    <motion.button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Сохранить
                    </motion.button>
                  </div>

                  {/* Help Tooltip */}
                  <AnimatePresence>
                    {showHelp && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute mt-2 p-4 bg-white dark:bg-dark-300 rounded-lg shadow-lg border border-gray-200 dark:border-dark-400 max-w-md z-50"
                      >
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                          🔐 Как получить Hugging Face API-ключ:
                        </h4>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li>
                            Перейдите на{' '}
                            <a
                              href="https://huggingface.co/join"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                            >
                              https://huggingface.co/join
                            </a>
                          </li>
                          <li>Зарегистрируйтесь (можно через Google)</li>
                          <li>Перейдите в Settings → Access Tokens</li>
                          <li>Нажмите кнопку "New token"</li>
                          <li>Выберите Read (доступ "только для чтения")</li>
                          <li>Скопируйте ключ и вставьте его сюда</li>
                        </ol>
                        <motion.button
                          onClick={() => setShowHelp(false)}
                          className="mt-3 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Закрыть
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Получите API ключ на{' '}
                    <a 
                      href="https://huggingface.co/settings/tokens" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      huggingface.co/settings/tokens
                    </a>
                  </p>
                </form>
              )}

              {/* AI Explanation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    AI-Пояснение:
                  </h4>
                  {!isLoading && !error && (
                    <motion.button
                      onClick={handleRetry}
                      className="text-sm text-gray-500 hover:text-primary-500 dark:hover:text-primary-400 flex items-center gap-1"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span>🔄</span>
                      <span>Сгенерировать снова</span>
                    </motion.button>
                  )}
                </div>
                <div className="bg-gray-50 dark:bg-dark-300 rounded-lg p-3">
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full"
                      />
                      <span>Генерация пояснения...</span>
                    </div>
                  ) : error ? (
                    <div className="text-red-500 dark:text-red-400">
                      {error}
                    </div>
                  ) : (
                    <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {explanation}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-dark-300 flex justify-end">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Закрыть
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function DataTable({ data }) {
  const { data: session, status } = useSession();
  const [headers, setHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const itemsPerPage = 10;

  // Save user info to localStorage when session changes
  useEffect(() => {
    if (session?.user) {
      localStorage.setItem('user', JSON.stringify({
        name: session.user.name,
        email: session.user.email
      }));
    }
  }, [session]);

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

  // Handle row explanation
  const handleRowExplanation = (row) => {
    setSelectedRow(row);
    setShowExplanation(true);
  };

  if (!data || !data.length) return null;

  return (
    <div className="w-full">
      {/* Search, Export, and Auth panel */}
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

          {status === 'authenticated' ? (
            <UserProfile user={session.user} onSignOut={() => signOut()} />
          ) : (
            <motion.button
              onClick={() => signIn('google')}
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2 text-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Войти
            </motion.button>
          )}
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
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-300">
            <AnimatePresence mode="popLayout">
              {currentData.map((row, rowIndex) => (
                <motion.tr 
                  key={rowIndex} 
                  className="group bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
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
                  <td className="px-6 py-4 whitespace-nowrap">
                    <motion.button
                      onClick={() => handleRowExplanation(row)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-primary-500 dark:hover:text-primary-400"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🤖
                    </motion.button>
                  </td>
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

      {/* Explanation Modal */}
      <ExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        row={selectedRow}
        headers={headers}
      />
    </div>
  );
} 