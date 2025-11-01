// types.ts

export type UserRole = 'customer' | 'manager' | 'superadmin';

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
  id: number;
  name: string;
  categoryId: string; // From constants.ts
  price: number;
  imageUrl: string;
  description: string;
  sku: string;
  brand: string;
  inStock: boolean;
  analogs: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
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
  id: number;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  createdAt: string;
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    content: string;
    showInHeader: boolean;
    showInFooter: boolean;
}

export interface SiteSettings {
    siteName: string;
    logoUrl: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
}

export interface HomepageBlock {
    id: 'categories' | 'featured' | 'news';
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

// Snackbar types
export type SnackbarSeverity = 'success' | 'error' | 'info';
export interface SnackbarAction {
  label: string;
  onClick: () => void;
}

// AppContext types
export interface AppContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
  
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<Omit<User, 'id' | 'email' | 'role'>>) => Promise<void>;

  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  placeOrder: () => Promise<void>;

  products: Product[];
  categories: Category[];
  news: NewsArticle[];
  pages: Page[];
  users: User[];
  orders: Order[];
  vehicles: Vehicle[];
  notifications: Notification[];
  siteSettings: SiteSettings;
  homepageBlocks: HomepageBlock[];
  
  addVehicle: (vehicleData: Omit<Vehicle, 'id' | 'userId'>) => Promise<void>;
  deleteVehicle: (vehicleId: string) => Promise<void>;

  // Admin functions
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  createProduct: (data: Omit<Product, 'id'>) => Promise<Product>;
  updateProduct: (id: number, data: Omit<Product, 'id'>) => Promise<Product>;
  deleteProduct: (id: number) => Promise<void>;
  
  createCategory: (data: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, data: Omit<Category, 'id'>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  createNews: (data: Omit<NewsArticle, 'id' | 'createdAt'>) => Promise<NewsArticle>;
  updateNews: (id: number, data: Omit<NewsArticle, 'id' | 'createdAt'>) => Promise<NewsArticle>;
  deleteNews: (id: number) => Promise<void>;

  createPage: (data: Omit<Page, 'id'>) => Promise<Page>;
  updatePage: (id: number, data: Omit<Page, 'id'>) => Promise<Page>;
  deletePage: (id: number) => Promise<void>;

  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  updateSiteSettings: (data: SiteSettings) => Promise<SiteSettings>;
  updateHomepageBlocks: (blocks: HomepageBlock[]) => Promise<HomepageBlock[]>;
}