// services/api.ts
import { mockProducts, mockCategories, mockNews } from '../constants';
import { Product, Category, NewsArticle, Page, SiteSettings, HomepageBlock, User, Order, Vehicle, Notification, UserRole, CartItem, ImportLogEntry, OrderItemStatus } from '../types';

// --- LocalStorage Persistence Layer ---

// Helper to get an array from localStorage or initialize it
const getData = <T>(key: string, initialData: T[]): T[] => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        localStorage.removeItem(key); // Clear corrupted data
    }
    // If nothing in storage or parsing fails, use initial data and save it
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
};

// Helper to get a single object from localStorage or initialize it
const getObjectData = <T>(key: string, initialData: T): T => {
    try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        localStorage.removeItem(key);
    }
    localStorage.setItem(key, JSON.stringify(initialData));
    return initialData;
};

// Helper to save data to localStorage
const saveData = <T>(key: string, data: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        // This can happen if localStorage is full
        console.error(`Failed to save ${key} to localStorage`, error);
    }
};

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- In-memory data store, initialized from localStorage ---

let systemPages: Page[] = [
    { id: 'system_home', title: 'Главная страница', slug: 'home', content: [], showInHeader: false, showInFooter: false, isSystemPage: true },
    { id: 'system_catalog', title: 'Каталог', slug: 'catalog', content: [], showInHeader: false, showInFooter: false, isSystemPage: true },
    { id: 'system_profile', title: 'Личный кабинет', slug: 'profile', content: [], showInHeader: false, showInFooter: false, isSystemPage: true },
];

let products: Product[] = getData<Product>('app_products', mockProducts);
let categories: Category[] = getData<Category>('app_categories', mockCategories);
let news: NewsArticle[] = getData<NewsArticle>('app_news', mockNews);
let users: User[] = getData<User>('app_users', [
    { id: '1', fullName: 'Иван Иванов', email: 'ivan@example.com', role: 'customer', phone: '+79991234567', telegramId: '@ivanov' },
    { id: '2', fullName: 'Петр Петров', email: 'petr@example.com', role: 'manager', phone: '+79992345678' },
    { id: '3', fullName: 'Сергей Сергеев', email: 'sergey@example.com', role: 'superadmin', phone: '+79993456789' },
    { id: '4', fullName: 'Администратор', email: 'admin@example.com', role: 'superadmin', phone: '+79994567890' },
    { id: '5', fullName: 'Елена Сидорова', email: 'elena@example.com', role: 'customer', phone: '+79995678901' },
]);
let orders: Order[] = getData<Order>('app_orders', [
    // FIX: Changed order item status from 'delivered' to 'shipped' to match the 'OrderItemStatus' type definition.
    { id: 'ord1', orderNumber: 1, userId: '1', items: [{...mockProducts[0], quantity: 1, status: 'shipped'}, {...mockProducts[2], quantity: 2, status: 'cancelled'}], total: 8100, status: 'delivered', createdAt: new Date('2023-10-20T14:48:00.000Z').toISOString(), customerName: 'Иван Иванов' },
    { id: 'ord2', orderNumber: 2, userId: '1', items: [{...mockProducts[4], quantity: 1, status: 'shipped'}], total: 990, status: 'processing', createdAt: new Date('2023-10-25T10:30:00.000Z').toISOString(), customerName: 'Иван Иванов' },
    { id: 'ord3', orderNumber: 3, userId: '1', items: [{...mockProducts[1], quantity: 1, status: 'available'}], total: 850.50, status: 'pending', createdAt: new Date('2023-10-25T11:00:00.000Z').toISOString(), customerName: 'Иван Иванов' },
    { id: 'ord4', orderNumber: 4, userId: '5', items: [{...mockProducts[3], quantity: 1, status: 'shipped'}, {...mockProducts[5], quantity: 1, status: 'shipped'}], total: 4050.99, status: 'shipped', createdAt: new Date('2023-10-26T09:00:00.000Z').toISOString(), customerName: 'Елена Сидорова' },
]);
let vehicles: Vehicle[] = getData<Vehicle>('app_vehicles', [
    { id: 'v1', userId: '1', make: 'Toyota', model: 'Camry', year: 2021, vin: 'JT1234567890' }
]);
let notifications: Notification[] = getData<Notification>('app_notifications', []);
let importHistory: ImportLogEntry[] = getData<ImportLogEntry>('app_import_history', []);
let pages: Page[] = getData<Page>('app_pages', [
    { id: 1, title: 'О нас', slug: 'about', content: [{id: generateId(), type: 'text', content: 'Мы - лучший магазин автозапчастей!'}], showInHeader: true, showInFooter: true },
    { id: 2, title: 'Доставка', slug: 'delivery', content: [{id: generateId(), type: 'text', content: 'Информация о доставке...'}], showInHeader: true, showInFooter: true },
    { id: 3, title: 'тест', slug: 'test', content: [
        {
            id: generateId(),
            type: 'columns',
            columnCount: 2,
            columns: [
                {
                    id: generateId(),
                    blocks: [
                        {
                            id: generateId(),
                            type: 'image',
                            src: 'https://images.unsplash.com/photo-1517423568366-8b83523034fd?q=80&w=800&auto=format&fit=crop',
                            alt: 'Собака в очках'
                        }
                    ]
                },
                {
                    id: generateId(),
                    blocks: [
                        {
                            id: generateId(),
                            type: 'text',
                            content: 'Это текст в правой колонке.\n\nВы можете разместить здесь описание, характеристики или любой другой контент.'
                        },
                        {
                            id: generateId(),
                            type: 'button',
                            text: 'Узнать больше',
                            link: '#',
                            variant: 'outlined'
                        }
                    ]
                }
            ]
        },
        {
            id: generateId(),
            type: 'carousel',
            images: [
                { id: generateId(), src: 'https://images.unsplash.com/photo-1598128558393-70ff21433be0?q=80&w=800&auto=format&fit=crop', alt: 'Автомобиль 1' },
                { id: generateId(), src: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop', alt: 'Автомобиль 2' },
                { id: generateId(), src: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop', alt: 'Автомобиль 3' },
            ]
        }
    ], showInHeader: true, showInFooter: false },
]);
let siteSettings: SiteSettings = getObjectData<SiteSettings>('app_siteSettings', {
    siteName: 'АвтоЗапчасти+',
    logoUrl: '',
    seoTitle: 'АвтоЗапчасти+ | Лучшие запчасти для вашего авто',
    seoDescription: 'Интернет-магазин качественных автозапчастей.',
    seoKeywords: 'автозапчасти, купить запчасти, магазин запчастей',
    contactPhone: '+7 (800) 555-35-35',
    contactEmail: 'info@autozapchasti.com',
    contactAddress: 'г. Москва, ул. Пушкина, д. Колотушкина',
    promoBanners: [
        {
            id: generateId(),
            imageUrl: 'https://images.unsplash.com/photo-1617083222379-a1741065790b?q=80&w=1920&auto=format&fit=crop',
            linkUrl: '#',
            enabled: true,
        },
        {
            id: generateId(),
            imageUrl: 'https://images.unsplash.com/photo-1617096200347-cb04ae465063?q=80&w=1920&auto=format&fit=crop',
            linkUrl: '#',
            enabled: true,
        }
    ],
    promoBannerSpeed: 5,
    promoBannerHeight: 320, // Corresponds to `h-80` in Tailwind (80 * 4 = 320px)
});
let homepageBlocks: HomepageBlock[] = getObjectData<HomepageBlock[]>('app_homepageBlocks', [
    { id: 'promo_banner', title: 'Рекламный баннер', enabled: true },
    { id: 'search', title: 'Поиск по сайту', enabled: true },
    { id: 'categories', title: 'Категории', enabled: true },
    { id: 'featured', title: 'Популярные товары', enabled: true },
    { id: 'news', title: 'Новости', enabled: true },
]);

const simulateDelay = (ms = 200) => new Promise(res => setTimeout(res, ms));


export const api = {
    // --- Auth ---
    login: async (email: string, password: string): Promise<User> => {
        await simulateDelay();
        const user = users.find(u => u.email === email);
        if (!user) throw new Error('Пользователь не найден');
        return user;
    },
    register: async (fullName: string, email: string, password: string): Promise<User> => {
        await simulateDelay();
        if (users.some(u => u.email === email)) throw new Error('Пользователь с таким email уже существует');
        const newUser: User = { id: generateId(), fullName, email, role: 'customer' };
        users.push(newUser);
        saveData('app_users', users);

        // Add notification for admins
        const adminNotification: Notification = {
            id: Date.now(),
            title: 'Новый пользователь',
            message: `Зарегистрировался новый пользователь: ${fullName} (${email}).`,
            read: false,
            date: new Date().toISOString(),
        };
        notifications = [adminNotification, ...notifications];
        saveData('app_notifications', notifications);

        return newUser;
    },
    updateUserProfile: async (userId: string, data: Partial<Omit<User, 'id' | 'email' | 'role'>>): Promise<User> => {
        await simulateDelay();
        let user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        user = { ...user, ...data };
        users = users.map(u => u.id === userId ? user : u);
        saveData('app_users', users);
        return user;
    },
    // --- Data getters ---
    getProducts: async (): Promise<Product[]> => { await simulateDelay(); return products; },
    getCategories: async (): Promise<Category[]> => { await simulateDelay(); return categories; },
    getNews: async (): Promise<NewsArticle[]> => { await simulateDelay(); return news; },
    getPages: async (): Promise<Page[]> => { 
        await simulateDelay(); 
        return [...systemPages, ...pages]; 
    },
    getSiteSettings: async (): Promise<SiteSettings> => { await simulateDelay(); return siteSettings; },
    getHomepageBlocks: async (): Promise<HomepageBlock[]> => { await simulateDelay(); return homepageBlocks; },
    getUsers: async (): Promise<User[]> => { await simulateDelay(); return users; },
    getOrders: async (): Promise<Order[]> => { await simulateDelay(); return orders; },
    getVehicles: async (): Promise<Vehicle[]> => { await simulateDelay(); return vehicles; },
    getNotifications: async (): Promise<Notification[]> => { await simulateDelay(); return notifications; },
    getImportHistory: async (): Promise<ImportLogEntry[]> => { await simulateDelay(); return importHistory; },
    
    // --- User Actions ---
    placeOrder: async (userId: string, orderData: { items: CartItem[], total: number }): Promise<Order> => {
        await simulateDelay(400); // Simulate network latency for a critical operation
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error("User not found");

        // --- Stock Deduction Logic ---
        // 1. Validate stock for all items first to prevent partial deductions
        for (const item of orderData.items) {
            const product = products.find(p => p.id === item.id);
            if (!product) {
                throw new Error(`Товар "${item.name}" не найден на складе.`);
            }
            if (!product.inStock || (product.stockQuantity ?? 0) < item.quantity) {
                throw new Error(`Недостаточно товара "${item.name}" на складе. Доступно: ${product.stockQuantity ?? 0}, запрошено: ${item.quantity}.`);
            }
        }

        // 2. If validation passes, deduct stock
        const updatedProducts = products.map(p => {
            const orderItem = orderData.items.find(item => item.id === p.id);
            if (orderItem) {
                const newQuantity = (p.stockQuantity ?? 0) - orderItem.quantity;
                return {
                    ...p,
                    stockQuantity: newQuantity,
                    inStock: newQuantity > 0,
                };
            }
            return p;
        });
        
        // 3. Update the main products array and save
        products = updatedProducts;
        saveData('app_products', products);
        // --- End of Stock Deduction Logic ---

        const newOrder: Order = {
            id: `ord${Date.now()}`,
            orderNumber: orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) + 1 : 1,
            userId,
            items: orderData.items.map(item => ({
                ...item,
                status: 'available' // Since we've checked stock, it's available
            })),
            total: orderData.total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            customerName: user.fullName,
        };
        orders = [newOrder, ...orders];
        saveData('app_orders', orders);

        // Add notification for admins
        const adminNotification: Notification = {
            id: Date.now(),
            title: `Новый заказ #${newOrder.orderNumber}`,
            message: `Клиент ${user.fullName} оформил заказ на сумму ${newOrder.total.toFixed(2)} ₽.`,
            read: false,
            date: new Date().toISOString(),
        };
        notifications = [adminNotification, ...notifications];
        saveData('app_notifications', notifications);

        return newOrder;
    },
    addVehicle: async (userId: string, vehicleData: Omit<Vehicle, 'id' | 'userId'>): Promise<Vehicle> => {
        await simulateDelay();
        const newVehicle: Vehicle = { id: generateId(), userId, ...vehicleData };
        vehicles.push(newVehicle);
        saveData('app_vehicles', vehicles);
        return newVehicle;
    },
    deleteVehicle: async (vehicleId: string): Promise<void> => {
        await simulateDelay();
        vehicles = vehicles.filter(v => v.id !== vehicleId);
        saveData('app_vehicles', vehicles);
    },

    markNotificationAsRead: async (id: number): Promise<void> => {
        await simulateDelay(50);
        notifications = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        saveData('app_notifications', notifications);
    },
    
    markAllNotificationsAsRead: async (): Promise<void> => {
        await simulateDelay(100);
        notifications = notifications.map(n => ({ ...n, read: true }));
        saveData('app_notifications', notifications);
    },
    
    // --- Admin Actions ---
    createCustomerByManager: async (data: Omit<User, 'id' | 'role'>): Promise<User> => {
        await simulateDelay();
        if (users.some(u => u.email === data.email)) {
            throw new Error('Пользователь с таким email уже существует');
        }
        const newCustomer: User = {
            id: generateId(),
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            role: 'customer',
        };
        users.unshift(newCustomer);
        saveData('app_users', users);
        return newCustomer;
    },
    createProduct: async (data: Omit<Product, 'id'>): Promise<Product> => {
        await simulateDelay();
        const newProduct: Product = { 
            id: Date.now(), 
            ...data,
            inStock: (data.stockQuantity ?? 0) > 0,
        };
        products = [newProduct, ...products];
        saveData('app_products', products);
        return newProduct;
    },
    updateProduct: async (id: number, data: Omit<Product, 'id'>): Promise<Product> => {
        await simulateDelay();
        const updatedProduct: Product = { 
            id, 
            ...data,
            inStock: (data.stockQuantity ?? 0) > 0,
        };
        products = products.map(p => p.id === id ? updatedProduct : p);
        saveData('app_products', products);
        return updatedProduct;
    },
    deleteProduct: async (id: number): Promise<void> => {
        await simulateDelay();
        products = products.filter(p => p.id !== id);
        saveData('app_products', products);
    },
    batchUpdateProducts: async (data: Omit<Product, 'id'>[]): Promise<void> => {
        await simulateDelay(500); // longer delay for batch operation
        data.forEach(productData => {
            const processedData = {
                ...productData,
                inStock: (productData.stockQuantity ?? 0) > 0,
            };

            const existingProductIndex = products.findIndex(p => p.sku.toLowerCase() === processedData.sku.toLowerCase());
            if (existingProductIndex > -1) {
                // Update existing product
                const existingProduct = products[existingProductIndex];
                products[existingProductIndex] = { ...existingProduct, ...processedData, id: existingProduct.id };
            } else {
                // Create new product
                const newProduct: Product = { id: Date.now() + Math.random(), ...processedData };
                products.unshift(newProduct);
            }
        });
        saveData('app_products', products);
    },
    clearWarehouse: async (): Promise<void> => {
        await simulateDelay(300);
        products = [];
        saveData('app_products', products);
    },
    addImportLog: async (logEntryData: Omit<ImportLogEntry, 'date'>): Promise<void> => {
        await simulateDelay(50);
        const newLogEntry: ImportLogEntry = {
            date: new Date().toISOString(),
            ...logEntryData
        };
        importHistory.push(newLogEntry);
        saveData('app_import_history', importHistory);
    },
    createCategory: async (data: Omit<Category, 'id'>): Promise<Category> => {
        await simulateDelay();
        const newCategory: Category = { id: data.slug, ...data };
        categories = [newCategory, ...categories];
        saveData('app_categories', categories);
        return newCategory;
    },
    updateCategory: async (id: string, data: Omit<Category, 'id'>): Promise<Category> => {
        await simulateDelay();
        const updatedCategory: Category = { id, ...data };
        categories = categories.map(c => c.id === id ? updatedCategory : c);
        saveData('app_categories', categories);
        return updatedCategory;
    },
    deleteCategory: async (id: string): Promise<void> => {
        await simulateDelay();
        categories = categories.filter(c => c.id !== id);
        saveData('app_categories', categories);
    },
    createNews: async (data: Omit<NewsArticle, 'id' | 'createdAt'>): Promise<NewsArticle> => {
        await simulateDelay();
        const newArticle: NewsArticle = { id: Date.now(), createdAt: new Date().toISOString(), ...data };
        news = [newArticle, ...news];
        saveData('app_news', news);
        return newArticle;
    },
    updateNews: async (id: number, data: Omit<NewsArticle, 'id' | 'createdAt'>): Promise<NewsArticle> => {
        await simulateDelay();
        const article = news.find(n => n.id === id);
        if (!article) throw new Error("Article not found");
        const updatedArticle: NewsArticle = { ...article, ...data };
        news = news.map(n => n.id === id ? updatedArticle : n);
        saveData('app_news', news);
        return updatedArticle;
    },
    deleteNews: async (id: number): Promise<void> => {
        await simulateDelay();
        news = news.filter(n => n.id !== id);
        saveData('app_news', news);
    },
    createPage: async (data: Omit<Page, 'id'>): Promise<Page> => {
        await simulateDelay();
        const newPage: Page = { id: Date.now(), ...data };
        pages = [newPage, ...pages];
        saveData('app_pages', pages);
        return newPage;
    },
    updatePage: async (id: number | string, data: Omit<Page, 'id'>): Promise<Page> => {
        await simulateDelay();
        if (typeof id === 'string' && id.startsWith('system_')) {
            const systemPageIndex = systemPages.findIndex(p => p.id === id);
            if (systemPageIndex === -1) {
                throw new Error("Системная страница не найдена.");
            }
            const originalSystemPage = systemPages[systemPageIndex];
            const updatedSystemPage: Page = {
                ...originalSystemPage,
                showInHeader: data.showInHeader,
                showInFooter: data.showInFooter,
            };
            systemPages[systemPageIndex] = updatedSystemPage;
            return updatedSystemPage;
        }
        const updatedPage: Page = { id, ...data, isSystemPage: false };
        pages = pages.map(p => p.id === id ? updatedPage : p);
        saveData('app_pages', pages);
        return updatedPage;
    },
    deletePage: async (id: number | string): Promise<void> => {
        await simulateDelay();
        if (typeof id === 'string' && id.startsWith('system_')) {
            throw new Error("Системные страницы не могут быть удалены.");
        }
        pages = pages.filter(p => p.id !== id);
        saveData('app_pages', pages);
    },
    updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
        await simulateDelay();
        let user = users.find(u => u.id === userId);
        if (!user) throw new Error('User not found');
        user.role = role;
        users = users.map(u => u.id === userId ? user : u);
        saveData('app_users', users);
        return user;
    },
    deleteUser: async (userId: string): Promise<void> => {
        await simulateDelay();
        users = users.filter(u => u.id !== userId);
        saveData('app_users', users);
    },
    updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
        await simulateDelay();
        const order = orders.find(o => o.id === orderId);
        if (!order) throw new Error('Order not found');
        order.status = status;
        orders = orders.map(o => o.id === orderId ? order : o);
        saveData('app_orders', orders);
        return order;
    },
    updateOrderItemStatus: async (orderId: string, productId: number, status: OrderItemStatus): Promise<Order> => {
        await simulateDelay(100);
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) throw new Error('Order not found');
        
        const order = { ...orders[orderIndex] };
        const itemIndex = order.items.findIndex(i => i.id === productId);
        if (itemIndex === -1) throw new Error('Item not found in order');

        const updatedItems = [...order.items];
        updatedItems[itemIndex] = { ...updatedItems[itemIndex], status };
        
        const updatedOrder = { ...order, items: updatedItems };

        orders = orders.map(o => o.id === orderId ? updatedOrder : o);
        saveData('app_orders', orders);
        return updatedOrder;
    },
    updateSiteSettings: async (data: SiteSettings): Promise<SiteSettings> => {
        await simulateDelay();
        siteSettings = data;
        saveData('app_siteSettings', siteSettings);
        return siteSettings;
    },
    updateHomepageBlocks: async (blocks: HomepageBlock[]): Promise<HomepageBlock[]> => {
        await simulateDelay();
        homepageBlocks = blocks;
        saveData('app_homepageBlocks', homepageBlocks);
        return homepageBlocks;
    },
    notifyUser: async (payload: { type: string; userId: string; data: any }): Promise<void> => {
        try {
            // This URL will likely fail locally unless the bot server is running and CORS is configured.
            // This is for demonstration; a real implementation would use environment variables for the URL.
            const botApiUrl = 'http://localhost:3001/api/notify';
            await fetch(botApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } catch (error) {
            console.error('Failed to send notification to bot:', error);
            // We don't throw an error to the user, just log it.
        }
    },
};