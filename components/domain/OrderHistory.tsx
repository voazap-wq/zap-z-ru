import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Order } from '../../types';
import Card from '../ui/Card';
import IconButton from '../ui/IconButton';

const statusMap: Record<Order['status'], { text: string; color: string; bg: string }> = {
  pending: { text: 'В обработке', color: 'text-yellow-800 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  processing: { text: 'Собирается', color: 'text-blue-800 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  shipped: { text: 'Отправлен', color: 'text-indigo-800 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  delivered: { text: 'Доставлен', color: 'text-green-800 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
  cancelled: { text: 'Отменен', color: 'text-red-800 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const OrderHistory: React.FC = () => {
  const { orders: allOrders, user } = useAppContext();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const orders = allOrders.filter(o => o.userId === user?.id).sort((a, b) => b.orderNumber - a.orderNumber);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="material-icons text-5xl text-gray-400">receipt_long</span>
        <p className="mt-2 text-gray-600 dark:text-gray-400">У вас еще нет заказов.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        const isExpanded = expandedOrderId === order.id;
        const statusInfo = statusMap[order.status];
        return (
          <Card key={order.id} className="overflow-hidden transition-shadow duration-300">
            <div 
              className="p-4 flex flex-wrap justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
              onClick={() => toggleExpand(order.id)}
              role="button"
              aria-expanded={isExpanded}
            >
              <div className="mb-2 sm:mb-0">
                <h3 className="font-semibold text-lg">Заказ #{order.orderNumber}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  от {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                <span className="font-semibold text-lg">{order.total.toFixed(2)} ₽</span>
                <IconButton className="!p-1">
                    <span className={`material-icons transition-transform duration-300 transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                    </span>
                </IconButton>
              </div>
            </div>
            <div 
              className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
              style={{ maxHeight: isExpanded ? `${order.items.length * 5 + 8}rem` : '0' }} // Dynamic height adjusted
            >
              <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <h4 className="font-semibold mb-3 text-md">Состав заказа:</h4>
                  <ul className="space-y-3">
                    {order.items.map(item => (
                      <li key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                              <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                              <div>
                                <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                                <p className="text-gray-500 text-xs">Арт: {item.sku}</p>
                                <p className="text-gray-500">{item.quantity} шт. × {item.price.toFixed(2)} ₽</p>
                              </div>
                          </div>
                        <span className="font-medium">{(item.price * item.quantity).toFixed(2)} ₽</span>
                      </li>
                    ))}
                  </ul>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default OrderHistory;