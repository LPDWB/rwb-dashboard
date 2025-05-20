import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEYS = {
  LAST_PROMPT: 'rwb_formula_last_prompt',
  LAST_FORMULA: 'rwb_formula_last_result'
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

  // Initialize state from localStorage after mount
  useEffect(() => {
    const savedPrompt = getLocalStorage(STORAGE_KEYS.LAST_PROMPT, '');
    const savedFormula = getLocalStorage(STORAGE_KEYS.LAST_FORMULA, '');
    setInput(savedPrompt);
    setFormula(savedFormula);
  }, []);

  // Save input to localStorage
  useEffect(() => {
    if (input) {
      setLocalStorage(STORAGE_KEYS.LAST_PROMPT, input);
    }
  }, [input]);

  // Save formula to localStorage
  useEffect(() => {
    if (formula) {
      setLocalStorage(STORAGE_KEYS.LAST_FORMULA, formula);
    }
  }, [formula]);

  // Focus input on mount if requested
  useEffect(() => {
    if (onMount && inputRef.current) {
      inputRef.current.focus();
    }
  }, [onMount]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsGenerating(true);
    setIsHighlighted(false);

    // Simulate formula generation
    setTimeout(() => {
      const generatedFormula = `=IF(AND(A1>0, B1>0), A1*B1, "Пожалуйста, введите положительные числа")`;
      setFormula(generatedFormula);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    if (typeof window === 'undefined') return;
    
    navigator.clipboard.writeText(formula).then(() => {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Опишите, какую формулу вы хотите создать..."
            className="w-full px-4 py-2 bg-gray-50 dark:bg-dark-300 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
          />
          <motion.button
            type="submit"
            disabled={isGenerating || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            {isGenerating ? 'Генерация...' : 'Создать'}
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
                <motion.button
                  onClick={handleCopy}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-dark-400 rounded-md transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showCopied ? '✅' : '📋'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 