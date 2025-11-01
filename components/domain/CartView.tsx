
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Button from '../ui/Button';

interface CartViewProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => Promise<void>;
}

const CartView: React.FC<CartViewProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateCartQuantity, removeFromCart } = useAppContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
        await onCheckout();
    } finally {
        setIsCheckingOut(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold">Корзина</h2>
          <button onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {cart.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
            <span className="material-icons text-6xl text-gray-400 mb-4">remove_shopping_cart</span>
            <p className="text-gray-500 dark:text-gray-400">Ваша корзина пуста.</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto p-4">
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md"/>
                  <div className="flex-grow">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.price.toFixed(2)} ₽</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value, 10))}
                      className="w-14 p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                      min="1"
                    />
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                      <span className="material-icons">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Итого:</span>
              <span className="text-xl font-bold">{total.toFixed(2)} ₽</span>
            </div>
            <Button onClick={handleCheckout} className="w-full" disabled={isCheckingOut}>
              {isCheckingOut ? 'Оформление...' : 'Оформить заказ'}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartView;