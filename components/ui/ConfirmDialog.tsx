import React from 'react';
import Dialog from './Dialog';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, children }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="text-gray-600 dark:text-gray-300">
        {children}
      </div>
      <div className="flex justify-end space-x-3 pt-6">
        <Button type="button" variant="text" onClick={onClose}>
          Отмена
        </Button>
        <Button 
            type="button" 
            onClick={onConfirm}
            className="!bg-red-600 hover:!bg-red-700 focus:ring-red-500"
        >
          Подтвердить
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmDialog;
