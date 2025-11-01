import React, { useEffect } from 'react';
import { SnackbarSeverity, SnackbarAction } from '../../types';

interface SnackbarProps {
  open: boolean;
  message: string;
  onClose: () => void;
  severity?: SnackbarSeverity;
  duration?: number;
  action?: SnackbarAction;
}

const Snackbar: React.FC<SnackbarProps> = ({ open, message, onClose, severity = 'info', duration = 4000, action }) => {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  const severityConfig = {
    success: { bg: 'bg-green-500', icon: 'check_circle' },
    error: { bg: 'bg-red-500', icon: 'error' },
    info: { bg: 'bg-gray-700 dark:bg-gray-200', icon: 'info' },
  };
  
  const textColor = severity === 'info' ? 'text-white dark:text-black' : 'text-white';
  const severityClasses = `${severityConfig[severity].bg} ${textColor}`;

  return (
    <div 
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div className={`flex items-center justify-between min-w-[288px] max-w-xl p-4 rounded-md shadow-lg ${severityClasses}`}>
        <span className="material-icons mr-3">{severityConfig[severity].icon}</span>
        <span className="flex-grow">{message}</span>
        {action && (
          <button 
            onClick={action.onClick}
            className="font-bold uppercase text-sm ml-4 px-3 py-1 rounded hover:bg-white/20 transition-colors"
          >
            {action.label}
          </button>
        )}
        <button onClick={onClose} className="ml-2 p-1 rounded-full hover:bg-white/20">
          <span className="material-icons text-xl">close</span>
        </button>
      </div>
    </div>
  );
};

export default Snackbar;