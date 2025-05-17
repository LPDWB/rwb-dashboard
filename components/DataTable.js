import { useState, useEffect, useMemo } from 'react';

export default function DataTable({ data }) {
  const [headers, setHeaders] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setHeaders(Object.keys(data[0]));
    }
  }, [data]);

  // Мемоизируем данные, чтобы не вычислять повторно при каждом ререндере
  const tableData = useMemo(() => {
    return data || [];
  }, [data]);

  if (!tableData.length) return null;

  return (
    <div className="w-full overflow-x-auto shadow-md rounded-lg">
      <div className="max-h-[450px] overflow-y-auto">
        <table className="w-full table-auto text-sm text-left">
          <thead className="sticky top-0 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-300">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-3 whitespace-nowrap">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
            {tableData.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {headers.map((header, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    {row[header]?.toString() || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 