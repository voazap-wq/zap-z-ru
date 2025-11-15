import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { ProfileTab } from '../domain/ProfilePage';

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

const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} г. назад`;
    
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} мес. назад`;
    
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} д. назад`;

    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} ч. назад`;

    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} мин. назад`;
    
    return 'Только что';
};


interface DashboardProps {
    onNavigateTab: (tab: ProfileTab) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab }) => {
    const { user, products, users, orders, notifications } = useAppContext();
    const recentNotifications = notifications.slice(0, 4);

    const getNotificationIcon = (title: string) => {
        const lowerCaseTitle = title.toLowerCase();
        if (lowerCaseTitle.includes('заказ')) return 'receipt_long';
        if (lowerCaseTitle.includes('пользователь')) return 'person_add';
        return 'notifications';
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Добро пожаловать, {user?.fullName}!</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon="inventory_2" title="Всего товаров" value={products.length} color="bg-blue-500" />
                <StatCard icon="group" title="Пользователей" value={users.length} color="bg-green-500" />
                <StatCard icon="receipt_long" title="Всего заказов" value={orders.length} color="bg-yellow-500" />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Последние уведомления</h2>
              {recentNotifications.length > 0 ? (
                <div className="space-y-3">
                  {recentNotifications.map(n => (
                    <Card key={n.id} className={`p-4 flex items-start transition-colors ${!n.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}>
                      <div className="flex-shrink-0 mt-1 mr-4">
                        <span className="material-icons text-primary text-2xl">
                          {getNotificationIcon(n.title)}
                        </span>
                      </div>
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-800 dark:text-gray-200">{n.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                      </div>
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap pl-4">
                        {timeAgo(n.date)}
                      </div>
                    </Card>
                  ))}
                  <div className="text-center pt-2">
                    <Button variant="text" onClick={() => onNavigateTab('notifications')}>
                      Посмотреть все уведомления
                    </Button>
                  </div>
                </div>
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  <p>Новых уведомлений нет.</p>
                </Card>
              )}
            </div>
        </div>
    );
};

export default Dashboard;