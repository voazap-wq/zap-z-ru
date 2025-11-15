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

  // Determine the effective tab based on user role and initial navigation target
  // FIX: Added explicit return type to prevent incorrect type inference to 'string'.
  const getEffectiveTab = (tab: ProfileTab): ProfileTab => {
      if (isAdmin && tab === 'profile') {
          return 'admin';
      }
      return tab;
  };
  
  const [activeTab, setActiveTab] = useState<ProfileTab>(getEffectiveTab(initialTab));

  useEffect(() => {
    setActiveTab(getEffectiveTab(initialTab));
  }, [initialTab, isAdmin]);


  // Filter data for the current user
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

  const renderContent = () => {
    switch(activeTab) {
      case 'garage':
        return <MyGarage onVinSelect={onVinSelect} />;
      case 'orders':
        return <OrderHistory />;
      case 'notifications':
        return <Notifications />;
      case 'admin':
        return isAdmin ? <AdminPage onNavigateTab={setActiveTab} /> : null;
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