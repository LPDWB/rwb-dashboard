import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function AssistantChat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Привет! Я могу помочь тебе интерпретировать данные из Excel. Просто задай вопрос.', time: new Date() },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-dark-100">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div 
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}
              variants={messageVariants}
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
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 dark:border-dark-400 p-3 bg-white dark:bg-dark-200">
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