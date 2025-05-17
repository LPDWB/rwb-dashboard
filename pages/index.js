import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import DataTable from "../components/DataTable";
import BarChartComponent from "../components/BarChartComponent";
import Tabs from "../components/Tabs";
import AssistantPopup from "../components/AssistantPopup";

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

  // Устанавливаем предпочтения пользователя из локального хранилища или системных настроек
  useEffect(() => {
    // Проверяем сохраненные настройки
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
    } else if (savedTheme === "light") {
      setIsDark(false);
    } else {
      // Если нет сохраненных настроек, используем системные предпочтения
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
  }, []);

  // Сохраняем выбор темы в локальное хранилище
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
    };
    reader.readAsBinaryString(file);
  };

  // Компонент для загрузки файла
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

  // Компонент для графиков
  const ChartsContent = () => (
    <div className="transition-all duration-300 ease-in-out">
      <FileUploader />
      {data.length > 0 ? (
        <div className="rounded-xl overflow-hidden shadow-smooth-lg dark:shadow-smooth-dark bg-white dark:bg-dark-200 transition-all duration-200">
          <BarChartComponent data={data} />
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-200 p-8 rounded-xl shadow-smooth dark:shadow-smooth-dark flex flex-col items-center justify-center text-center h-64 transition-all duration-200">
          <svg className="w-16 h-16 text-gray-300 dark:text-dark-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 dark:text-dark-600">
            Загрузите Excel-файл для отображения графиков
          </p>
        </div>
      )}
    </div>
  );

  // Компонент для таблицы
  const TableContent = () => (
    <div className="transition-all duration-300 ease-in-out">
      <FileUploader />
      {data.length > 0 ? (
        <div className="rounded-xl overflow-hidden shadow-smooth-lg dark:shadow-smooth-dark bg-white dark:bg-dark-200 transition-all duration-200">
          <DataTable data={data} />
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-200 p-8 rounded-xl shadow-smooth dark:shadow-smooth-dark flex flex-col items-center justify-center text-center h-64 transition-all duration-200">
          <svg className="w-16 h-16 text-gray-300 dark:text-dark-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 dark:text-dark-600">
            Загрузите Excel-файл для отображения таблицы
          </p>
        </div>
      )}
    </div>
  );

  // Компонент для вкладки "Помощник"
  const AssistantContent = () => (
    <div className="transition-all duration-300 ease-in-out">
      <FileUploader />
      <div className="bg-white dark:bg-dark-200 p-6 rounded-xl shadow-smooth-lg dark:shadow-smooth-dark transition-all duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Помощник по анализу данных</h2>
        <p className="text-gray-600 dark:text-dark-600 mb-5">
          Здесь будут размещены подсказки и рекомендации по анализу загруженных данных.
        </p>
        <div className="p-5 bg-primary-50 dark:bg-dark-300 rounded-lg border border-primary-100 dark:border-dark-400">
          <div className="flex items-start">
            <svg className="w-5 h-5 mr-3 text-primary-500 dark:text-primary-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-primary-800 dark:text-primary-300">
              {data.length > 0 
                ? "Анализ данных выполняется. Рекомендации будут доступны в ближайшее время." 
                : "Загрузите Excel-файл, чтобы получить рекомендации по анализу данных."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-100 text-gray-900 dark:text-gray-100 p-4 sm:p-6 font-sans transition-colors duration-200 ease-in-out">
      {/* Шапка страницы */}
      <header className="border-b border-gray-200 dark:border-dark-300 pb-4 mb-6">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between items-center">
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

      {/* Контейнер для содержимого */}
      <main className="max-w-6xl mx-auto">
        {/* Вкладки сразу под шапкой */}
        <Tabs>
          <ChartsContent />
          <TableContent />
          <AssistantContent />
        </Tabs>
      </main>

      {/* Плавающая кнопка ассистента */}
      <AssistantPopup />
    </div>
  );
}
