import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssistantChat from './AssistantChat';
import FormulaAssistant from './FormulaAssistant';
import CollapsibleSection from './CollapsibleSection';

export default function AssistantPanel({ isOpen, onClose, data }) {
  const panelVariants = {
    hidden: {
      x: '100%',
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 350,
        ease: [0.76, 0, 0.24, 1]
      }
    },
    visible: {
      x: 0,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 350,
        ease: [0.76, 0, 0.24, 1]
      }
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <motion.div
        variants={panelVariants}
        initial="hidden"
        animate={isOpen ? 'visible' : 'hidden'}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-dark-200 shadow-xl z-50 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-50 dark:bg-dark-300 px-4 py-3 border-b border-gray-200 dark:border-dark-400 flex justify-between items-center">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
            <span className="text-xl mr-2">🤖</span>
            AI-Помощник
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-400 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-4rem)] overflow-y-auto">
          <div className="p-4 space-y-4">
            <AssistantChat data={data} />
            <CollapsibleSection 
              title="🧮 Формулы ▾"
              defaultExpanded={true}
            >
              <FormulaAssistant onMount={true} />
            </CollapsibleSection>
          </div>
        </div>
      </motion.div>
    </>
  );
} 