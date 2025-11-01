
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Tabs from '../ui/Tabs';
import UserProfile from './UserProfile';
import OrderHistory from './OrderHistory';
import MyGarage from './MyGarage';
import Notifications from './Notifications';

export type ProfileTab = 'profile' | 'garage' | 'orders' | 'notifications';

interface ProfilePageProps {
  initialTab?: ProfileTab;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ initialTab = 'profile' }) => {
  const { orders, vehicles, notifications } = useAppContext();
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: 'profile' as ProfileTab, label: 'Мой профиль' },
    { id: 'garage' as ProfileTab, label: `Мой гараж (${vehicles.length})` },
    { id: 'orders' as ProfileTab, label: `История заказов (${orders.length})` },
    { id: 'notifications' as ProfileTab, label: `Уведомления (${unreadNotificationsCount})` },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'garage':
        return <MyGarage />;
      case 'orders':
        return <OrderHistory />;
      case 'notifications':
        return <Notifications />;
      case 'profile':
      default:
        return <UserProfile />;
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>
      <div className="mb-6">
        {/* FIX: Wrapped state setter in an arrow function to match the onTabClick prop type. */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={(tabId) => setActiveTab(tabId)} />
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfilePage;