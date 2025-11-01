
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Card from '../ui/Card';

const Notifications: React.FC = () => {
  const { notifications } = useAppContext();

  if (notifications.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <span className="material-icons text-5xl text-gray-400">notifications_off</span>
        <p className="mt-2 text-gray-600 dark:text-gray-400">У вас пока нет уведомлений.</p>
      </div>
    );
  }

  return (
    <Card>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {notifications.map(notification => (
          <li key={notification.id} className="p-4 flex items-start hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex-shrink-0 mt-1">
                {!notification.read && (
                    <span className="h-2.5 w-2.5 bg-primary rounded-full block" title="Непрочитано"></span>
                )}
            </div>
            <div className="ml-4 flex-grow">
              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                {notification.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                {new Date(notification.date).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default Notifications;