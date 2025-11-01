
import React from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, children, title, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl m-4 w-full max-w-lg transform transition-all duration-300 ease-out ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${className}`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              aria-label="Close dialog"
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;