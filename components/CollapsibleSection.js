import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollapsibleSection({ 
  title, 
  children, 
  defaultExpanded = true,
  onExpand,
  className = ''
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(defaultExpanded);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [defaultExpanded]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (newState && onExpand) {
      onExpand();
    }
  };

  return (
    <div className={`bg-white dark:bg-dark-200 rounded-lg shadow-lg overflow-hidden ${className}`}>
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-gray-50 dark:bg-dark-300 hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors"
      >
        <span className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
          {title}
        </span>
        <motion.span
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          className="text-gray-500 dark:text-gray-400"
        >
          ▾
        </motion.span>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            className="overflow-hidden"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 