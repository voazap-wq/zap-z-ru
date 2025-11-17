import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Tabs from '../ui/Tabs';
import UserProfile from './UserProfile';
import OrderHistory from './OrderHistory';
import MyGarage from './MyGarage';
import Notifications from './Notifications';
import AdminPage from '../admin/AdminPage';

export type ProfileTab = 'profile' | 'garage' | 'orders' | 'notifications' | 'admin';

interface ProfilePageProps {
  initialTab?: ProfileTab;
  onVinSelect: (vin: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ initialTab = 'profile', onVinSelect }) => {
  const { user, orders, vehicles, notifications } = useAppContext();
  const isAdmin = user?.role === 'manager' || user?.role === 'superadmin';

  const getEffectiveTab = (tab: ProfileTab): ProfileTab => {
      if (isAdmin && tab === 'profile') {
          return 'admin';
      }
      return tab;
  };
  
  // FIX: Cast `initialTab` to `ProfileTab` to fix type mismatch.
  const [activeTab, setActiveTab] = useState<ProfileTab>(getEffectiveTab(initialTab as ProfileTab));

  useEffect(() => {
    // FIX: Cast `initialTab` to `ProfileTab` to fix type mismatch.
    setActiveTab(getEffectiveTab(initialTab as ProfileTab));
  }, [initialTab, isAdmin]);

  const userOrders = user ? orders.filter(o => o.userId === user.id) : [];
  const userVehicles = user ? vehicles.filter(v => v.userId === user.id) : [];
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'profile', label: 'Мой профиль' },
    { id: 'garage', label: `Мой гараж (${userVehicles.length})` },
    { id: 'orders', label: `История заказов (${userOrders.length})` },
    { id: 'notifications', label: `Уведомления (${unreadNotificationsCount})` },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Администрирование' });
  }

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'garage':
        return <MyGarage onVinSelect={onVinSelect} />;
      case 'orders':
        return <OrderHistory />;
      case 'notifications':
        return <Notifications />;
      case 'admin':
        return isAdmin ? <AdminPage onNavigateTab={handleTabChange} /> : null;
      case 'profile':
      default:
        return <UserProfile />;
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Личный кабинет</h1>
      <div className="mb-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabChange} />
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfilePage;