
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import { useAppContext } from '../../hooks/useAppContext';
import TextField from '../ui/TextField';
import Tabs from '../ui/Tabs';

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'login' | 'register';
type FormData = Record<string, string>;

const AuthDialog: React.FC<AuthDialogProps> = ({ isOpen, onClose }) => {
  const { login, register: registerUser } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>();
  
  const password = watch('password');

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setApiError(null);
    try {
      if (activeTab === 'login') {
        await login(data.email, data.password);
      } else {
        await registerUser(data.fullName, data.email, data.password);
      }
      handleClose(); // Close on success
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError('Произошла неизвестная ошибка.');
      }
    }
  };
  
  const tabs = [
    { id: 'login' as Tab, label: 'Вход' },
    { id: 'register' as Tab, label: 'Регистрация' },
  ];

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title={activeTab === 'login' ? 'С возвращением' : 'Создать аккаунт'}>
      <div className="mb-4">
        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={(tab) => { setActiveTab(tab); reset(); setApiError(null); }} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{apiError}</p>}
        
        {activeTab === 'register' && (
          <TextField
            id="fullName"
            label="Полное имя"
            register={register('fullName', { required: 'Требуется полное имя' })}
            error={errors.fullName as any}
          />
        )}
        <TextField
          id="email"
          label="Email"
          type="email"
          register={register('email', { 
            required: 'Требуется Email', 
            pattern: { value: /^\S+@\S+$/i, message: 'Неверный формат Email' } 
          })}
          error={errors.email as any}
          helperText={activeTab === 'login' ? 'Тест: admin@example.com или ivan@example.com' : undefined}
        />
        <TextField
          id="password"
          label="Пароль"
          type="password"
          register={register('password', { 
            required: 'Требуется пароль',
            minLength: activeTab === 'register' 
              ? { value: 6, message: 'Пароль должен быть не менее 6 символов' }
              : undefined,
          })}
          error={errors.password as any}
          helperText={activeTab === 'login' ? 'Для тестовых аккаунтов пароль может быть любым.' : undefined}
        />
        {activeTab === 'register' && (
          <TextField
            id="confirmPassword"
            label="Подтвердите пароль"
            type="password"
            register={register('confirmPassword', {
              required: 'Пожалуйста, подтвердите пароль',
              validate: value => value === password || 'Пароли не совпадают'
            })}
            error={errors.confirmPassword as any}
          />
        )}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={handleClose}>Отмена</Button>
          <Button type="submit">{activeTab === 'login' ? 'Войти' : 'Создать аккаунт'}</Button>
        </div>
      </form>
    </Dialog>
  );
};

export default AuthDialog;