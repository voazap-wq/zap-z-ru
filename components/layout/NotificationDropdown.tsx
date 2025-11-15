import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Notification } from '../../types';

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


interface NotificationDropdownProps {
  onClose: () => void;
  onViewAll: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose, onViewAll }) => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useAppContext();
    const unreadCount = notifications.filter(n => !n.read).length;
    const recentNotifications = notifications.slice(0, 5);


    const handleMarkAsRead = (notification: Notification) => {
        if (!notification.read) {
            markNotificationAsRead(notification.id);
        }
    };

    const handleMarkAllAsRead = () => {
        if (unreadCount > 0) {
            markAllNotificationsAsRead();
        }
    };

    const handleViewAllClick = () => {
        onViewAll();
        onClose();
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
            <div className="p-3 flex justify-between items-center border-b dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Уведомления</h3>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAllAsRead} className="text-xs text-primary hover:underline focus:outline-none">
                        Отметить все как прочитанные
                    </button>
                )}
            </div>
            {recentNotifications.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
                    {recentNotifications.map(n => (
                        <li key={n.id} onClick={() => handleMarkAsRead(n)} className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!n.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                           <div className="flex items-start">
                                {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0"></div>}
                                <div className="flex-grow">
                                    <p className={`font-medium text-sm ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{n.title}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{n.message}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeAgo(n.date)}</p>
                                </div>
                           </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="p-4 text-center text-sm text-gray-500">Уведомлений нет.</p>
            )}
            <div className="p-2 border-t dark:border-gray-700 text-center">
                <button onClick={handleViewAllClick} className="w-full text-sm font-medium text-primary hover:bg-primary/10 rounded-md py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light">
                    Посмотреть все
                </button>
            </div>
        </div>
    );
};
export default NotificationDropdown;
