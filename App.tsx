import React, { useState, useEffect, useCallback } from 'react';
import { AppContextProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/domain/HomePage';
import CatalogPage from './components/domain/CatalogPage';
import ProfilePage, { ProfileTab } from './components/domain/ProfilePage';
import AdminPage from './components/admin/AdminPage';
import StaticPage from './components/domain/StaticPage';
// FIX: SideNav does not have a default export, so we import it as a named export.
import { SideNav } from './components/layout/SideNav';
import AuthDialog from './components/domain/AuthDialog';
import CartView from './components/domain/CartView';
import { api } from './services/api';
import { Product, Category, NewsArticle, Page, SiteSettings, HomepageBlock, User, Order, Vehicle, Notification, CartItem, UserRole } from './types';

type PriceSort = 'none' | 'asc' | 'desc';
type CurrentPage = 'home' | 'catalog' | 'profile' | 'admin' | 'page';

const MainApp: React.FC = () => {
    const { 
      user, 
      products, 
      categories,
      pages,
      showSnackbar,
      // CRUD functions from context
      placeOrder: placeOrderFromContext,
    } = useAppContext();

    const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
    const [activePageSlug, setActivePageSlug] = useState<string | null>(null);
    const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('profile');

    const [isSideNavOpen, setSideNavOpen] = useState(false);
    const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [brandFilters, setBrandFilters] = useState<string[]>([]);
    const [availabilityFilter, setAvailabilityFilter] = useState(false);
    const [priceSort, setPriceSort] = useState<PriceSort>('none');

    const handleNavigate = (page: CurrentPage, slug: string | null = null, subPage: ProfileTab | null = null) => {
      setCurrentPage(page);
      setActivePageSlug(slug);
      if (page === 'profile') {
        setActiveProfileTab(subPage || 'profile');
      }
      window.scrollTo(0, 0);
    }
    
    const handleSearchFocus = () => {
        if (currentPage !== 'catalog') {
            handleNavigate('catalog');
        }
    };

    const handleCheckout = async () => {
        setCartOpen(false);
        if (!user) {
            setAuthDialogOpen(true);
            return;
        }
        await placeOrderFromContext();
        handleNavigate('profile', null, 'orders');
    };

    const filteredProducts = products
      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => brandFilters.length === 0 || brandFilters.includes(p.brand))
      .filter(p => !availabilityFilter || p.inStock)
      .sort((a, b) => {
          if (priceSort === 'asc') return a.price - b.price;
          if (priceSort === 'desc') return b.price - a.price;
          return 0;
      });

    const availableBrands = [...new Set(products.map(p => p.brand))];
    
    const homePageProps = {
        onCatalogClick: () => handleNavigate('catalog'),
        searchQuery: searchQuery,
        onSearchChange: setSearchQuery,
        onSearchFocus: handleSearchFocus
    };

    const renderPage = () => {
        const isAdmin = user?.role === 'manager' || user?.role === 'superadmin';
        if (isAdmin && currentPage === 'admin') {
            return <AdminPage />;
        }
        switch (currentPage) {
            case 'catalog':
                return <CatalogPage 
                    products={filteredProducts}
                    availableBrands={availableBrands}
                    filters={{ brandFilters, availabilityFilter, priceSort }}
                    onBrandFilterChange={setBrandFilters}
                    onAvailabilityFilterChange={setAvailabilityFilter}
                    onPriceSortChange={setPriceSort}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />;
            case 'profile':
                if (!user) {
                    setAuthDialogOpen(true);
                    return <HomePage {...homePageProps} />;
                }
                return <ProfilePage initialTab={activeProfileTab} />;
            case 'page':
                const pageToRender = pages.find(p => p.slug === activePageSlug);
                if (pageToRender) {
                    return <StaticPage page={pageToRender} />;
                }
                 // Fallback to home if page not found
                 return <HomePage {...homePageProps} />;
            default:
                return <HomePage {...homePageProps} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Header 
                onNavOpen={() => setSideNavOpen(true)}
                onAuthOpen={() => setAuthDialogOpen(true)}
                onCartOpen={() => setCartOpen(true)}
                onNavigate={handleNavigate}
            />
            <SideNav isOpen={isSideNavOpen} onClose={() => setSideNavOpen(false)} categories={categories} onNavigate={() => handleNavigate('catalog')} />
            <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
            <CartView isOpen={isCartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            <Footer onNavigate={handleNavigate}/>
        </div>
    );
};

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('isDarkMode');
    return stored ? JSON.parse(stored) : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: any }>({ open: false, message: '', severity: 'info' });

  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [homepageBlocks, setHomepageBlocks] = useState<HomepageBlock[]>([]);

  // Initial Data Load
  useEffect(() => {
    Promise.all([
      api.getProducts(), api.getCategories(), api.getNews(), api.getPages(),
      api.getSiteSettings(), api.getHomepageBlocks(), api.getUsers(),
      api.getOrders(), api.getVehicles(), api.getNotifications()
    ]).then(([p, c, n, pg, s, hb, u, o, v, nt]) => {
      setProducts(p); setCategories(c); setNews(n); setPages(pg);
      setSiteSettings(s); setHomepageBlocks(hb); setUsers(u);
      setOrders(o); setVehicles(v); setNotifications(nt);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);
  
  // SEO Meta Tags Effect
  useEffect(() => {
    if (siteSettings) {
        document.title = siteSettings.seoTitle || siteSettings.siteName;
        
        const descriptionTag = document.querySelector('meta[name="description"]');
        if (descriptionTag) {
            descriptionTag.setAttribute('content', siteSettings.seoDescription || '');
        }

        let keywordsTag = document.querySelector('meta[name="keywords"]');
        if (!keywordsTag) {
            keywordsTag = document.createElement('meta');
            keywordsTag.setAttribute('name', 'keywords');
            document.head.appendChild(keywordsTag);
        }
        keywordsTag.setAttribute('content', siteSettings.seoKeywords || '');
    }
  }, [siteSettings]);

  const showSnackbar = useCallback((message: string, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  // --- CONTEXT VALUE ---
  const login = async (email: string, password: string) => {
    const loggedInUser = await api.login(email, password);
    setUser(loggedInUser);
    showSnackbar('Вход выполнен успешно!', 'success');
  };
  const register = async (fullName: string, email: string, password: string) => {
    const newUser = await api.register(fullName, email, password);
    setUser(newUser);
    showSnackbar('Регистрация прошла успешно!', 'success');
  };
  const logout = () => { setUser(null); setCart([]); showSnackbar('Вы вышли из системы.'); };
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    showSnackbar(`"${product.name}" добавлен в корзину`, 'success');
  };
  const removeFromCart = (productId: number) => setCart(prev => prev.filter(item => item.id !== productId));
  const updateCartQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) removeFromCart(productId);
    else setCart(prev => prev.map(item => (item.id === productId ? { ...item, quantity } : item)));
  };
  const clearCart = () => setCart([]);
  const placeOrder = async () => {
    if (!user) throw new Error("Пользователь не авторизован");
    if (cart.length === 0) {
      showSnackbar('Ваша корзина пуста', 'error');
      return;
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder = await api.placeOrder(user.id, { items: cart, total });
    setOrders(prev => [newOrder, ...prev]);
    clearCart();
    showSnackbar(`Заказ #${newOrder.id} успешно создан!`, 'success');
  };
  const updateUser = async (data: Partial<Omit<User, 'id' | 'email' | 'role'>>) => {
    if (!user) throw new Error('Пользователь не авторизован');
    const updatedUser = await api.updateUserProfile(user.id, data);
    setUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    showSnackbar('Профиль обновлен', 'success');
  }
  const addVehicle = async (vehicleData: Omit<Vehicle, 'id' | 'userId'>) => {
    if (!user) throw new Error("Пользователь не авторизован");
    const newVehicle = await api.addVehicle(user.id, vehicleData);
    setVehicles(prev => [...prev, newVehicle]);
    showSnackbar('Транспорт добавлен', 'success');
  };
  const deleteVehicle = async (vehicleId: string) => {
    await api.deleteVehicle(vehicleId);
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    showSnackbar('Транспорт удален', 'success');
  };
  
  // --- ADMIN FUNCTIONS ---
  // FIX: Removed incorrect 'as any[]' cast to fix type error.
  // FIX: Added explicit return type and returned the new item to match AppContextType.
  const createHandler = <T, U>(apiFn: (data: T) => Promise<U>, setData: React.Dispatch<React.SetStateAction<U[]>>, name: string) => async (data: T): Promise<U> => {
    const newItem = await apiFn(data);
    setData(prev => [newItem, ...prev]);
    showSnackbar(`${name} успешно создан`, 'success');
    return newItem;
  };
  // FIX: Added explicit return type and returned the updated item to match AppContextType.
  const updateHandler = <T, U extends { id: any }>(apiFn: (id: any, data: T) => Promise<U>, setData: React.Dispatch<React.SetStateAction<U[]>>, name: string) => async (id: any, data: T): Promise<U> => {
    const updatedItem = await apiFn(id, data);
    setData(prev => prev.map(item => item.id === id ? updatedItem : item));
    showSnackbar(`${name} успешно обновлен`, 'success');
    return updatedItem;
  };
  const deleteHandler = <U extends { id: any }>(apiFn: (id: any) => Promise<void>, setData: React.Dispatch<React.SetStateAction<U[]>>, name: string) => async (id: any) => {
    await apiFn(id);
    setData(prev => prev.filter(item => item.id !== id));
    showSnackbar(`${name} удален`, 'success');
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
      const updatedUser = await api.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      showSnackbar(`Роль пользователя ${updatedUser.fullName} обновлена`, 'success');
  };
  const deleteUser = deleteHandler(api.deleteUser, setUsers, 'Пользователь');

  const createProduct = createHandler(api.createProduct, setProducts, 'Товар');
  const updateProduct = updateHandler(api.updateProduct, setProducts, 'Товар');
  const deleteProduct = deleteHandler(api.deleteProduct, setProducts, 'Товар');
  
  const createCategory = createHandler(api.createCategory, setCategories, 'Категория');
  const updateCategory = updateHandler(api.updateCategory, setCategories, 'Категория');
  const deleteCategory = deleteHandler(api.deleteCategory, setCategories, 'Категория');

  const createNews = createHandler(api.createNews, setNews, 'Новость');
  const updateNews = updateHandler(api.updateNews, setNews, 'Новость');
  const deleteNews = deleteHandler(api.deleteNews, setNews, 'Новость');

  const createPage = createHandler(api.createPage, setPages, 'Страница');
  const updatePage = updateHandler(api.updatePage, setPages, 'Страница');
  const deletePage = deleteHandler(api.deletePage, setPages, 'Страница');

  // FIX: Returned the updated order to match AppContextType.
  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updatedOrder = await api.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    showSnackbar(`Статус заказа #${orderId} обновлен`, 'success');
    
    // Send notification to Telegram bot
    if (updatedOrder.userId) {
        const statusMap: Record<Order['status'], string> = {
            pending: 'В обработке',
            processing: 'Собирается',
            shipped: 'Отправлен',
            delivered: 'Доставлен',
            cancelled: 'Отменен',
        };

        const notificationPayload = {
            type: 'order_status_update',
            userId: updatedOrder.userId,
            data: {
                orderId: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber,
                status: statusMap[status],
                total: updatedOrder.total,
            }
        };
        api.notifyUser(notificationPayload);
    }

    return updatedOrder;
  };

  // FIX: Returned the new settings to match AppContextType.
  const updateSiteSettings = async (data: SiteSettings) => {
    const newSettings = await api.updateSiteSettings(data);
    setSiteSettings(newSettings);
    showSnackbar('Настройки сайта обновлены', 'success');
    return newSettings;
  };

  // FIX: Returned the new blocks to match AppContextType.
  const updateHomepageBlocks = async (blocks: HomepageBlock[]) => {
    const newBlocks = await api.updateHomepageBlocks(blocks);
    setHomepageBlocks(newBlocks);
    showSnackbar('Структура главной страницы обновлена', 'success');
    return newBlocks;
  };


  if (!siteSettings) return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;

  return (
    <AppContextProvider value={{
      isDarkMode, toggleDarkMode: () => setIsDarkMode(p => !p),
      showSnackbar,
      user, login, register, logout,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      products, categories, news, pages, users, orders, vehicles, notifications, siteSettings, homepageBlocks,
      updateUser, addVehicle, deleteVehicle, placeOrder,
      updateUserRole, deleteUser,
      createProduct, updateProduct, deleteProduct,
      createCategory, updateCategory, deleteCategory,
      createNews, updateNews, deleteNews,
      createPage, updatePage, deletePage,
      updateOrderStatus,
      updateSiteSettings, updateHomepageBlocks
    }}>
        <MainApp />
    </AppContextProvider>
  );
};

export default App;