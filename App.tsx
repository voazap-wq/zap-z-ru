import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppContextProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './components/domain/HomePage';
import CatalogPage from './components/domain/CatalogPage';
import ProfilePage, { ProfileTab } from './components/domain/ProfilePage';
import AdminPage from './components/admin/AdminPage';
import StaticPage from './components/domain/StaticPage';
import AuthDialog from './components/domain/AuthDialog';
import CartView from './components/domain/CartView';
import { api } from './services/api';
import { Product, Category, NewsArticle, Page, SiteSettings, HomepageBlock, User, Order, Vehicle, Notification, CartItem, UserRole, Theme, ImportLogEntry, OrderItemStatus } from './types';
import Snackbar from './components/ui/Snackbar';
import TopBar from './components/layout/TopBar';
import ManagerCheckoutDialog from './components/domain/ManagerCheckoutDialog';
import { auth } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Card from './components/ui/Card';
import Button from './components/ui/Button';

type PriceSort = 'none' | 'asc' | 'desc';
type CurrentPage = 'home' | 'catalog' | 'profile' | 'admin' | 'page';

const MainApp: React.FC = () => {
    const { 
      user, 
      products, 
      categories,
      pages,
      placeOrder: placeOrderFromContext,
      createCustomerByManager,
    } = useAppContext();

    const [currentPage, setCurrentPage] = useState<CurrentPage>('home');
    const [activePageSlug, setActivePageSlug] = useState<string | null>(null);
    const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('profile');

    const [isAuthDialogOpen, setAuthDialogOpen] = useState(false);
    const [isCartOpen, setCartOpen] = useState(false);
    const [isManagerCheckoutOpen, setManagerCheckoutOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [vinFilter, setVinFilter] = useState<string | null>(null);

    const [brandFilters, setBrandFilters] = useState<string[]>([]);
    const [availabilityFilter, setAvailabilityFilter] = useState(false);
    const [priceSort, setPriceSort] = useState<PriceSort>('none');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    const staticPagesForRouting = useMemo(() => pages.filter(p => !p.isSystemPage), [pages]);

    const handleNavigate = (page: CurrentPage, slug: string | null = null, subPage: ProfileTab | null = null) => {
      setCurrentPage(page);
      setActivePageSlug(slug);
      if (page !== 'catalog') {
        setSelectedCategoryId(null);
        setSearchQuery('');
        setVinFilter(null);
      }
      if (page === 'profile') {
        setActiveProfileTab(subPage || 'profile');
      }
      window.scrollTo(0, 0);
    }
    
    const handleVinSelect = (vin: string) => {
        setVinFilter(vin);
        setSearchQuery('');
        setSelectedCategoryId(null);
        handleNavigate('catalog');
    };

    const clearVinFilter = () => {
        setVinFilter(null);
    };

    const handleSearch = (query: string) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 17 && /^[a-zA-Z0-9]+$/.test(trimmedQuery)) {
            handleVinSelect(trimmedQuery);
        } else {
            setVinFilter(null);
            setSearchQuery(trimmedQuery);
            handleNavigate('catalog');
        }
    };

    const handleCheckout = async () => {
        setCartOpen(false);
        if (!user) {
            setAuthDialogOpen(true);
            return;
        }

        if (user.role === 'manager' || user.role === 'superadmin') {
            setManagerCheckoutOpen(true);
        } else {
            try {
                await placeOrderFromContext();
                handleNavigate('profile', null, 'orders');
            } catch (error) {
                // Snackbar is shown by the context function
                console.error("Checkout failed:", error);
            }
        }
    };

    const handlePlaceOrderForCustomer = async (customerId: string) => {
        await placeOrderFromContext(customerId);
        setManagerCheckoutOpen(false);
        handleNavigate('profile', null, 'orders');
    };
    
    const handleCreateAndPlaceOrder = async (customerData: Omit<User, 'id' | 'role'>) => {
        const newCustomer = await createCustomerByManager(customerData);
        await placeOrderFromContext(newCustomer.id);
        setManagerCheckoutOpen(false);
        handleNavigate('profile', null, 'orders');
    };


    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategoryId(categoryId);
        handleNavigate('catalog');
    };

    const filteredProducts = products
      .filter(p => !vinFilter || (p.compatibleVins && p.compatibleVins.includes(vinFilter)))
      .filter(p => !selectedCategoryId || p.categoryId === selectedCategoryId)
      .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(p => brandFilters.length === 0 || brandFilters.includes(p.brand))
      .filter(p => !availabilityFilter || p.inStock)
      .sort((a, b) => {
          if (priceSort === 'asc') return a.price - b.price;
          if (priceSort === 'desc') return b.price - a.price;
          const skuA = parseInt(a.sku.replace( /^\D+/g, ''), 10) || 0;
          const skuB = parseInt(b.sku.replace( /^\D+/g, ''), 10) || 0;
          return skuA - skuB;
      });

    const availableBrands = [...new Set(products.map(p => p.brand))];

    const renderPage = () => {
        const homePageProps = {
            onCategorySelect: handleCategorySelect,
            onSearchSubmit: handleSearch,
        };

        switch (currentPage) {
            case 'catalog':
                return <CatalogPage 
                    products={filteredProducts}
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onSelectCategory={setSelectedCategoryId}
                    availableBrands={availableBrands}
                    filters={{ brandFilters, availabilityFilter, priceSort }}
                    onBrandFilterChange={setBrandFilters}
                    onAvailabilityFilterChange={setAvailabilityFilter}
                    onPriceSortChange={setPriceSort}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    vinFilter={vinFilter}
                    onClearVinFilter={clearVinFilter}
                    onVinSelect={handleVinSelect}
                />;
            case 'profile':
                if (!user) {
                    setAuthDialogOpen(true);
                    return <HomePage {...homePageProps} />;
                }
                return <ProfilePage initialTab={activeProfileTab} onVinSelect={handleVinSelect} />;
            case 'page':
                const pageToRender = staticPagesForRouting.find(p => p.slug === activePageSlug);
                if (pageToRender) {
                    return <StaticPage page={pageToRender} />;
                }
                 return <HomePage {...homePageProps} />;
            default:
                return <HomePage {...homePageProps} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <TopBar />
            <Header 
                onNavOpen={() => {
                    setSelectedCategoryId(null);
                    handleNavigate('catalog');
                }}
                onAuthOpen={() => setAuthDialogOpen(true)}
                onCartOpen={() => setCartOpen(true)}
                onNavigate={handleNavigate}
            />
            <AuthDialog isOpen={isAuthDialogOpen} onClose={() => setAuthDialogOpen(false)} />
            <CartView isOpen={isCartOpen} onClose={() => setCartOpen(false)} onCheckout={handleCheckout} />
            <ManagerCheckoutDialog 
              isOpen={isManagerCheckoutOpen}
              onClose={() => setManagerCheckoutOpen(false)}
              onPlaceOrderForCustomer={handlePlaceOrderForCustomer}
              onCreateAndPlaceOrder={handleCreateAndPlaceOrder}
            />
            
            <main className="flex-grow container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            <Footer onNavigate={handleNavigate}/>
        </div>
    );
};

const getInitialTheme = (): Theme => {
  try {
    const storedTheme = localStorage.getItem('app_theme');
    if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
      return storedTheme;
    }
  } catch (error) {
    console.error("Failed to parse theme from localStorage", error);
  }
  return 'system';
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: any }>({ open: false, message: '', severity: 'info' });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seedError, setSeedError] = useState<string | null>(null);
  
  useEffect(() => {
    const updateDarkMode = () => {
      const newIsDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(newIsDarkMode);
    };

    updateDarkMode(); 
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateDarkMode);
    
    return () => mediaQuery.removeEventListener('change', updateDarkMode);
  }, [theme]);
  
  useEffect(() => {
    try {
      localStorage.setItem('app_theme', theme);
    } catch (error) {
      console.error("Failed to save theme to localStorage", error);
    }
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, isDarkMode]);

  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

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
  const [importHistory, setImportHistory] = useState<ImportLogEntry[]>([]);

  const showSnackbar = useCallback((message: string, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);
  
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
        const [p, c, n, pg, s, hb, u, o, v, nt, ih] = await Promise.all([
            api.getProducts(), api.getCategories(), api.getNews(), api.getPages(),
            api.getSiteSettings(), api.getHomepageBlocks(), api.getUsers(),
            api.getOrders(), api.getVehicles(), api.getNotifications(), api.getImportHistory()
        ]);
        setProducts(p); setCategories(c); setNews(n); setPages(pg);
        setSiteSettings(s); setHomepageBlocks(hb); setUsers(u);
        setOrders(o); setVehicles(v); setNotifications(nt); setImportHistory(ih);
    } catch (error) {
        console.error("Failed to load initial data:", error);
        const errorMessage = error instanceof Error ? error.message : "Не удалось загрузить данные. Проверьте правила безопасности Firestore и обновите страницу.";
        setLoadError(errorMessage);
        showSnackbar(errorMessage, "error");
    } finally {
        setIsLoading(false);
    }
  }, [showSnackbar]);

  const seedDatabase = useCallback(async () => {
    setIsSeeding(true);
    setSeedError(null);
    try {
      await api.seedDatabase();
      showSnackbar('Демо-данные успешно загружены!', 'success');
      await loadData(); // Reload all data after seeding
    } catch (error) {
      console.error("Database seeding failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при загрузке демо-данных.';
      setSeedError(errorMessage);
    } finally {
        setIsSeeding(false);
    }
  }, [loadData, showSnackbar]);

  useEffect(() => {
    loadData();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            const userProfile = await api.getUserProfile(firebaseUser.uid);
            if (userProfile) {
                setUser(userProfile);
            } else {
                // This might happen if the user record in Firestore is deleted but they are still logged in
                setUser(null);
            }
        } else {
            setUser(null);
        }
    });
    return () => unsubscribe();
  }, [loadData]);


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

  const login = async (email: string, password: string) => {
    await api.login(email, password);
    // onAuthStateChanged will handle setting the user state
    showSnackbar('Вход выполнен успешно!', 'success');
  };
  const register = async (fullName: string, email: string, password: string) => {
    await api.register(fullName, email, password);
    // onAuthStateChanged will handle setting the user state
    await api.getNotifications().then(setNotifications);
    showSnackbar('Регистрация прошла успешно!', 'success');
  };
  const logout = async () => { 
    await api.logout();
    setUser(null); 
    setCart([]); 
    showSnackbar('Вы вышли из системы.'); 
  };
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, status: 'available' }];
    });
    showSnackbar(`"${product.name}" добавлен в корзину`, 'success');
  };
  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId));
  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) removeFromCart(productId);
    else setCart(prev => prev.map(item => (item.id === productId ? { ...item, quantity } : item)));
  };
  const clearCart = () => setCart([]);
  const placeOrder = async (customerId?: string) => {
    const orderUserId = customerId || user?.id;
    if (!orderUserId) {
        const message = "Пользователь для заказа не определен";
        showSnackbar(message, 'error');
        throw new Error(message);
    }

    if (cart.length === 0) {
      showSnackbar('Ваша корзина пуста', 'error');
      return;
    }
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    try {
      const newOrder = await api.placeOrder(orderUserId, { items: cart, total });
      
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);

      setOrders(prev => [newOrder, ...prev]);
      
      const updatedNotifications = await api.getNotifications();
      setNotifications(updatedNotifications);
      
      clearCart();
      showSnackbar(`Заказ #${newOrder.id} для клиента ${newOrder.customerName} успешно создан!`, 'success');
    } catch (error) {
        console.error("Order placement failed:", error);
        
        const updatedProducts = await api.getProducts();
        setProducts(updatedProducts);
        
        const errorMessage = error instanceof Error ? error.message : "Не удалось оформить заказ.";
        showSnackbar(errorMessage, 'error');
        throw error;
    }
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
  
  const createHandler = <T, U>(apiFn: (data: T) => Promise<U>, setData: React.Dispatch<React.SetStateAction<U[]>>, name: string) => async (data: T): Promise<U> => {
    const newItem = await apiFn(data);
    setData(prev => [newItem, ...prev as any]);
    showSnackbar(`${name} успешно создан`, 'success');
    return newItem;
  };
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

  const createCustomerByManager = async (data: Omit<User, 'id' | 'role'>): Promise<User> => {
      const newCustomer = await api.createCustomerByManager(data);
      setUsers(prev => [newCustomer, ...prev]);
      showSnackbar(`Новый клиент ${newCustomer.fullName} успешно создан`, 'success');
      return newCustomer;
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
      const updatedUser = await api.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      if (user?.id === userId) {
          setUser(updatedUser);
      }
      showSnackbar(`Роль пользователя ${updatedUser.fullName} обновлена`, 'success');
  };

  const selfPromoteAdmin = useCallback(async () => {
    if (user && user.email === 'admin@example.com' && user.role === 'customer') {
        try {
            const updatedUser = await api.updateUserRole(user.id, 'superadmin');
            setUser(updatedUser);
            showSnackbar('Ваша роль администратора была восстановлена. Страница будет перезагружена.', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Не удалось восстановить права администратора.';
            showSnackbar(message, 'error');
        }
    }
  }, [user, showSnackbar]);

  const deleteUser = deleteHandler(api.deleteUser, setUsers, 'Пользователь');

  const createProduct = createHandler(api.createProduct, setProducts as any, 'Товар');
  const updateProduct = updateHandler(api.updateProduct, setProducts as any, 'Товар');
  const deleteProduct = deleteHandler(api.deleteProduct, setProducts as any, 'Товар');
  const batchUpdateProducts = async (productsToUpsert: Omit<Product, 'id'>[]) => {
      await api.batchUpdateProducts(productsToUpsert);
      const updatedProducts = await api.getProducts();
      setProducts(updatedProducts);
      showSnackbar(`Импорт завершен. Обработано ${productsToUpsert.length} записей.`, 'success');
  };
  const clearWarehouse = async () => {
    await api.clearWarehouse();
    setProducts([]);
    showSnackbar('Склад успешно очищен', 'success');
  };
  const addImportLog = async (logEntry: Omit<ImportLogEntry, 'date'>) => {
      await api.addImportLog(logEntry);
      const updatedHistory = await api.getImportHistory();
      setImportHistory(updatedHistory);
  };
  
  const createCategory = createHandler(api.createCategory, setCategories as any, 'Категория');
  const updateCategory = updateHandler(api.updateCategory, setCategories as any, 'Категория');
  const deleteCategory = deleteHandler(api.deleteCategory, setCategories as any, 'Категория');

  const createNews = createHandler(api.createNews, setNews as any, 'Новость');
  const updateNews = updateHandler(api.updateNews, setNews as any, 'Новость');
  const deleteNews = deleteHandler(api.deleteNews, setNews as any, 'Новость');

  const createPage = createHandler(api.createPage, setPages as any, 'Страница');
  const updatePage = updateHandler(api.updatePage, setPages as any, 'Страница');
  const deletePage = deleteHandler(api.deletePage, setPages as any, 'Страница');

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updatedOrder = await api.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    showSnackbar(`Статус заказа #${orderId} обновлен`, 'success');
    
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
  
  const updateOrderItemStatus = async (orderId: string, productId: string, status: OrderItemStatus) => {
    const updatedOrder = await api.updateOrderItemStatus(orderId, productId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
    showSnackbar(`Статус товара в заказе #${updatedOrder.orderNumber} обновлен`, 'success');
    return updatedOrder;
  };

  const updateSiteSettings = async (data: SiteSettings) => {
    const newSettings = await api.updateSiteSettings(data);
    setSiteSettings(newSettings);
    showSnackbar('Настройки сайта обновлены', 'success');
    return newSettings;
  };

  const updateHomepageBlocks = async (blocks: HomepageBlock[]) => {
    const newBlocks = await api.updateHomepageBlocks(blocks);
    setHomepageBlocks(newBlocks);
    showSnackbar('Структура главной страницы обновлена', 'success');
    return newBlocks;
  };

  const markNotificationAsRead = async (id: number) => {
    await api.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = async () => {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };


  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Загрузка...</div>;
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-100 dark:bg-gray-900">
        <Card className="p-8 max-w-lg w-full">
            <span className="material-icons text-6xl text-red-500 mb-4">error_outline</span>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Ошибка загрузки данных</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                Не удалось подключиться к базе данных. Пожалуйста, убедитесь, что вы выполнили все шаги по настройке Firebase.
            </p>
            <div className="text-left text-sm space-y-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
               <p><strong>Возможные причины:</strong></p>
               <ul className="list-disc list-inside pl-2">
                    <li>База данных Firestore не создана в проекте Firebase.</li>
                    <li>Неправильно настроены <strong className="font-semibold">Правила безопасности (Rules)</strong> в Firestore.</li>
                    <li>Проблема с сетевым подключением.</li>
                </ul>
            </div>
            <p className="mt-4 text-xs text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded-md break-all">
                <span className="font-semibold">Техническая информация:</span> {loadError}
            </p>
            <Button onClick={loadData} className="mt-8 w-full">
                Попробовать снова
            </Button>
        </Card>
      </div>
    );
  }

  if (!siteSettings) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-gray-100 dark:bg-gray-900">
            <Card className="p-8 max-w-lg w-full">
                <span className="material-icons text-6xl text-primary mb-4">storefront</span>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Добро пожаловать!</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Похоже, это ваш первый запуск. База данных пуста. Нажмите кнопку ниже, чтобы загрузить демонстрационные данные и создать аккаунт администратора.
                </p>
                <div className="text-left text-sm space-y-2 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                    <p><strong>Будет создано:</strong></p>
                    <ul className="list-disc list-inside pl-2">
                        <li>Демонстрационные товары и категории.</li>
                        <li>Тестовые аккаунты:</li>
                        <li className="ml-4 font-mono">admin@example.com (Админ)</li>
                        <li className="ml-4 font-mono">ivan@example.com (Клиент)</li>
                        <li>Пароль для обоих: <strong className="font-semibold">password</strong></li>
                    </ul>
                </div>
                {seedError && (
                    <div className="mt-6 text-left p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/50">
                        <div className="flex">
                            <span className="material-icons text-red-500 mr-3">error</span>
                            <div>
                                <h3 className="font-bold text-red-800 dark:text-red-200">Ошибка инициализации</h3>
                                <p className="mt-1 text-sm text-red-700 dark:text-red-300">{seedError}</p>
                            </div>
                        </div>
                    </div>
                )}
                <Button onClick={seedDatabase} disabled={isSeeding} className="mt-8 w-full">
                    {isSeeding ? 'Загрузка...' : seedError ? 'Попробовать снова' : 'Загрузить демо-данные'}
                </Button>
            </Card>
        </div>
      );
  }

  return (
    <AppContextProvider value={{
      isDarkMode, theme, setTheme,
      showSnackbar,
      user, login, register, logout,
      cart, addToCart, removeFromCart, updateCartQuantity, clearCart,
      products, categories, news, pages, users, orders, vehicles, notifications, siteSettings, homepageBlocks, importHistory,
      updateUser, addVehicle, deleteVehicle, placeOrder,
      seedDatabase, selfPromoteAdmin,
      createCustomerByManager,
      markNotificationAsRead, markAllNotificationsAsRead,
      updateUserRole, deleteUser,
      createProduct, updateProduct, deleteProduct, batchUpdateProducts, clearWarehouse, addImportLog,
      createCategory, updateCategory, deleteCategory,
      createNews, updateNews, deleteNews,
      createPage, updatePage, deletePage,
      updateOrderStatus, updateOrderItemStatus,
      updateSiteSettings, updateHomepageBlocks
    }}>
        <MainApp />
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        />
    </AppContextProvider>
  );
};

export default App;