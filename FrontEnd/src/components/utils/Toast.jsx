import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';
import toastService from '../../lib/util/toastService';

const Toast = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <FiCheckCircle className="text-green-500" />;
      case 'error':
        return <FiAlertCircle className="text-red-500" />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500" />;
      default:
        return <FiInfo className="text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm ${getBgColor()}`}
    >
      <div className="flex-shrink-0 text-xl">
        {getIcon()}
      </div>
      
      <div className={`flex-1 ${getTextColor()}`}>
        <p className="font-medium">{toast.message}</p>
      </div>
      
      <button
        onClick={() => onRemove(toast.id)}
        className={`flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors ${getTextColor()}`}
      >
        <FiX className="text-lg" />
      </button>
    </motion.div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToastChange = (newToasts) => {
      setToasts(newToasts);
    };

    toastService.addListener(handleToastChange);

    return () => {
      toastService.removeListener(handleToastChange);
    };
  }, []);

  const handleRemove = (id) => {
    toastService.remove(id);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={handleRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
