// services/api.ts
import { mockProducts, mockCategories, mockNews } from '../constants';
import { Product, Category, NewsArticle, Page, SiteSettings, HomepageBlock, User, Order, Vehicle, Notification, UserRole, CartItem } from '../types';

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

// --- In-memory data store, initialized from localStorage ---

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
    { id: 'ord1', orderNumber: 1, userId: '1', items: [{...mockProducts[0], quantity: 1}, {...mockProducts[2], quantity: 2}], total: 8100, status: 'delivered', createdAt: new Date('2023-10-20T14:48:00.000Z').toISOString(), customerName: 'Иван Иванов' },
    { id: 'ord2', orderNumber: 2, userId: '1', items: [{...mockProducts[4], quantity: 1}], total: 990, status: 'processing', createdAt: new Date('2023-10-25T10:30:00.000Z').toISOString(), customerName: 'Иван Иванов' },
    { id: 'ord3', orderNumber: 3, userId: '1', items: [{...mockProducts[1], quantity: 1}], total: 850.50, status: 'pending', createdAt: new Date('2023-10-25T11:00:00.000Z').toISOString(), customerName: 'Иван Иванов' },
    { id: 'ord4', orderNumber: 4, userId: '5', items: [{...mockProducts[3], quantity: 1}, {...mockProducts[5], quantity: 1}], total: 4050.99, status: 'shipped', createdAt: new Date('2023-10-26T09:00:00.000Z').toISOString(), customerName: 'Елена Сидорова' },
]);
let vehicles: Vehicle[] = getData<Vehicle>('app_vehicles', [
    { id: 'v1', userId: '1', make: 'Toyota', model: 'Camry', year: 2021, vin: 'JT1234567890' }
]);
let notifications: Notification[] = getData<Notification>('app_notifications', [
    { id: 1, title: 'Заказ #1 доставлен', message: 'Ваш заказ был успешно доставлен.', read: false, date: new Date().toISOString() }
]);
let pages: Page[] = getData<Page>('app_pages', [
    { id: 1, title: 'О нас', slug: 'about', content: 'Мы - лучший магазин автозапчастей!', showInHeader: true, showInFooter: true },
    { id: 2, title: 'Доставка', slug: 'delivery', content: 'Информация о доставке...', showInHeader: false, showInFooter: true },
]);
let siteSettings: SiteSettings = getObjectData<SiteSettings>('app_siteSettings', {
    siteName: 'АвтоЗапчасти+',
    logoUrl: '',
    seoTitle: 'АвтоЗапчасти+ | Лучшие запчасти для вашего авто',
    seoDescription: 'Интернет-магазин качественных автозапчастей.',
    seoKeywords: 'автозапчасти, купить запчасти, магазин запчастей',
});
let homepageBlocks: HomepageBlock[] = getObjectData<HomepageBlock[]>('app_homepageBlocks', [
    { id: 'categories', title: 'Категории', enabled: true },
    { id: 'featured', title: 'Популярные товары', enabled: true },
    { id: 'news', title: 'Новости', enabled: true },
]);

const simulateDelay = (ms = 200) => new Promise(res => setTimeout(res, ms));
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
    getPages: async (): Promise<Page[]> => { await simulateDelay(); return pages; },
    getSiteSettings: async (): Promise<SiteSettings> => { await simulateDelay(); return siteSettings; },
    getHomepageBlocks: async (): Promise<HomepageBlock[]> => { await simulateDelay(); return homepageBlocks; },
    getUsers: async (): Promise<User[]> => { await simulateDelay(); return users; },
    getOrders: async (): Promise<Order[]> => { await simulateDelay(); return orders; },
    getVehicles: async (): Promise<Vehicle[]> => { await simulateDelay(); return vehicles; },
    getNotifications: async (): Promise<Notification[]> => { await simulateDelay(); return notifications; },
    
    // --- User Actions ---
    placeOrder: async (userId: string, orderData: { items: CartItem[], total: number }): Promise<Order> => {
        await simulateDelay();
        const user = users.find(u => u.id === userId);
        if (!user) throw new Error("User not found");
        const newOrder: Order = {
            id: `ord${Date.now()}`,
            orderNumber: orders.length > 0 ? Math.max(...orders.map(o => o.orderNumber)) + 1 : 1,
            userId,
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            customerName: user.fullName,
        };
        orders = [newOrder, ...orders];
        saveData('app_orders', orders);
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
    
    // --- Admin Actions ---
    createProduct: async (data: Omit<Product, 'id'>): Promise<Product> => {
        await simulateDelay();
        const newProduct: Product = { id: Date.now(), ...data };
        products = [newProduct, ...products];
        saveData('app_products', products);
        return newProduct;
    },
    updateProduct: async (id: number, data: Omit<Product, 'id'>): Promise<Product> => {
        await simulateDelay();
        const updatedProduct: Product = { id, ...data };
        products = products.map(p => p.id === id ? updatedProduct : p);
        saveData('app_products', products);
        return updatedProduct;
    },
    deleteProduct: async (id: number): Promise<void> => {
        await simulateDelay();
        products = products.filter(p => p.id !== id);
        saveData('app_products', products);
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
    updatePage: async (id: number, data: Omit<Page, 'id'>): Promise<Page> => {
        await simulateDelay();
        const updatedPage: Page = { id, ...data };
        pages = pages.map(p => p.id === id ? updatedPage : p);
        saveData('app_pages', pages);
        return updatedPage;
    },
    deletePage: async (id: number): Promise<void> => {
        await simulateDelay();
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
