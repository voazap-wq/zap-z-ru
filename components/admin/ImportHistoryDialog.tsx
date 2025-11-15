import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Dialog from '../ui/Dialog';
import { ImportLogEntry } from '../../types';

interface ImportHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportHistoryDialog: React.FC<ImportHistoryDialogProps> = ({ isOpen, onClose }) => {
    const { importHistory } = useAppContext();
    const reversedHistory = [...importHistory].reverse();

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="История приходов (импорта)" className="max-w-3xl">
            {reversedHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <span className="material-icons text-4xl mb-2">history_toggle_off</span>
                    <p>История импорта пока пуста.</p>
                </div>
            ) : (
                <div className="max-h-[60vh] overflow-y-auto">
                    <ul className="space-y-3">
                        {reversedHistory.map((log, index) => (
                            <li key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-600">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <div className="flex items-center mb-1">
                                            {log.status === 'success' ? (
                                                <span className="material-icons text-green-500 mr-2">check_circle</span>
                                            ) : (
                                                <span className="material-icons text-red-500 mr-2">error</span>
                                            )}
                                            <p className="font-semibold text-gray-800 dark:text-gray-200 truncate" title={log.fileName}>
                                                {log.fileName}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 pl-8 break-words">
                                            {log.message}
                                        </p>
                                    </div>
                                    <div className="text-right text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap pl-4">
                                        <p>{new Date(log.date).toLocaleDateString()}</p>
                                        <p>{new Date(log.date).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </Dialog>
    );
};

export default ImportHistoryDialog;
