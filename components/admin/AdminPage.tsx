import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import Dashboard from './Dashboard';
import ManageUsers from './ManageUsers';
import ManageProducts from './ManageProducts';
import ManageCategories from './ManageCategories';
import ManageNews from './ManageNews';
import ManagePages from './ManagePages';
import ManageOrders from './ManageOrders';
import SiteSettings from './SiteSettings';
import { useAppContext } from '../../hooks/useAppContext';
import { ProfileTab } from '../domain/ProfilePage';

export type AdminSection = 
  | 'dashboard'
  | 'users'
  | 'products'
  | 'categories'
  | 'orders'
  | 'news'
  | 'pages'
  | 'settings';

interface AdminPageProps {
  onNavigateTab: (tab: ProfileTab) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onNavigateTab }) => {
  const { user } = useAppContext();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');

  const renderSection = () => {
    switch(activeSection) {
      case 'users':
        return user?.role === 'superadmin' ? <ManageUsers /> : <p>Доступ запрещен</p>;
      case 'products':
        return <ManageProducts />;
      case 'categories':
        return <ManageCategories />;
      case 'orders':
        return <ManageOrders />;
      case 'settings':
        return <SiteSettings />;
      case 'dashboard':
      default:
        return <Dashboard onNavigateTab={onNavigateTab} />;
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-200px)]">
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      </aside>
      <section className="w-full md:w-3/4 lg:w-4/5">
        {renderSection()}
      </section>
    </div>
  );
};

export default AdminPage;