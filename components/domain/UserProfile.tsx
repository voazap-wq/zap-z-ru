import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAppContext } from '../../hooks/useAppContext';
import { User } from '../../types';
import Card from '../ui/Card';
import TextField from '../ui/TextField';
import Button from '../ui/Button';

type FormData = {
  fullName: string;
  phone: string;
  telegramId: string;
};

const UserProfile: React.FC = () => {
  const { user, updateUser, logout } = useAppContext();
  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty }, reset } = useForm<FormData>();
  
  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        phone: user.phone || '',
        telegramId: user.telegramId || '',
      });
    }
  }, [user, reset]);

  if (!user) {
    return <p>Загрузка данных пользователя...</p>;
  }

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    await updateUser(data);
    reset(data); // Re-sync form state after successful submission
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <h2 className="text-xl font-semibold">Информация</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Здесь вы можете обновить свои контактные данные. Email изменить нельзя.
        </p>
      </div>
      <div className="md:col-span-2">
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="p-6 space-y-4">
                <TextField
                    id="fullName"
                    label="Полное имя"
                    register={register('fullName', { required: 'Введите ваше имя' })}
                    error={errors.fullName}
                />
                 <TextField
                    id="email"
                    label="Email"
                    defaultValue={user.email}
                    disabled
                    register={register('email' as any)} // Not part of form data but need to pass register
                />
                 <TextField
                    id="phone"
                    label="Телефон"
                    register={register('phone')}
                    error={errors.phone}
                    placeholder="+7 (999) 123-45-67"
                />
                 <TextField
                    id="telegramId"
                    label="Telegram ID"
                    register={register('telegramId')}
                    error={errors.telegramId}
                    placeholder="@username"
                />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-between items-center">
                 <Button onClick={logout} variant="text" type="button" className="text-red-500 hover:bg-red-50">Выйти</Button>
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default UserProfile;
