// types.ts

export type UserRole = 'customer' | 'manager' | 'superadmin';
export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  phone?: string;
  telegramId?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string; // From constants.ts
  price: number; // Selling price
  purchasePrice?: number;
  imageUrl: string;
  description: string;
  sku: string;
  brand: string;
  inStock: boolean;
  stockQuantity?: number;
  analogs: string[];
  supplier?: string;
  storageBin?: string;
  arrivalDate?: string; // ISO String
  compatibleVins?: string[];
}

export type OrderItemStatus = 'pending' | 'available' | 'shipped' | 'cancelled';

export interface CartItem extends Product {
  quantity: number;
  status: OrderItemStatus;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  status: OrderItemStatus;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  customerName: string; // For admin view
  // FIX: Added 'orderNumber' to the Order type to match the data model.
  orderNumber: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

// --- Page Content Block Types ---
export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  src: string;
  alt: string;
}

export interface ButtonBlock {
  id: string;
  type: 'button';
  text: string;
  link: string;
  variant: 'contained' | 'outlined';
}

export interface ProductGridBlock {
  id: string;
  type: 'products';
  title: string;
  productIds: string[];
}

export interface ImageCarouselBlock {
    id: string;
    type: 'carousel';
    images: {
        id: string;
        src: string;
        alt: string;
    }[];
}

export interface ColumnsBlock {
    id: string;
    type: 'columns';
    columnCount: 2 | 3 | 4;
    columns: {
        id: string;
        blocks: PageBlock[];
    }[];
}

export interface HtmlBlock {
  id: string;
  type: 'html';
  content: string;
}


export type PageBlock = TextBlock | ImageBlock | ButtonBlock | ProductGridBlock | ImageCarouselBlock | ColumnsBlock | HtmlBlock;


export interface Page {
    id: string;
    title: string;
    slug: string;
    content: PageBlock[];
    showInHeader: boolean;
    showInFooter: boolean;
    isSystemPage?: boolean;
}

export interface PromoBanner {
    id: string;
    imageUrl: string;
    linkUrl: string;
    enabled: boolean;
}

export interface SiteSettings {
    siteName: string;
    logoUrl: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    contactPhone: string;
    contactEmail: string;
    contactAddress: string;
    contactWhatsapp?: string;
    contactTelegram?: string;
    contactMapIframe?: string;
    promoBanners: PromoBanner[];
    promoBannerSpeed: number; // in seconds
    promoBannerHeight: number; // in pixels
    systemPagesConfig?: {
        [slug: string]: { showInHeader: boolean; showInFooter: boolean; };
    };
    companyName?: string;
    ogrn?: string;
    inn?: string;
}

export interface HomepageBlock {
    id: 'categories' | 'featured' | 'news' | 'promo_banner' | 'search';
    title: string;
    enabled: boolean;
}

export interface Vehicle {
    id: string;
    userId: string;
    make: string;
    model: string;
    year: number;
    vin: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    read: boolean;
    date: string;
}

export interface ImportLogEntry {
  date: string; // ISO string
  fileName: string;
  status: 'success' | 'error';
  message: string;
}

// Snackbar types
export type SnackbarSeverity = 'success' | 'error' | 'info';
export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

// AppContext types
export interface AppContextType {
  isDarkMode: boolean;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'email' | 'role'>>) => Promise<void>;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  placeOrder: (customerId?: string) => Promise<void>;

  products: Product[];
  categories: Category[];
  news: NewsArticle[];
  pages: Page[];
  users: User[];
  orders: Order[];
  vehicles: Vehicle[];
  notifications: Notification[];
  markNotificationAsRead: (id: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  siteSettings: SiteSettings | null;
  homepageBlocks: HomepageBlock[];
  
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'userId'>) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;

  // Admin functions
  seedDatabase: () => Promise<void>;
  selfPromoteAdmin: () => Promise<void>;
  createCustomerByManager: (data: Omit<User, 'id' | 'role'>) => Promise<User>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  createProduct: (data: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: string, data: Partial<Omit<Product, 'id'>>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  batchUpdateProducts: (products: Omit<Product, 'id'>[]) => Promise<void>;
  clearWarehouse: () => Promise<void>;
  importHistory: ImportLogEntry[];
  addImportLog: (logEntry: Omit<ImportLogEntry, 'date'>) => Promise<void>;
  
  createCategory: (data: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, data: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  createNews: (data: Omit<NewsArticle, 'id' | 'createdAt'>) => Promise<NewsArticle>;
  updateNews: (id: string, data: Omit<NewsArticle, 'id' | 'createdAt'>) => Promise<NewsArticle>;
  deleteNews: (id: string) => Promise<void>;

  createPage: (data: Omit<Page, 'id'>) => Promise<Page>;
  updatePage: (id: string, data: Omit<Page, 'id'>) => Promise<Page>;
  deletePage: (id: string) => Promise<void>;

  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  updateOrderItemStatus: (orderId: string, productId: string, status: OrderItemStatus) => Promise<Order>;
  updateSiteSettings: (data: SiteSettings) => Promise<SiteSettings>;
  updateHomepageBlocks: (blocks: HomepageBlock[]) => Promise<HomepageBlock[]>;
}