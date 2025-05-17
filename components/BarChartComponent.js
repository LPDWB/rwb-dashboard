import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BarChartComponent({ data, defaultColumn = '' }) {
  const [selectedColumn, setSelectedColumn] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Определение доступных числовых колонок
  useEffect(() => {
    if (data && data.length > 0) {
      const numericColumns = Object.keys(data[0]).filter(key => 
        !isNaN(Number(data[0][key])) || 
        (typeof data[0][key] === 'string' && !isNaN(Number(data[0][key].replace(/[,\s]/g, ''))))
      );
      setAvailableColumns(numericColumns);
      
      if (numericColumns.length > 0) {
        if (defaultColumn && numericColumns.includes(defaultColumn)) {
          setSelectedColumn(defaultColumn);
        } else {
          setSelectedColumn(numericColumns[0]);
        }
      }
    }
  }, [data, defaultColumn]);

  // Подготовка данных для графика
  useEffect(() => {
    if (data && data.length > 0 && selectedColumn) {
      const aggregatedData = {};
      
      data.forEach(item => {
        // Получаем категорию (берем первое поле, отличное от выбранной колонки)
        const categoryKey = Object.keys(item).find(key => key !== selectedColumn) || 'Категория';
        const category = item[categoryKey] ? String(item[categoryKey]).slice(0, 20) : 'Другое';
        
        // Получаем числовое значение
        let value = 0;
        if (item[selectedColumn]) {
          if (typeof item[selectedColumn] === 'string') {
            value = parseFloat(item[selectedColumn].replace(/[,\s]/g, '')) || 0;
          } else {
            value = Number(item[selectedColumn]) || 0;
          }
        }

        // Суммируем данные
        if (!aggregatedData[category]) {
          aggregatedData[category] = { name: category, value: 0 };
        }
        aggregatedData[category].value += value;
      });

      // Преобразуем в массив и сортируем по убыванию значений
      const chartData = Object.values(aggregatedData)
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Ограничиваем топ-10 для читаемости
      
      setChartData(chartData);
    }
  }, [data, selectedColumn]);

  const handleColumnChange = (e) => {
    setSelectedColumn(e.target.value);
  };

  if (!data || !data.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
      <div className="mb-4 flex flex-wrap items-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mr-4">Диаграмма данных</h2>
        {availableColumns.length > 0 && (
          <div className="flex items-center">
            <label className="mr-2 text-sm text-gray-600 dark:text-gray-400">Колонка:</label>
            <select 
              value={selectedColumn}
              onChange={handleColumnChange}
              className="px-2 py-1 text-sm border border-gray-300 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              {availableColumns.map(column => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat().format(value)} />
              <Legend />
              <Bar 
                dataKey="value" 
                name={selectedColumn} 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex justify-center items-center h-40 text-gray-500 dark:text-gray-400">
          Нет подходящих данных для построения графика
        </div>
      )}
    </div>
  );
} 