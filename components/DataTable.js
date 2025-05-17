import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

export default function DataTable({ data }) {
  const [headers, setHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  useEffect(() => {
    if (data && data.length > 0) {
      setHeaders(Object.keys(data[0]));
      // Сбрасываем страницу при изменении данных
      setCurrentPage(1);
    }
  }, [data]);

  // Сортировка данных
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Фильтрация, сортировка и пагинация данных
  const filteredData = useMemo(() => {
    let processedData = data || [];
    
    // Фильтрация
    if (searchTerm) {
      processedData = processedData.filter(row => 
        headers.some(header => {
          const value = row[header];
          return value !== null && 
                 value !== undefined && 
                 String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }
    
    // Сортировка
    if (sortConfig.key) {
      processedData = [...processedData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Проверка на числовые значения
        if (!isNaN(Number(aValue)) && !isNaN(Number(bValue))) {
          return sortConfig.direction === 'asc' 
            ? Number(aValue) - Number(bValue) 
            : Number(bValue) - Number(aValue);
        }
        
        // Строковое сравнение
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return processedData;
  }, [data, headers, searchTerm, sortConfig]);

  // Данные текущей страницы
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Общее количество страниц
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  // Генерация элементов пагинации
  const getPaginationItems = () => {
    const items = [];
    const maxButtons = 5; // Максимальное количество кнопок страниц
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    // Кнопка "предыдущая страница"
    items.push(
      <button
        key="prev"
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition"
      >
        ← Пред
      </button>
    );
    
    // Первая страница и многоточие
    if (startPage > 1) {
      items.push(
        <button
          key="1"
          onClick={() => setCurrentPage(1)}
          className={`px-3 py-1 text-sm rounded-md ${
            currentPage === 1 ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300'
          } transition`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        items.push(<span key="ellipsis-start" className="px-1 text-gray-500">...</span>);
      }
    }
    
    // Номера страниц
    for (let i = startPage; i <= endPage; i++) {
      if (i === 1 || i === totalPages) continue; // Пропускаем, так как они отдельно
      items.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 text-sm rounded-md ${
            currentPage === i ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300'
          } transition`}
        >
          {i}
        </button>
      );
    }
    
    // Последняя страница и многоточие
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(<span key="ellipsis-end" className="px-1 text-gray-500">...</span>);
      }
      items.push(
        <button
          key={totalPages}
          onClick={() => setCurrentPage(totalPages)}
          className={`px-3 py-1 text-sm rounded-md ${
            currentPage === totalPages ? 'bg-primary-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300'
          } transition`}
        >
          {totalPages}
        </button>
      );
    }
    
    // Кнопка "следующая страница"
    items.push(
      <button
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-300 transition"
      >
        След →
      </button>
    );
    
    return items;
  };

  if (!data || !data.length) return null;

  return (
    <div className="w-full">
      {/* Панель поиска */}
      <div className="p-4 bg-white dark:bg-dark-200 flex flex-wrap items-center justify-between mb-2 border-b border-gray-100 dark:border-dark-300">
        <div className="relative w-full sm:w-auto mb-2 sm:mb-0">
          <input
            type="text"
            placeholder="Поиск в таблице..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg bg-gray-50 dark:bg-dark-300 border-0 ring-1 ring-gray-200 dark:ring-dark-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300"
          />
          <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Найдено записей: <span className="font-medium">{filteredData.length}</span>
          {filteredData.length !== data.length && (
            <> из <span className="font-medium">{data.length}</span></>
          )}
        </div>
      </div>

      {/* Таблица */}
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
                  <div className="flex items-center">
                    {header}
                    {sortConfig.key === header && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="ml-1"
                      >
                        {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                      </motion.span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-300">
            {currentData.map((row, rowIndex) => (
              <motion.tr 
                key={rowIndex} 
                className="bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: rowIndex * 0.03 }}
              >
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {row[header]?.toString() || ''}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>

        {/* Сообщение, если нет результатов */}
        {filteredData.length === 0 && (
          <div className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
            Ничего не найдено. Попробуйте изменить условия поиска.
          </div>
        )}
      </div>

      {/* Пагинация */}
      {filteredData.length > 0 && (
        <div className="p-4 flex justify-center items-center gap-1 bg-white dark:bg-dark-200 border-t border-gray-100 dark:border-dark-300">
          {getPaginationItems()}
        </div>
      )}
    </div>
  );
} 