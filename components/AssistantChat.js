import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEYS = {
  CHAT_HISTORY: 'rwb_chat_history',
  ARCHIVE_PREFIX: 'rwb_archive_'
};

const DEFAULT_MESSAGES = [
  { role: 'assistant', content: 'Привет! Я могу помочь тебе интерпретировать данные из Excel. Просто задай вопрос.', time: new Date() }
];

const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

const messageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.4, 
      ease: [0.76, 0, 0.24, 1]
    }
  }
};

const analysisMessageVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
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

export default function AssistantChat({ data = [] }) {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [isTyping, setIsTyping] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showExpirationModal, setShowExpirationModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Initialize messages from localStorage after mount
  useEffect(() => {
    const saved = getLocalStorage(STORAGE_KEYS.CHAT_HISTORY, null);
    if (saved) {
      setMessages(saved.messages || DEFAULT_MESSAGES);
    }
  }, []);

  // Check for chat expiration on mount
  useEffect(() => {
    const saved = getLocalStorage(STORAGE_KEYS.CHAT_HISTORY, null);
    if (saved && saved.timestamp && !saved.archived) {
      const timeSinceLastUpdate = Date.now() - saved.timestamp;
      if (timeSinceLastUpdate > EXPIRATION_TIME) {
        setShowExpirationModal(true);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    const chatData = {
      messages,
      timestamp: Date.now(),
      archived: false
    };
    setLocalStorage(STORAGE_KEYS.CHAT_HISTORY, chatData);
  }, [messages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleArchive = () => {
    const archiveId = Date.now();
    const archiveData = {
      messages,
      archivedAt: new Date().toISOString(),
      title: `Чат от ${new Date().toLocaleDateString()}`
    };
    
    setLocalStorage(`${STORAGE_KEYS.ARCHIVE_PREFIX}${archiveId}`, archiveData);
    setMessages(DEFAULT_MESSAGES);
    setShowExpirationModal(false);
    showToastMessage('Чат успешно архивирован');
  };

  const handleDelete = () => {
    setMessages(DEFAULT_MESSAGES);
    setShowExpirationModal(false);
    showToastMessage('Чат удален');
  };

  const handleAnalyzeData = () => {
    setIsAnalyzing(true);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const analysisMessage = data.length > 0
        ? "Анализ данных показывает следующие результаты:\n\n" +
          "1. Общее количество записей: " + data.length + "\n" +
          "2. Основные статусы: " + [...new Set(data.map(item => item.status))].join(", ") + "\n" +
          "3. Период данных: " + new Date(Math.min(...data.map(item => new Date(item.date)))).toLocaleDateString() + 
          " - " + new Date(Math.max(...data.map(item => new Date(item.date)))).toLocaleDateString()
        : "Пожалуйста, загрузите Excel-файл для анализа данных.";
      
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: analysisMessage, time: new Date(), isAnalysis: true }
      ]);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getAIResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('что означает wlt') || lowerMessage.includes('что значит wlt')) {
      return 'WLT — это статус \'Раскладка перемещения\'. Он означает, что товар был перемещён с одного места хранения на другое.';
    }
    
    if (lowerMessage.includes('что значит ugl') || lowerMessage.includes('что означает ugl')) {
      return 'UGL — это статус \'Неопознанный товар на раскладке\'. Он возникает, если на товаре отсутствует стикер или код повреждён.';
    }
    
    return 'Эта функция будет активна после интеграции с GPT.';
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Add user message
    setMessages(prev => [
      ...prev,
      { role: 'user', content: message, time: new Date() }
    ]);
    
    // Clear input
    input.value = '';
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate AI response after 1 second
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: getAIResponse(message), time: new Date() }
      ]);
    }, 1000);
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-200 rounded-lg shadow-lg">
      {/* Expiration Modal */}
      <AnimatePresence>
        {showExpirationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-dark-200 rounded-xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Чат неактивен более 24 часов
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Выберите действие для этого чата:
              </p>
              <div className="space-y-3">
                <motion.button
                  onClick={handleArchive}
                  className="w-full px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>✅</span>
                  <span>Архивировать чат</span>
                </motion.button>
                <motion.button
                  onClick={handleDelete}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>🗑️</span>
                  <span>Удалить чат</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis button */}
      <div className="p-4">
        <motion.button
          onClick={handleAnalyzeData}
          disabled={isAnalyzing}
          className="w-full px-4 py-3 bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            animate={isAnalyzing ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            🔍
          </motion.span>
          <span>{isAnalyzing ? 'Анализируем...' : 'Проанализировать данные'}</span>
        </motion.button>
      </div>

      {/* Chat header */}
      <div className="bg-gray-50 dark:bg-dark-300 px-4 py-3 border-b border-gray-200 dark:border-dark-400">
        <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI-Помощник
        </h3>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div 
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              variants={message.isAnalysis ? analysisMessageVariants : messageVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-lg">
                  🤖
                </div>
              )}
              <div 
                className={`max-w-[85%] p-3 rounded-xl ${
                  message.role === 'user' 
                    ? 'bg-primary-500 text-white rounded-tr-none shadow-smooth' 
                    : message.isAnalysis
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-smooth dark:shadow-smooth-dark border border-primary-100 dark:border-primary-800'
                      : 'bg-white dark:bg-dark-200 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-smooth dark:shadow-smooth-dark'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <div 
                  className={`text-xs mt-1 ${
                    message.role === 'user' 
                      ? 'text-primary-100' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {formatTime(message.time)}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-lg">
                  🧑‍💻
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div 
            className="flex justify-start items-end gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-lg">
              🤖
            </div>
            <div className="bg-white dark:bg-dark-200 p-3 rounded-xl rounded-tl-none shadow-smooth dark:shadow-smooth-dark">
              <div className="flex space-x-1 items-center">
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-dark-400">
        <div className="flex">
          <input
            id="chat-input"
            type="text"
            placeholder="Введите сообщение..."
            className="flex-1 px-4 py-2 rounded-l-lg bg-gray-50 dark:bg-dark-300 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
            autoComplete="off"
          />
          <motion.button
            type="submit"
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-700 text-white rounded-r-lg flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </motion.button>
        </div>
      </form>
    </div>
  );
} 