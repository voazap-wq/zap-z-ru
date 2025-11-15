import React from 'react';
import { CartItem, OrderItemStatus } from '../../types';
import { useAppContext } from '../../hooks/useAppContext';

interface OrderDetailsTableProps {
  items: CartItem[];
  isAdmin: boolean;
  orderId?: string;
}

const orderItemStatusMap: Record<OrderItemStatus, { text: string; color: string; bg: string }> = {
  pending: { text: 'В обработке', color: 'text-yellow-800 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  available: { text: 'На складе', color: 'text-green-800 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
  shipped: { text: 'Отправлен', color: 'text-indigo-800 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  cancelled: { text: 'Отменен', color: 'text-red-800 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const OrderDetailsTable: React.FC<OrderDetailsTableProps> = ({ items, isAdmin, orderId }) => {
  const { updateOrderItemStatus } = useAppContext();

  const handleStatusChange = (productId: string, status: OrderItemStatus) => {
    if (isAdmin && orderId) {
      updateOrderItemStatus(orderId, productId, status);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-xs text-gray-500 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-4 py-2 text-left font-medium">Товар</th>
            <th scope="col" className="px-4 py-2 text-left font-medium">Статус</th>
            <th scope="col" className="px-4 py-2 text-center font-medium">Кол-во</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">Цена</th>
            <th scope="col" className="px-4 py-2 text-right font-medium">Сумма</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map(item => {
            const statusInfo = orderItemStatusMap[item.status];
            return (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-3">
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                      <p className="text-gray-500 text-xs">Арт: {item.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {isAdmin ? (
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as OrderItemStatus)}
                      onClick={(e) => e.stopPropagation()}
                      className={`appearance-none text-center px-2 py-1 text-xs font-medium rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-primary ${statusInfo.bg} ${statusInfo.color}`}
                    >
                      {Object.entries(orderItemStatusMap).map(([status, { text }]) => (
                        <option key={status} value={status} className="text-black dark:text-white bg-white dark:bg-gray-800">{text}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{item.price.toFixed(2)} ₽</td>
                <td className="px-4 py-3 text-right font-medium">{(item.price * item.quantity).toFixed(2)} ₽</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderDetailsTable;