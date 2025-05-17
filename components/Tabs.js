import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { 
      duration: 0.2 
    }
  }
};

export default function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState("Графики");
  const tabs = ["Графики", "Таблица", "Помощник"];
  
  const getTabContent = (tab) => {
    switch(tab) {
      case "Графики":
        return children[0] || null;
      case "Таблица":
        return children[1] || null;
      case "Помощник":
        return children[2] || null;
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Панель вкладок */}
      <div className="relative flex mb-6 bg-white dark:bg-dark-200 rounded-xl shadow-smooth dark:shadow-smooth-dark overflow-hidden transition-all duration-200 ease-in-out">
        {/* Контейнер для вкладок */}
        <div className="flex w-full">
          {tabs.map((tab, index) => (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-4 text-base font-medium focus:outline-none relative z-10 transition-all duration-200 ease-in-out ${
                activeTab === tab 
                  ? "text-primary-600 dark:text-primary-400" 
                  : "text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
              whileHover={{ y: -1 }}
              whileTap={{ y: 1 }}
            >
              <span className="relative z-10 flex items-center justify-center">
                {tab === "Графики" && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
                {tab === "Таблица" && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {tab === "Помощник" && (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tab}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Подчеркивание активной вкладки */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-200 dark:bg-dark-300" />
        <motion.div
          className="absolute bottom-0 h-[2px] bg-primary-500 dark:bg-primary-400"
          initial={false}
          animate={{
            left: `${(tabs.indexOf(activeTab)) * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>
      
      {/* Содержимое вкладок с анимацией */}
      <div className="relative min-h-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full"
          >
            {getTabContent(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
} 