import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { useSortableData } from '../../hooks/useSortableData';
import { Order, User } from '../../types';
import IconButton from '../ui/IconButton';
import TextField from '../ui/TextField';

const statusMap: Record<Order['status'], { text: string; color: string; bg: string }> = {
  pending: { text: 'В обработке', color: 'text-yellow-800 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  processing: { text: 'Собирается', color: 'text-blue-800 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  shipped: { text: 'Отправлен', color: 'text-indigo-800 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  delivered: { text: 'Доставлен', color: 'text-green-800 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/30' },
  cancelled: { text: 'Отменен', color: 'text-red-800 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const ManageOrders: React.FC = () => {
  const { orders, users, updateOrderStatus } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };
  
  const toggleExpand = (orderId: string) => {
    setExpandedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(orderId)) {
            newSet.delete(orderId);
        } else {
            newSet.add(orderId);
        }
        return newSet;
    });
  };

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return orders;
    const lowercasedQuery = searchQuery.toLowerCase();
    
    return orders.filter(order => {
        const user = users.find(u => u.id === order.userId);
        const searchInUser = user && (
            user.fullName.toLowerCase().includes(lowercasedQuery) ||
            (user.phone && user.phone.replace(/\D/g, '').includes(lowercasedQuery.replace(/\D/g, '')))
        );

        const searchInOrder = 
            String(order.orderNumber).includes(lowercasedQuery) ||
            order.items.some(item =>
                item.name.toLowerCase().includes(lowercasedQuery) ||
                item.sku.toLowerCase().includes(lowercasedQuery)
            );

        return searchInUser || searchInOrder;
    });
  }, [orders, users, searchQuery]);
  
  const { items: sortedOrders, requestSort, sortConfig } = useSortableData(filteredOrders, { key: 'orderNumber', direction: 'descending' });

  const getSortIcon = (key: keyof Order) => {
    if (sortConfig?.key !== key) return 'unfold_more';
    return sortConfig.direction === 'ascending' ? 'expand_less' : 'expand_more';
  }

  const SortableHeader: React.FC<{ sortKey: keyof Order; label: string; }> = ({ sortKey, label }) => (
    <th scope="col" className="px-4 py-3">
        <button className="flex items-center space-x-1" onClick={() => requestSort(sortKey)}>
            <span>{label}</span>
            <span className="material-icons text-base">{getSortIcon(sortKey)}</span>
        </button>
    </th>
  )

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Управление заказами</h1>
      <div className="mb-4 max-w-md">
         <TextField 
            id="search"
            label=""
            placeholder="Поиск по номеру заказа, клиенту, телефону, товару..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            register={{} as any} // Not using react-hook-form here
        />
      </div>

      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <SortableHeader sortKey="orderNumber" label="Заказ #" />
              <th scope="col" className="px-4 py-3">Клиент</th>
              <th scope="col" className="px-4 py-3">Телефон</th>
              <SortableHeader sortKey="createdAt" label="Дата" />
              <SortableHeader sortKey="total" label="Сумма" />
              <th scope="col" className="px-4 py-3">Статус</th>
              <th scope="col" className="px-1 py-3 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map(order => {
                const user = users.find(u => u.id === order.userId);
                const isExpanded = expandedIds.has(order.id);
                return (
                    <React.Fragment key={order.id}>
                        <tr 
                            className={`border-b dark:border-gray-700 transition-colors duration-200 ${isExpanded ? 'bg-blue-50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-600/50'}`}
                            onClick={() => toggleExpand(order.id)}
                            style={{cursor: 'pointer'}}
                        >
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">#{order.orderNumber}</td>
                            <td className="px-4 py-3">{order.customerName}</td>
                            <td className="px-4 py-3">{user?.phone || 'N/A'}</td>
                            <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-3">{order.total.toFixed(2)} ₽</td>
                            <td className="px-4 py-3">
                                <select
                                    value={order.status}
                                    onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-1 border rounded bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-primary"
                                >
                                    {Object.entries(statusMap).map(([status, { text }]) => (
                                        <option key={status} value={status}>{text}</option>
                                    ))}
                                </select>
                            </td>
                            <td className="px-1 py-1 text-center">
                                <IconButton onClick={(e) => {e.stopPropagation(); toggleExpand(order.id)}}>
                                    <span className={`material-icons transition-transform duration-300 transform ${isExpanded ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </IconButton>
                            </td>
                        </tr>
                        {isExpanded && (
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <td colSpan={7} className="p-4">
                                    <h4 className="font-semibold mb-3 text-md">Состав заказа:</h4>
                                    <div className="space-y-2">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between p-2 rounded-md bg-white dark:bg-gray-800 shadow-sm">
                                                <div className="flex items-center">
                                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4"/>
                                                    <div>
                                                        <p className="font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                                                        <p className="text-gray-500 text-xs">Арт: {item.sku}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">{(item.price * item.quantity).toFixed(2)} ₽</p>
                                                    <p className="text-gray-500 text-xs">{item.quantity} шт. × {item.price.toFixed(2)} ₽</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                )
            })}
             {sortedOrders.length === 0 && (
                <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                        {searchQuery ? 'Заказы не найдены' : 'Нет заказов для отображения'}
                    </td>
                </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageOrders;