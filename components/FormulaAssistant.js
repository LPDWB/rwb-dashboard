import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      type: "spring",
      damping: 25,
      stiffness: 350,
      ease: [0.76, 0, 0.24, 1]
    }
  }
};

export default function FormulaAssistant({ onMount }) {
  const [input, setInput] = useState('');
  const [formula, setFormula] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (onMount && inputRef.current) {
      inputRef.current.focus();
    }
  }, [onMount]);

  const generateFormula = (text) => {
    const lowerText = text.toLowerCase();
    
    // Check for "суммируй" and column name
    if (lowerText.includes('суммируй') && lowerText.includes('колонк')) {
      // Extract column name from the input
      const columnMatch = text.match(/['"]([^'"]+)['"]/);
      if (columnMatch) {
        return '=SUM(B2:B101)'; // Placeholder formula
      }
    }
    
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsGenerating(true);
    
    // Simulate processing delay
    setTimeout(() => {
      const generatedFormula = generateFormula(input);
      setFormula(generatedFormula || "Пожалуйста, уточните, что нужно сделать. Например: Суммируй колонку 'Количество'.");
      setIsGenerating(false);
      
      if (generatedFormula) {
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 2000);
      }
    }, 500);
  };

  const handleCopy = () => {
    if (formula && !formula.includes('Пожалуйста')) {
      navigator.clipboard.writeText(formula);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-dark-200 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4 flex items-center">
        <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        Генератор формул
      </h3>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите команду, например: Суммируй колонку 'Количество'"
            className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-dark-300 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <motion.button
            type="submit"
            disabled={isGenerating}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
              animate={isGenerating ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              {isGenerating ? '⚡' : '✨'}
            </motion.span>
            <span>{isGenerating ? 'Генерация...' : 'Сгенерировать формулу'}</span>
          </motion.button>
        </div>
      </form>

      <AnimatePresence>
        {formula && (
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            className="relative"
          >
            <div className={`p-4 rounded-lg transition-colors duration-700 ${
              formula.includes('Пожалуйста') 
                ? 'bg-gray-50 dark:bg-dark-300 text-gray-600 dark:text-gray-400'
                : isHighlighted
                  ? 'bg-green-100 dark:bg-green-900/20 text-gray-800 dark:text-gray-200 border border-green-200 dark:border-green-800'
                  : 'bg-primary-50 dark:bg-primary-900/20 text-gray-800 dark:text-gray-200 border border-primary-100 dark:border-primary-800'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <code className="font-mono text-sm whitespace-pre-wrap break-all">
                  {formula}
                </code>
                {!formula.includes('Пожалуйста') && (
                  <motion.button
                    onClick={handleCopy}
                    className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {showCopied ? (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 