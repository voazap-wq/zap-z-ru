

import React from 'react';
import { AdminSection } from './AdminPage';
import { useAppContext } from '../../hooks/useAppContext';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeSection, onSectionChange }) => {
    const { user } = useAppContext();

    const navItems = [
        { id: 'dashboard', label: 'Дашборд', icon: 'dashboard', roles: ['manager', 'superadmin'] },
        { id: 'analytics', label: 'Аналитика', icon: 'analytics', roles: ['manager', 'superadmin'] },
        { id: 'orders', label: 'Заказы', icon: 'receipt_long', roles: ['manager', 'superadmin'] },
        { id: 'products', label: 'Товары', icon: 'inventory_2', roles: ['manager', 'superadmin'] },
        { id: 'categories', label: 'Категории', icon: 'category', roles: ['manager', 'superadmin'] },
        { id: 'users', label: 'Пользователи', icon: 'group', roles: ['superadmin'] },
        { id: 'settings', label: 'Настройки сайта', icon: 'settings', roles: ['manager', 'superadmin'] },
    ];

    const availableItems = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-2">
            {availableItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id as AdminSection)}
                    className={`w-full flex items-center p-3 text-sm font-medium rounded-md transition-colors duration-200 ${
                        activeSection === item.id
                            ? 'bg-primary/10 text-primary dark:bg-primary/20'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <span className="material-icons mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
};

export default AdminSidebar;