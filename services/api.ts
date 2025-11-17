// services/api.ts
import { db, auth } from './firebase';
import { 
    collection, getDocs, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
    writeBatch, runTransaction, query, where, documentId, getCountFromServer
} from 'firebase/firestore';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut 
} from 'firebase/auth';


import { mockProducts, mockCategories, mockNews } from '../constants';
import { Product, Category, NewsArticle, Page, SiteSettings, HomepageBlock, User, Order, Vehicle, Notification, UserRole, CartItem, ImportLogEntry, OrderItemStatus } from '../types';

// --- Helper to convert Firestore doc to our types ---
const fromDoc = <T>(d: any): T => ({ ...d.data(), id: d.id } as T);
const fromDocs = <T>(snapshot: any): T[] => snapshot.docs.map((d: any) => fromDoc<T>(d));

export const api = {
    // --- Auth ---
    login: async (email: string, password: string): Promise<void> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            throw new Error('Неверный email или пароль.');
        }
    },
    register: async (fullName: string, email: string, password: string): Promise<void> => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { uid } = userCredential.user;
            const newUser: Omit<User, 'id'> = { fullName, email, role: 'customer' };
            await setDoc(doc(db, "users", uid), newUser);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Пользователь с таким email уже существует.');
            }
            throw new Error('Ошибка регистрации.');
        }
    },
    logout: async (): Promise<void> => {
        await signOut(auth);
    },
    getUserProfile: async (userId: string): Promise<User | null> => {
        const userDoc = await getDoc(doc(db, "users", userId));
        return userDoc.exists() ? fromDoc<User>(userDoc) : null;
    },
    updateUserProfile: async (userId: string, data: Partial<Omit<User, 'id' | 'email' | 'role'>>): Promise<User> => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, data);
        const updatedDoc = await getDoc(userRef);
        return fromDoc<User>(updatedDoc);
    },

    // --- Data getters ---
    getProducts: async (): Promise<Product[]> => fromDocs(await getDocs(collection(db, "products"))),
    getCategories: async (): Promise<Category[]> => fromDocs(await getDocs(collection(db, "categories"))),
    getNews: async (): Promise<NewsArticle[]> => fromDocs(await getDocs(collection(db, "news"))),
    getPages: async (): Promise<Page[]> => {
        const settings = await api.getSiteSettings();
        const pageConfig = settings?.systemPagesConfig || {};
        
        const systemPages: Page[] = [
            { id: 'system_home', title: 'Главная страница', slug: 'home', content: [], showInHeader: pageConfig.home?.showInHeader ?? true, showInFooter: pageConfig.home?.showInFooter ?? true, isSystemPage: true },
            { id: 'system_catalog', title: 'Каталог', slug: 'catalog', content: [], showInHeader: pageConfig.catalog?.showInHeader ?? true, showInFooter: pageConfig.catalog?.showInFooter ?? true, isSystemPage: true },
            { id: 'system_profile', title: 'Личный кабинет', slug: 'profile', content: [], showInHeader: pageConfig.profile?.showInHeader ?? false, showInFooter: pageConfig.profile?.showInFooter ?? true, isSystemPage: true },
            { id: 'system_news', title: 'Новости', slug: 'news', content: [], showInHeader: pageConfig.news?.showInHeader ?? true, showInFooter: pageConfig.news?.showInFooter ?? true, isSystemPage: true },
            { id: 'system_contacts', title: 'Контакты', slug: 'contacts', content: [], showInHeader: pageConfig.contacts?.showInHeader ?? false, showInFooter: pageConfig.contacts?.showInFooter ?? true, isSystemPage: true },
        ];
        
        const customPages = fromDocs<Page>(await getDocs(collection(db, "pages")));
        return [...systemPages, ...customPages];
    },
    getSiteSettings: async (): Promise<SiteSettings | null> => {
        const settingsDoc = await getDoc(doc(db, "settings", "site"));
        if (settingsDoc.exists()) {
            return settingsDoc.data() as SiteSettings;
        }
        return null;
    },
    getHomepageBlocks: async (): Promise<HomepageBlock[]> => {
        const blocksDoc = await getDoc(doc(db, "settings", "homepage"));
        if (blocksDoc.exists()) {
            return blocksDoc.data().blocks as HomepageBlock[];
        }
        return [
            { id: 'promo_banner', title: 'Рекламный баннер', enabled: true },
            { id: 'search', title: 'Поиск по сайту', enabled: true },
            { id: 'categories', title: 'Категории', enabled: true },
            { id: 'featured', title: 'Популярные товары', enabled: true },
            { id: 'news', title: 'Новости', enabled: true },
        ];
    },
    getUsers: async (): Promise<User[]> => fromDocs(await getDocs(collection(db, "users"))),
    getOrders: async (): Promise<Order[]> => fromDocs(await getDocs(collection(db, "orders"))),
    getVehicles: async (): Promise<Vehicle[]> => fromDocs(await getDocs(collection(db, "vehicles"))),
    getNotifications: async (): Promise<Notification[]> => fromDocs(await getDocs(collection(db, "notifications"))),
    getImportHistory: async (): Promise<ImportLogEntry[]> => fromDocs(await getDocs(collection(db, "importHistory"))),
    
    // --- User Actions ---
    placeOrder: async (userId: string, orderData: { items: CartItem[], total: number }): Promise<Order> => {
       return await runTransaction(db, async (transaction) => {
            // --- 1. ALL READS ---
            const userRef = doc(db, "users", userId);
            const ordersCounterRef = doc(db, "counters", "orders");
            const productRefs = orderData.items.map(item => doc(db, "products", item.id));

            const docsToRead = [
                transaction.get(userRef),
                transaction.get(ordersCounterRef),
                ...productRefs.map(ref => transaction.get(ref))
            ];
            
            const [userDoc, counterDoc, ...productDocs] = await Promise.all(docsToRead);

            // --- 2. VALIDATION ---
            if (!userDoc.exists()) {
                throw new Error("Пользователь не найден.");
            }

            const validationErrors: string[] = [];
            const updatedStockData: { ref: any, newQuantity: number }[] = [];

            for (let i = 0; i < orderData.items.length; i++) {
                const item = orderData.items[i];
                const productDoc = productDocs[i];
                
                if (!productDoc.exists()) {
                    validationErrors.push(`Товар "${item.name}" не найден.`);
                    continue; // continue to find all missing products
                }

                const productData = productDoc.data() as Product;
                const currentQuantity = productData.stockQuantity ?? 0;
                
                if (!productData.inStock || currentQuantity < item.quantity) {
                    validationErrors.push(`Недостаточно товара "${item.name}" на складе. В наличии: ${currentQuantity}, требуется: ${item.quantity}.`);
                }

                updatedStockData.push({
                    ref: productRefs[i],
                    newQuantity: currentQuantity - item.quantity,
                });
            }

            if (validationErrors.length > 0) {
                // Combine all errors into one message
                throw new Error(validationErrors.join('\n'));
            }

            // --- 3. ALL WRITES ---
            
            // Update product stocks
            for (const stockUpdate of updatedStockData) {
                transaction.update(stockUpdate.ref, {
                    stockQuantity: stockUpdate.newQuantity,
                    inStock: stockUpdate.newQuantity > 0,
                });
            }
            
            // Update order counter
            const newOrderNumber = (counterDoc.data()?.count || 0) + 1;
            transaction.set(ordersCounterRef, { count: newOrderNumber }, { merge: true });

            // Create new order
            const newOrderRef = doc(collection(db, "orders"));
            const newOrder: Omit<Order, 'id'> = {
                orderNumber: newOrderNumber,
                userId,
                items: orderData.items,
                total: orderData.total,
                status: 'pending',
                createdAt: new Date().toISOString(),
                customerName: userDoc.data().fullName,
            };
            transaction.set(newOrderRef, newOrder);
            
            // Return the created order object
            return { ...newOrder, id: newOrderRef.id };
        });
    },

    addVehicle: async (userId: string, vehicleData: Omit<Vehicle, 'id' | 'userId'>): Promise<Vehicle> => {
        const docRef = await addDoc(collection(db, "vehicles"), { userId, ...vehicleData });
        return { id: docRef.id, userId, ...vehicleData };
    },
    deleteVehicle: (vehicleId: string): Promise<void> => deleteDoc(doc(db, "vehicles", vehicleId)),
    markNotificationAsRead: (id: number): Promise<void> => updateDoc(doc(db, "notifications", String(id)), { read: true }),
    markAllNotificationsAsRead: async (): Promise<void> => {
        const q = query(collection(db, "notifications"), where("read", "==", false));
        const snapshot = await getDocs(q);
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.update(d.ref, { read: true }));
        await batch.commit();
    },

    // Admin Actions
    seedDatabase: async (): Promise<void> => {
        const productsColl = collection(db, "products");
        const productsSnapshot = await getCountFromServer(productsColl);
        if (productsSnapshot.data().count > 0) {
            throw new Error("База данных уже содержит товары. Посев отменен.");
        }

        const demoUsers = [
            { email: 'admin@example.com', password: 'password', fullName: 'Администратор', role: 'superadmin' as UserRole },
            { email: 'ivan@example.com', password: 'password', fullName: 'Иван Иванов', role: 'customer' as UserRole }
        ];

        if (auth.currentUser) {
            await signOut(auth);
        }

        for (const demoUser of demoUsers) {
            let uid: string;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, demoUser.email, demoUser.password);
                uid = userCredential.user.uid;
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    console.warn(`User ${demoUser.email} already exists. Attempting to sign in to update profile.`);
                    try {
                        const userCredential = await signInWithEmailAndPassword(auth, demoUser.email, demoUser.password);
                        uid = userCredential.user.uid;
                    } catch (loginError: any) {
                        console.error(`Could not sign in as ${demoUser.email}. Their password might have changed.`, loginError);
                        throw new Error(`Демо-пользователь ${demoUser.email} уже существует, но с другим паролем. Удалите этого пользователя в Firebase Authentication и попробуйте снова.`);
                    }
                } else if (error.code === 'auth/configuration-not-found') {
                    throw new Error('Firebase Authentication не включен. В вашей Firebase Console перейдите в раздел Authentication, нажмите "Начать" (Get Started) и включите провайдер "Email/пароль" (Email/Password), после чего попробуйте снова.');
                } else {
                    console.error(`Failed to create demo user ${demoUser.email}:`, error);
                    throw new Error(`Не удалось создать демо-пользователя ${demoUser.email}: ${error.message}`);
                }
            }

            if (uid) {
                const userProfile: Omit<User, 'id'> = {
                    fullName: demoUser.fullName,
                    email: demoUser.email,
                    role: demoUser.role,
                };
                await setDoc(doc(db, "users", uid), userProfile);
            }

            if (auth.currentUser) {
                await signOut(auth);
            }
        }

        const batch = writeBatch(db);
        mockProducts.forEach(product => {
            const docRef = doc(collection(db, "products"));
            batch.set(docRef, product);
        });
        mockCategories.forEach(category => {
            const docRef = doc(db, "categories", category.id);
            batch.set(docRef, category);
        });
        mockNews.forEach(article => {
            const docRef = doc(collection(db, "news"));
            batch.set(docRef, article);
        });

        const defaultSiteSettings: SiteSettings = {
            siteName: 'Zap-z.ru', logoUrl: '', seoTitle: 'Zap-z.ru: Auto Parts Store', seoDescription: 'Интернет-магазин автозапчастей', seoKeywords: 'автозапчасти',
            contactPhone: '+7 (800) 555-35-35', contactEmail: 'support@zap-z.ru', contactAddress: 'г. Москва, ул. Пушкина, д. 1', 
            contactWhatsapp: '+79991234567',
            contactTelegram: 'zapz_support',
            contactMapIframe: `<div style="position:relative;overflow:hidden;border-radius: 8px;"><a href="https://yandex.ru/maps/213/moscow/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:0px;">Москва</a><a href="https://yandex.ru/maps/213/moscow/house/ulitsa_pushkina_1/Z04Ycw5iQUcDQFtvfXt1d3hmYw==/?ll=37.617671%2C55.755819&utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:14px;">Улица Пушкина, 1 на карте Москвы</a><iframe src="https://yandex.ru/map-widget/v1/?ll=37.617671%2C55.755819&house=Z04Ycw5iQUcDQFtvfXt1d3hmYw==&z=17" width="100%" height="400" frameborder="0" allowfullscreen="true" style="position:relative;"></iframe></div>`,
            promoBanners: [], promoBannerSpeed: 5, promoBannerHeight: 320,
            systemPagesConfig: {
                home: { showInHeader: true, showInFooter: true },
                catalog: { showInHeader: true, showInFooter: true },
                profile: { showInHeader: false, showInFooter: true },
                news: { showInHeader: true, showInFooter: true },
                contacts: { showInHeader: false, showInFooter: true },
            },
            companyName: 'ООО "ЗАП-З"',
            ogrn: '1234567890123',
            inn: '1234567890',
        };
        batch.set(doc(db, "settings", "site"), defaultSiteSettings);

        const defaultHomepageBlocks = [
            { id: 'promo_banner', title: 'Рекламный баннер', enabled: true },
            { id: 'search', title: 'Поиск по сайту', enabled: true },
            { id: 'categories', title: 'Категории', enabled: true },
            { id: 'featured', title: 'Популярные товары', enabled: true },
            { id: 'news', title: 'Новости', enabled: true },
        ];
        batch.set(doc(db, "settings", "homepage"), { blocks: defaultHomepageBlocks });

        batch.set(doc(db, "counters", "orders"), { count: 100 });

        await batch.commit();
    },
    createCustomerByManager: async (data: Omit<User, 'id' | 'role'>): Promise<User> => {
        const q = query(collection(db, "users"), where("email", "==", data.email));
        const existing = await getDocs(q);
        if (!existing.empty) throw new Error("Пользователь с таким email уже существует");

        const docRef = await addDoc(collection(db, "users"), { ...data, role: 'customer' });
        return { ...data, role: 'customer', id: docRef.id };
    },
    createProduct: async (data: Omit<Product, 'id'>): Promise<Product> => {
        const docRef = await addDoc(collection(db, "products"), data);
        return { ...data, id: docRef.id };
    },
    updateProduct: async (id: string, data: Partial<Omit<Product, 'id'>>): Promise<Product> => {
        await updateDoc(doc(db, "products", id), data);
        const updatedDoc = await getDoc(doc(db, "products", id));
        return fromDoc<Product>(updatedDoc);
    },
    deleteProduct: (id: string): Promise<void> => deleteDoc(doc(db, "products", id)),
    batchUpdateProducts: async (data: Omit<Product, 'id'>[]): Promise<void> => {
        const batch = writeBatch(db);
        for (const productData of data) {
            const q = query(collection(db, "products"), where("sku", "==", productData.sku));
            const existing = await getDocs(q);
            if (!existing.empty) {
                const docRef = existing.docs[0].ref;
                batch.update(docRef, productData);
            } else {
                const docRef = doc(collection(db, "products"));
                batch.set(docRef, productData);
            }
        }
        await batch.commit();
    },
    clearWarehouse: async (): Promise<void> => {
        const snapshot = await getDocs(collection(db, "products"));
        const batch = writeBatch(db);
        snapshot.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
    },
    addImportLog: async (logEntry: Omit<ImportLogEntry, 'date'>): Promise<void> => {
        await addDoc(collection(db, "importHistory"), { ...logEntry, date: new Date().toISOString() });
    },
    createCategory: async (data: Omit<Category, 'id'>): Promise<Category> => {
        const docRef = doc(db, "categories", data.slug);
        await setDoc(docRef, data);
        return { ...data, id: docRef.id };
    },
    updateCategory: async (id: string, data: Omit<Category, 'id'>): Promise<Category> => {
        await updateDoc(doc(db, "categories", id), data);
        return { ...data, id };
    },
    deleteCategory: (id: string): Promise<void> => deleteDoc(doc(db, "categories", id)),
    createNews: async (data: Omit<NewsArticle, 'id' | 'createdAt'>): Promise<NewsArticle> => {
        const docRef = await addDoc(collection(db, "news"), { ...data, createdAt: new Date().toISOString() });
        return { ...data, id: docRef.id, createdAt: new Date().toISOString() };
    },
    updateNews: async (id: string, data: Partial<Omit<NewsArticle, 'id'>>): Promise<NewsArticle> => {
        await updateDoc(doc(db, "news", id), data);
        const updatedDoc = await getDoc(doc(db, "news", id));
        return fromDoc<NewsArticle>(updatedDoc);
    },
    deleteNews: (id: string): Promise<void> => deleteDoc(doc(db, "news", id)),
    createPage: async (data: Omit<Page, 'id'>): Promise<Page> => {
        const docRef = await addDoc(collection(db, "pages"), data);
        return { ...data, id: docRef.id };
    },
    updatePage: async (id: string, data: Partial<Omit<Page, 'id'>>): Promise<Page> => {
        await updateDoc(doc(db, "pages", id), data);
        const updatedDoc = await getDoc(doc(db, "pages", id));
        return fromDoc<Page>(updatedDoc);
    },
    deletePage: (id: string): Promise<void> => deleteDoc(doc(db, "pages", id)),
    updateUserRole: async (userId: string, role: UserRole): Promise<User> => {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, { role });
        const updatedDoc = await getDoc(userRef);
        return fromDoc<User>(updatedDoc);
    },
    deleteUser: (userId: string): Promise<void> => deleteDoc(doc(db, "users", userId)),
    updateOrderStatus: async (orderId: string, status: Order['status']): Promise<Order> => {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status });
        const updatedDoc = await getDoc(orderRef);
        return fromDoc<Order>(updatedDoc);
    },
    updateOrderItemStatus: async (orderId: string, productId: string, status: OrderItemStatus): Promise<Order> => {
        const orderRef = doc(db, "orders", orderId);
        const orderDoc = await getDoc(orderRef);
        if (!orderDoc.exists()) throw new Error("Order not found");
        const orderData = orderDoc.data() as Order;
        const updatedItems = orderData.items.map(item => item.id === productId ? { ...item, status } : item);
        await updateDoc(orderRef, { items: updatedItems });
        return { ...orderData, id: orderId, items: updatedItems };
    },
    updateSiteSettings: async (data: SiteSettings): Promise<SiteSettings> => {
        await setDoc(doc(db, "settings", "site"), data);
        return data;
    },
    updateHomepageBlocks: async (blocks: HomepageBlock[]): Promise<HomepageBlock[]> => {
        await setDoc(doc(db, "settings", "homepage"), { blocks });
        return blocks;
    },
    notifyUser: async (payload: { type: string; userId: string; data: any }): Promise<void> => {
        // This remains a mock/stub as it points to an external service.
        console.log("Attempting to send notification:", payload);
    },
};