
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAppContext } from '../../hooks/useAppContext';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';

interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder: (paymentData: any) => Promise<void>;
}

type FormData = {
  cardName: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
};

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ isOpen, onClose, onPlaceOrder }) => {
  const { cart, user } = useAppContext();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>();
  const [apiError, setApiError] = useState<string | null>(null);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleClose = () => {
    reset();
    setApiError(null);
    onClose();
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setApiError(null);
    if (!user) {
        setApiError('Для оформления заказа необходимо войти в систему.');
        return;
    }
    try {
      await onPlaceOrder(data);
      handleClose();
    } catch (error) {
        if (error instanceof Error) {
            setApiError(error.message);
        } else {
            setApiError('Произошла неизвестная ошибка.');
        }
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Оформление заказа">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Сумма к оплате: <span className="text-primary font-bold">{total.toFixed(2)} ₽</span></h3>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && <p className="text-red-500 text-sm text-center">{apiError}</p>}
        <TextField
          id="cardName"
          label="Имя на карте"
          register={register('cardName', { required: 'Введите имя на карте' })}
          error={errors.cardName}
        />
        <TextField
          id="cardNumber"
          label="Номер карты"
          register={register('cardNumber', { 
              required: 'Введите номер карты',
              pattern: { value: /^\d{16}$/, message: 'Неверный номер карты (16 цифр)'}
          })}
          error={errors.cardNumber}
          placeholder="0000 0000 0000 0000"
        />
        <div className="flex space-x-4">
            <div className="w-1/2">
                <TextField
                id="expiryDate"
                label="Срок действия"
                register={register('expiryDate', { 
                    required: 'Введите срок',
                    pattern: { value: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Формат ММ/ГГ' }
                })}
                error={errors.expiryDate}
                placeholder="ММ/ГГ"
                />
            </div>
            <div className="w-1/2">
                <TextField
                id="cvv"
                label="CVV"
                register={register('cvv', { 
                    required: 'Введите CVV',
                    pattern: { value: /^\d{3}$/, message: '3 цифры' }
                })}
                error={errors.cvv}
                placeholder="123"
                />
            </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="text" onClick={handleClose} disabled={isSubmitting}>Отмена</Button>
          <Button type="submit" disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? 'Обработка...' : `Оплатить ${total.toFixed(2)} ₽`}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default CheckoutDialog;