import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssistantPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привет! Я помогу проанализировать ваши данные. Задайте мне вопрос о вашем Excel-файле.', time: new Date() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Прокрутка к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Закрытие по клику вне popup
  useEffect(() => {
    const handleClickOutside = (e) => {
      const popup = document.getElementById('assistant-popup');
      const button = document.getElementById('assistant-button');
      
      if (isOpen && popup && button && !popup.contains(e.target) && !button.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Демонстрационная функция для добавления сообщений
  const handleSendMessage = (e) => {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message) return;
    
    // Добавляем сообщение пользователя
    setMessages(prev => [
      ...prev,
      { role: 'user', content: message, time: new Date() }
    ]);
    
    // Сбрасываем поле ввода
    input.value = '';
    
    // Симулируем печатание ассистента
    setIsTyping(true);
    
    // Симулируем ответ ассистента через 1-2 секунды
    const typingDelay = 1000 + Math.random() * 1000;
    setTimeout(() => {
      const responses = [
        "Я анализирую ваши данные. В них видны интересные тренды.",
        "Исходя из загруженной таблицы, основные показатели выросли на 15%.",
        "В ваших данных есть несколько выбросов, на которые стоит обратить внимание.",
        "Я могу предложить визуализировать эти данные с помощью столбчатой диаграммы.",
        "Средние значения в этом столбце указывают на положительную динамику.",
        "Судя по данным, наблюдается сезонность с пиками в летние месяцы.",
        "Проанализировав структуру данных, рекомендую сгруппировать их по категориям.",
        "По сравнению с прошлым периодом, показатели улучшились на 7%."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: randomResponse, time: new Date() }
      ]);
    }, typingDelay);
  };
  
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Кнопка чат-ассистента */}
      <motion.button
        id="assistant-button"
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 rounded-full flex items-center justify-center text-white shadow-smooth-lg dark:shadow-smooth-dark z-50"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)" }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </motion.button>
      
      {/* Popup окно */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="assistant-popup"
            className="fixed bottom-24 right-6 w-80 sm:w-96 max-w-[90vw] bg-white dark:bg-dark-200 rounded-2xl shadow-smooth-xl dark:shadow-smooth-dark overflow-hidden z-50 border border-gray-200 dark:border-dark-300"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
          >
            {/* Заголовок чата */}
            <div className="bg-gray-50 dark:bg-dark-300 px-4 py-3 border-b border-gray-200 dark:border-dark-400 flex justify-between items-center">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
                <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Ассистент
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Область сообщений */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-100">
              {messages.map((message, index) => (
                <motion.div 
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-xl ${
                      message.role === 'user' 
                        ? 'bg-primary-500 text-white rounded-tr-none shadow-smooth' 
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
                </motion.div>
              ))}

              {/* Индикатор печати */}
              {isTyping && (
                <motion.div 
                  className="flex justify-start"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
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
            
            {/* Форма отправки сообщения */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-dark-400 p-3 bg-white dark:bg-dark-200 flex">
              <input
                id="message-input"
                type="text"
                placeholder="Введите сообщение..."
                className="flex-1 px-4 py-2 rounded-l-lg bg-gray-50 dark:bg-dark-300 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400"
                autoComplete="off"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors text-white rounded-r-lg flex items-center"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 