import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEYS = {
  SIDEBAR_EXPANDED: 'rwb_sidebar_expanded'
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

const sections = [
  { id: 'charts', icon: '📊', label: 'Графики' },
  { id: 'table', icon: '📋', label: 'Таблица' },
  { id: 'archive', icon: '📁', label: 'Архив' }
];

export default function Sidebar({ activeSection, onSectionChange }) {
  const [isExpanded, setIsExpanded] = useState(true); // Default to true
  const [isMobile, setIsMobile] = useState(false);

  // Initialize expanded state from localStorage after mount
  useEffect(() => {
    const saved = getLocalStorage(STORAGE_KEYS.SIDEBAR_EXPANDED, true);
    setIsExpanded(saved);
  }, []);

  // Save expanded state to localStorage
  useEffect(() => {
    setLocalStorage(STORAGE_KEYS.SIDEBAR_EXPANDED, isExpanded);
  }, [isExpanded]);

  // Check for mobile view
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const sidebarVariants = {
    expanded: {
      width: '240px',
      transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] }
    },
    collapsed: {
      width: isMobile ? '0px' : '64px',
      transition: { duration: 0.3, ease: [0.76, 0, 0.24, 1] }
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isExpanded ? 'expanded' : 'collapsed'}
        className="fixed top-0 left-0 h-full bg-white dark:bg-dark-200 border-r border-gray-200 dark:border-dark-300 z-50 overflow-hidden"
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isExpanded ? '◀' : '▶'}
          </motion.div>
        </button>

        {/* Navigation sections */}
        <div className="pt-16 px-3 space-y-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => {
                onSectionChange(section.id);
                if (isMobile) setIsExpanded(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-50 dark:hover:bg-dark-300 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">{section.icon}</span>
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap"
                  >
                    {section.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed top-4 left-4 p-2 rounded-lg bg-white dark:bg-dark-200 shadow-lg z-50 md:hidden"
        >
          <span className="text-xl">☰</span>
        </button>
      )}
    </>
  );
} 