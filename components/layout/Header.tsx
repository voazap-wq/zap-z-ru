
import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import IconButton from '../ui/IconButton';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { ProfileTab } from '../domain/ProfilePage';

interface HeaderProps {
    onNavOpen: () => void;
    onAuthOpen: () => void;
    onCartOpen: () => void;
    onNavigate: (page: 'home' | 'catalog' | 'profile' | 'admin' | 'page', slug?: string | null, subPage?: ProfileTab | null) => void;
}

const Header: React.FC<HeaderProps> = ({ onNavOpen, onAuthOpen, onCartOpen, onNavigate }) => {
    const { isDarkMode, toggleDarkMode, user, cart, logout, siteSettings, pages } = useAppContext();
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const isAdmin = user?.role === 'manager' || user?.role === 'superadmin';

    const headerPages = pages.filter(p => p.showInHeader);

    return (
        <header className="bg-gray-800 dark:bg-gray-900 shadow-md sticky top-0 z-30">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center space-x-4">
                        <IconButton onClick={onNavOpen} className="md:hidden text-gray-300 hover:text-white">
                            <span className="material-icons">menu</span>
                        </IconButton>
                        <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="flex items-center space-x-2 text-white">
                             <span className="material-icons text-primary text-3xl">directions_car</span>
                            <span className="text-xl font-bold tracking-tight">{siteSettings.siteName}</span>
                        </a>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-6 flex-grow justify-center px-4">
                        <nav className="flex items-center space-x-6">
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Главная</a>
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('catalog'); }} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Каталог</a>
                            {headerPages.map(page => (
                                <a key={page.id} href="#" onClick={(e) => { e.preventDefault(); onNavigate('page', page.slug); }} className="text-sm font-medium text-gray-300 hover:text-white transition-colors">{page.title}</a>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center space-x-2">
                        <IconButton onClick={toggleDarkMode} className="text-gray-300 hover:text-white">
                            <span className="material-icons">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                        </IconButton>
                        <IconButton onClick={onCartOpen} className="text-gray-300 hover:text-white">
                            <Badge content={cartItemCount > 0 ? cartItemCount : null}>
                                <span className="material-icons">shopping_cart</span>
                            </Badge>
                        </IconButton>

                        {user ? (
                             <div className="relative group pb-2">
                                <button onClick={() => onNavigate('profile')} className="flex items-center space-x-2">
                                    <Avatar name={user.fullName} />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 dark:bg-gray-700 rounded-md shadow-lg py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto border border-gray-700 dark:border-gray-600">
                                    <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('profile')}} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600">Профиль</a>
                                    {isAdmin && <a href="#" onClick={(e) => {e.preventDefault(); onNavigate('admin')}} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-600">Админ-панель</a>}
                                    <a href="#" onClick={(e) => { e.preventDefault(); logout(); onNavigate('home'); }} className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/20">Выйти</a>
                                </div>
                            </div>
                        ) : (
                            <Button variant="outlined" onClick={onAuthOpen}>
                                Войти
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;