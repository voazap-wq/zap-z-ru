import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Order, Product } from '../../types';
import Card from '../ui/Card';

type Period = '7d' | '30d' | 'all';

const StatCard: React.FC<{ title: string; value: string; icon: string; description?: string; }> = ({ title, value, icon, description }) => (
    <Card className="p-4">
        <div className="flex items-center">
            <div className="p-3 rounded-full mr-4 bg-primary/10">
                <span className="material-icons text-primary text-2xl">{icon}</span>
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </div>
        {description && <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{description}</p>}
    </Card>
);

const AnalyticsPage: React.FC = () => {
    const { orders, products, categories } = useAppContext();
    const [period, setPeriod] = useState<Period>('7d');

    const filteredOrders = useMemo(() => {
        const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'shipped');

        if (period === 'all') {
            return completedOrders;
        }

        const now = new Date();
        const days = period === '7d' ? 7 : 30;
        const startDate = new Date(new Date().setDate(now.getDate() - days));

        return completedOrders.filter(o => new Date(o.createdAt) >= startDate);
    }, [orders, period]);

    const stats = useMemo(() => {
        const revenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const salesCount = filteredOrders.length;
        const avgOrderValue = salesCount > 0 ? revenue / salesCount : 0;
        
        const profit = filteredOrders.reduce((totalProfit, order) => {
            const orderProfit = order.items.reduce((itemSum, item) => {
                const product = products.find(p => p.id === item.id);
                const purchasePrice = product?.purchasePrice ?? 0;
                const itemProfit = (item.price - purchasePrice) * item.quantity;
                return itemSum + itemProfit;
            }, 0);
            return totalProfit + orderProfit;
        }, 0);

        return {
            revenue,
            profit,
            salesCount,
            avgOrderValue
        };
    }, [filteredOrders, products]);

    const salesByDay = useMemo(() => {
        const salesMap: { [key: string]: number } = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.createdAt).toISOString().split('T')[0];
            salesMap[date] = (salesMap[date] || 0) + order.total;
        });
        return Object.entries(salesMap).sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
    }, [filteredOrders]);

    const topProducts = useMemo(() => {
        const productMap: { [key: number]: { name: string; sku: string; quantity: number } } = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (!productMap[item.id]) {
                    productMap[item.id] = { name: item.name, sku: item.sku, quantity: 0 };
                }
                productMap[item.id].quantity += item.quantity;
            });
        });
        return Object.values(productMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    }, [filteredOrders]);

    const topCategories = useMemo(() => {
        const categoryMap: { [key: string]: { name: string; revenue: number } } = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const category = categories.find(c => c.id === item.categoryId);
                if (category) {
                    if (!categoryMap[category.id]) {
                        categoryMap[category.id] = { name: category.name, revenue: 0 };
                    }
                    categoryMap[category.id].revenue += item.price * item.quantity;
                }
            });
        });
        return Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [filteredOrders, categories]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    const maxDailySale = Math.max(...salesByDay.map(([, revenue]) => revenue), 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Аналитика</h1>
                <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    {(['7d', '30d', 'all'] as Period[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                period === p ? 'bg-white dark:bg-gray-800 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                            }`}
                        >
                            {p === '7d' && '7 дней'}
                            {p === '30d' && '30 дней'}
                            {p === 'all' && 'Всё время'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Выручка" value={formatCurrency(stats.revenue)} icon="trending_up" />
                <StatCard title="Чистая прибыль" value={formatCurrency(stats.profit)} icon="account_balance_wallet" />
                <StatCard title="Продажи" value={stats.salesCount.toString()} icon="receipt_long" />
                <StatCard title="Средний чек" value={formatCurrency(stats.avgOrderValue)} icon="point_of_sale" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 p-4">
                    <h3 className="font-semibold mb-4">Динамика продаж по дням</h3>
                    {salesByDay.length > 0 ? (
                         <div className="flex items-end h-64 space-x-2 px-4 pb-10">
                             {salesByDay.map(([date, revenue]) => (
                                 <div key={date} className="flex-1 flex flex-col items-center justify-end group relative h-full">
                                     <div className="absolute -top-8 text-xs font-bold text-white bg-gray-800 dark:bg-gray-900 px-2 py-1 rounded-md mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                         {formatCurrency(revenue)}
                                     </div>
                                     <div
                                         className="w-full bg-primary/80 hover:bg-primary rounded-t-md transition-colors"
                                         style={{ height: `${maxDailySale > 0 ? (revenue / maxDailySale) * 100 : 0}%` }}
                                     ></div>
                                     <div className="absolute -bottom-6 text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45 whitespace-nowrap">
                                         {new Date(date).toLocaleDateString('ru', { day: '2-digit', month: '2-digit' })}
                                     </div>
                                 </div>
                             ))}
                         </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">Нет данных за выбранный период.</div>
                    )}
                </Card>
                 <div className="space-y-6">
                    <Card className="p-4">
                        <h3 className="font-semibold mb-3">Топ-5 продаваемых товаров</h3>
                        <ul className="space-y-2 text-sm">
                           {topProducts.map(p => (
                               <li key={p.sku} className="flex justify-between items-center">
                                   <span className="truncate" title={p.name}>{p.name}</span>
                                   <span className="font-semibold ml-2">{p.quantity} шт.</span>
                               </li>
                           ))}
                        </ul>
                         {topProducts.length === 0 && <p className="text-sm text-gray-500">Нет данных.</p>}
                    </Card>
                    <Card className="p-4">
                        <h3 className="font-semibold mb-3">Топ-5 прибыльных категорий</h3>
                         <ul className="space-y-2 text-sm">
                           {topCategories.map(c => (
                               <li key={c.name} className="flex justify-between items-center">
                                   <span className="truncate" title={c.name}>{c.name}</span>
                                   <span className="font-semibold ml-2">{formatCurrency(c.revenue)}</span>
                               </li>
                           ))}
                        </ul>
                         {topCategories.length === 0 && <p className="text-sm text-gray-500">Нет данных.</p>}
                    </Card>
                 </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
