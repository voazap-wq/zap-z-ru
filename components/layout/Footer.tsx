
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { ProfileTab } from '../domain/ProfilePage';

interface FooterProps {
    onNavigate: (page: 'home' | 'catalog' | 'profile' | 'admin' | 'page', slug?: string | null, subPage?: ProfileTab | null) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { pages, siteSettings, categories } = useAppContext();
  const footerPages = pages.filter(p => p.showInFooter);
  const footerCategories = categories.slice(0, 4);

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-3">Информация</h3>
            <ul className="space-y-2 text-sm">
              {footerPages.map(page => (
                <li key={page.id}><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('page', page.slug)}} className="text-gray-600 dark:text-gray-400 hover:text-primary">{page.title}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Каталог</h3>
            <ul className="space-y-2 text-sm">
               {footerCategories.map(cat => (
                 <li key={cat.id}><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog')}} className="text-gray-600 dark:text-gray-400 hover:text-primary">{cat.name}</a></li>
               ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Поддержка</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile')}} className="text-gray-600 dark:text-gray-400 hover:text-primary">Личный кабинет</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile', null, 'orders')}} className="text-gray-600 dark:text-gray-400 hover:text-primary">История заказов</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Контакты</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>+7 (800) 555-35-35</li>
              <li>info@autozapchasti.com</li>
              <li>г. Москва, ул. Пушкина, д. Колотушкина</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} {siteSettings.siteName}. Все права защищены.
        </div>
      </div>
    </footer>
  );
};

export default Footer;