import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import IconButton from '../ui/IconButton';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { ProfileTab } from '../domain/ProfilePage';
import ThemeSwitcher from '../ui/ThemeSwitcher';
import NotificationDropdown from './NotificationDropdown';

// Helper component for right-side action icons
const HeaderAction: React.FC<{ icon?: string; label: string; onClick: () => void; children?: React.ReactNode }> = ({ icon, label, onClick, children }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center text-center px-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors">
        {children || <span className="material-icons text-2xl mb-0.5">{icon}</span>}
        <span className="leading-tight whitespace-nowrap">{label}</span>
    </button>
);


interface HeaderProps {
    onNavOpen: () => void;
    onAuthOpen: () => void;
    onCartOpen: () => void;
    onNavigate: (page: 'home' | 'catalog' | 'profile' | 'admin' | 'page' | 'news' | 'contacts', slug?: string | null, subPage?: ProfileTab | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavOpen, onAuthOpen, onCartOpen, onNavigate }) => {
    const { user, cart, siteSettings, pages, notifications } = useAppContext();
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const headerPages = pages.filter(p => p.showInHeader);
    const [isNotificationOpen, setNotificationOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);

    const isAdmin = user?.role === 'manager' || user?.role === 'superadmin';
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);


    const FallbackLogo = () => (
        <div className="flex items-center space-x-2">
            <svg className="h-8 w-auto text-primary" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M35.492 13.954l-4.546-4.546-1.414 1.414 4.546 4.546-2.475 2.474-4.546-4.545-1.414 1.414 4.546 4.546-2.475 2.475-4.546-4.546-1.414 1.414 4.546 4.546-4.95 4.95h-2.828l-4.95-4.95 4.545-4.546-1.414-1.414-4.546 4.546-2.475-2.475 4.546-4.546-1.414-1.414-4.546 4.545-2.474-2.474 4.545-4.546-1.414-1.414-4.546 4.545V20h4.95l4.95-4.95h2.828l4.95 4.95 4.95-4.95h2.828l4.95 4.95V13.954z M20 22.828L17.172 20h-2.828l-2.828 2.828v2.828L14.343 28.5h2.829L20 25.672l2.828 2.828h2.829l2.828-2.828v-2.828L25.657 20h-2.829L20 22.828z M15.757 24.243L14.343 25.657v1.414h1.414l1.414-1.414-1.414-1.414z M24.243 24.243l-1.414 1.414h1.414v-1.414l1.414 1.414-1.414 1.414z"/>
                <path fillRule="evenodd" clipRule="evenodd" d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 38C10.075 38 2 29.925 2 20S10.075 2 20 2s18 8.075 18 18-8.075 18-18 18z"/>
            </svg>
            <span className="text-xl font-bold tracking-tight hidden lg:block">{siteSettings.siteName}</span>
        </div>
    );
    return (
        <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-30 border-b border-gray-200 dark:border-gray-700">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-2.5 gap-x-4 md:gap-x-6">
                    {/* Left: Logo & Catalog Button */}
                    <div className="flex items-center flex-shrink-0 gap-x-4">
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
                             {siteSettings.logoUrl ? (
                                <img src={siteSettings.logoUrl} alt={siteSettings.siteName} className="h-8 md:h-9 w-auto" />
                             ) : (
                                <FallbackLogo />
                             )}
                        </a>
                        <Button
                            onClick={onNavOpen}
                            className="!bg-primary hover:!bg-primary-dark focus:!ring-primary-light !text-white !rounded-lg !px-3 sm:!px-4 !py-2.5 !shadow-md"
                        >
                            <span className="material-icons mr-1 sm:mr-2">menu</span>
                            <span className="hidden sm:inline">Каталоги</span>
                        </Button>
                    </div>
                    
                    {/* Right: Actions */}
                    <div className="flex items-center flex-shrink-0">
                        <HeaderAction label="Корзина" onClick={onCartOpen}>
                            <Badge content={cartItemCount > 0 ? cartItemCount : null}>
                                <span className="material-icons text-2xl mb-0.5">shopping_cart</span>
                            </Badge>
                        </HeaderAction>
                        <HeaderAction icon="receipt_long" label="Заказы" onClick={() => user ? onNavigate('profile', null, 'orders') : onAuthOpen()} />
                        <HeaderAction icon="directions_car" label="Гараж" onClick={() => user ? onNavigate('profile', null, 'garage') : onAuthOpen()} />
                        
                        {isAdmin && (
                            <div ref={notificationRef} className="relative">
                                <HeaderAction label="Уведомления" onClick={() => setNotificationOpen(prev => !prev)}>
                                    <Badge content={unreadNotificationsCount > 0 ? unreadNotificationsCount : null}>
                                        <span className="material-icons text-2xl mb-0.5">notifications</span>
                                    </Badge>
                                </HeaderAction>
                                {isNotificationOpen && <NotificationDropdown
                                    onClose={() => setNotificationOpen(false)}
                                    onViewAll={() => onNavigate('profile', null, 'notifications')}
                                />}
                            </div>
                        )}
                        
                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1 sm:mx-2"></div>
                        
                        <ThemeSwitcher />

                        {user ? (
                            <HeaderAction label={user.fullName.split(' ')[0]} onClick={() => onNavigate('profile')}>
                                <Avatar name={user.fullName} className="mb-0.5" />
                            </HeaderAction>
                        ) : (
                            <HeaderAction icon="person_outline" label="Войти" onClick={onAuthOpen} />
                        )}
                    </div>
                </div>
            </div>
             {/* Sub-Navigation for Static Pages */}
             <nav className="border-t border-gray-200 dark:border-gray-700 hidden md:block">
                <div className="container mx-auto px-4">
                    <ul className="flex items-center space-x-8 h-12">
                        {headerPages.map(page => (
                            <li key={page.id}>
                                <a
                                    href="#"
                                    onClick={(e) => { 
                                        e.preventDefault(); 
                                        // System pages use their slug as the page type, custom pages are all of type 'page'
                                        const pageType = page.isSystemPage ? page.slug as any : 'page';
                                        const slug = page.isSystemPage ? null : page.slug;
                                        onNavigate(pageType, slug); 
                                    }}
                                    className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-light transition-colors"
                                >
                                    {page.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
        </header>
    );
};

export default Header;