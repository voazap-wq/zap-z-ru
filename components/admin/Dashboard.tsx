import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';

const StatCard: React.FC<{ icon: string; title: string; value: number | string; color: string }> = ({ icon, title, value, color }) => (
    <Card className="p-4 flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            <span className="material-icons text-white">{icon}</span>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </Card>
);

const Dashboard: React.FC = () => {
    const { user, products, users, orders } = useAppContext();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Добро пожаловать, {user?.fullName}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon="inventory_2" title="Всего товаров" value={products.length} color="bg-blue-500" />
                <StatCard icon="group" title="Пользователей" value={users.length} color="bg-green-500" />
                <StatCard icon="receipt_long" title="Всего заказов" value={orders.length} color="bg-yellow-500" />
            </div>
        </div>
    );
};

export default Dashboard;