import React, { useState, useMemo } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { User } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import TextField from '../ui/TextField';
import Tabs from '../ui/Tabs';

interface ManagerCheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrderForCustomer: (customerId: string) => Promise<void>;
  onCreateAndPlaceOrder: (customerData: Omit<User, 'id' | 'role'>) => Promise<void>;
}

type Tab = 'existing' | 'new';
type NewCustomerFormData = {
  fullName: string;
  email: string;
  phone: string;
};

const ManagerCheckoutDialog: React.FC<ManagerCheckoutDialogProps> = ({ isOpen, onClose, onPlaceOrderForCustomer, onCreateAndPlaceOrder }) => {
  const { users, cart } = useAppContext();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<NewCustomerFormData>();
  
  const [activeTab, setActiveTab] = useState<Tab>('existing');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [apiError, setApiError] = useState('');

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const customerList = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return users.filter(u => 
        u.role === 'customer' && (
            u.fullName.toLowerCase().includes(lowercasedQuery) ||
            u.email.toLowerCase().includes(lowercasedQuery) ||
            (u.phone && u.phone.replace(/\D/g, '').includes(lowercasedQuery.replace(/\D/g, '')))
        )
    );
  }, [users, searchQuery]);
  
  const handleClose = () => {
      reset();
      setSearchQuery('');
      setSelectedCustomer(null);
      setApiError('');
      setIsPlacingOrder(false);
      onClose();
  };

  const handlePlaceOrderClick = async () => {
    if (!selectedCustomer) return;
    setIsPlacingOrder(true);
    try {
        await onPlaceOrderForCustomer(selectedCustomer.id);
        handleClose();
    } catch (error) {
        console.error("Failed to place order for customer:", error);
    } finally {
        setIsPlacingOrder(false);
    }
  };
  
  const onSubmitNewCustomer: SubmitHandler<NewCustomerFormData> = async (data) => {
    setApiError('');
    setIsPlacingOrder(true);
    try {
        await onCreateAndPlaceOrder(data);
        handleClose();
    } catch (error) {
        if (error instanceof Error) {
            // User creation errors from API are specific and should be displayed in-dialog
            if (error.message.toLowerCase().includes('email')) {
                 setApiError(error.message);
            }
            // Other errors (like out of stock) are handled by snackbar in the context
        } else {
             setApiError('Произошла неизвестная ошибка');
        }
    } finally {
        setIsPlacingOrder(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Оформление заказа для клиента" className="max-w-2xl">
      <div className="mb-4">
        <Tabs 
          tabs={[{id: 'existing', label: 'Выбрать существующего'}, {id: 'new', label: 'Создать нового'}]} 
          activeTab={activeTab} 
          onTabClick={(tab) => {
            setActiveTab(tab);
            setApiError('');
            setSelectedCustomer(null);
            reset();
          }} 
        />
      </div>

      {activeTab === 'existing' ? (
        <div>
            <div className="relative mb-3">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                <input 
                    type="search"
                    placeholder="Поиск по имени, email или телефону..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary"
                />
            </div>
            <div className="max-h-60 overflow-y-auto border rounded-md dark:border-gray-600">
                {customerList.length > 0 ? (
                    customerList.map(customer => (
                        <div 
                            key={customer.id} 
                            onClick={() => setSelectedCustomer(customer)}
                            className={`p-3 cursor-pointer border-l-4 transition-colors ${selectedCustomer?.id === customer.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                        >
                            <p className="font-medium">{customer.fullName}</p>
                            <p className="text-sm text-gray-500">{customer.email} - {customer.phone || 'Телефон не указан'}</p>
                        </div>
                    ))
                ) : (
                    <p className="p-4 text-center text-gray-500">Клиенты не найдены.</p>
                )}
            </div>
             <div className="flex justify-end space-x-3 pt-6 mt-4 border-t dark:border-gray-700">
                <Button type="button" variant="text" onClick={handleClose} disabled={isPlacingOrder}>Отмена</Button>
                <Button 
                    type="button" 
                    onClick={handlePlaceOrderClick}
                    disabled={!selectedCustomer || isPlacingOrder}
                >
                    {isPlacingOrder ? 'Оформление...' : `Оформить на ${selectedCustomer ? selectedCustomer.fullName.split(' ')[0] : 'клиента'} (${total.toFixed(2)} ₽)`}
                </Button>
            </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmitNewCustomer)} className="space-y-4">
            {apiError && <p className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/30 p-2 rounded-md">{apiError}</p>}
            <TextField id="fullName" label="ФИО клиента" register={register('fullName', { required: 'Введите ФИО' })} error={errors.fullName} />
            <TextField id="email" label="Email" type="email" register={register('email', { required: 'Введите email', pattern: { value: /^\S+@\S+$/i, message: 'Неверный формат Email' } })} error={errors.email} />
            <TextField id="phone" label="Телефон" register={register('phone')} error={errors.phone} />
             <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="text" onClick={handleClose} disabled={isPlacingOrder}>Отмена</Button>
                <Button type="submit" disabled={isPlacingOrder}>
                    {isPlacingOrder ? 'Создание...' : `Создать и оформить заказ (${total.toFixed(2)} ₽)`}
                </Button>
            </div>
        </form>
      )}
    </Dialog>
  );
};

export default ManagerCheckoutDialog;